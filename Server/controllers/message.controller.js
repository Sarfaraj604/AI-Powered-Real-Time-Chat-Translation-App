
import cloudinary from '../lib/cloudinary.js';
import { io } from '../lib/socket.js';
import Message from './../models/message.model.js';
import User from '../models/user.model.js';
import { getReceiverSocketId } from "../lib/socket.js";
import { getLanguageByCode, translateText } from '../lib/translator.js';


export const getUsersForSidebar = async (req, res) => {
    try {
        console.log("User inside getUsersForSidebar:", req.user);

        const loggedInUserId = req.user._id;
        const users = await User.find({_id: {$ne: loggedInUserId}})
          .select("-password")
          .lean();

        const latestMessages = await Message.aggregate([
          {
            $match: {
              $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId },
              ],
            },
          },
          {
            $project: {
              contactId: {
                $cond: [
                  { $eq: ["$senderId", loggedInUserId] },
                  "$receiverId",
                  "$senderId",
                ],
              },
              createdAt: 1,
            },
          },
          {
            $group: {
              _id: "$contactId",
              latestMessageAt: { $max: "$createdAt" },
            },
          },
        ]);

        const latestMessageByUser = new Map(
          latestMessages.map((message) => [
            message._id.toString(),
            message.latestMessageAt,
          ])
        );

        const sortedUsers = users
          .map((user) => ({
            ...user,
            latestMessageAt: latestMessageByUser.get(user._id.toString()) || null,
          }))
          .sort((a, b) => {
            const aTime = new Date(a.latestMessageAt || a.createdAt).getTime();
            const bTime = new Date(b.latestMessageAt || b.createdAt).getTime();
            return bTime - aTime;
          });

        res.status(200).json(sortedUsers);
    } catch (error) {
        console.log("error in getUserForSidebar", error.message);
        res.status(500).json({Message: "Internal server error"});
    }
};

export const getMessages = async (req, res) => {
    try {
        const {id: userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId},
            ],
        });
        res.status(201).json(messages);
    } catch (error) {
        console.log("error in getMessages", error.message);
        res.status(501).json({message: "Internal server error"});
    }
};


export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    console.log("📥 Incoming text:", text);
    console.log("📷 Incoming image:", image?.slice(0, 50));

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat_images",
      });
      imageUrl = uploadResponse.secure_url;
    }
console.log("Uploaded Image URL:", imageUrl);

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
        console.log("Emitting new message:", newMessage);

      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
console.log("Route Hit")
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(501).json({ message: "Internal server error" });
  }
};

export const translateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const targetLanguage = getLanguageByCode(req.body.targetLanguage);
    const currentUserId = req.user._id.toString();

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const isParticipant =
      message.senderId.toString() === currentUserId ||
      message.receiverId.toString() === currentUserId;

    if (!isParticipant) {
      return res.status(403).json({ message: "You cannot translate this message" });
    }

    if (!message.text?.trim()) {
      return res.status(200).json({
        messageId: message._id,
        targetLanguage: targetLanguage.code,
        translatedText: "",
      });
    }

    if (!message.translations) {
      message.translations = new Map();
    }

    const cachedTranslation = message.translations?.get(targetLanguage.code);
    if (cachedTranslation) {
      return res.status(200).json({
        messageId: message._id,
        targetLanguage: targetLanguage.code,
        translatedText: cachedTranslation,
      });
    }

    let translatedText = "";

    try {
      translatedText = await translateText(message.text, targetLanguage.code);
    } catch (error) {
      const isMissingApiKey = error.message.includes("OPENAI_API_KEY");

      return res.status(isMissingApiKey ? 500 : 503).json({
        message: isMissingApiKey
          ? "Server is missing OPENAI_API_KEY. Add it to Server/.env and restart the server."
          : error.message || "Translation is unavailable right now",
      });
    }

    if (!translatedText) {
      return res.status(503).json({ message: "Translation is unavailable right now" });
    }

    message.translations.set(targetLanguage.code, translatedText);
    await message.save();

    res.status(200).json({
      messageId: message._id,
      targetLanguage: targetLanguage.code,
      translatedText,
    });
  } catch (error) {
    console.error("Error in translateMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
