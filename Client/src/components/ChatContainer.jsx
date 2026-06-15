import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { X, Image, Send } from "lucide-react";
import toast from "react-hot-toast";

import {
  fetchMessages,
  resetMessageTranslationError,
  sendMessage,
  translateMessage,
} from "../redux_toolkit/slices/messageSlice";
import { setSelectedUser } from "../redux_toolkit/slices/userSlice";

const ChatContainer = () => {
  const dispatch = useDispatch();
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { messages, loading } = useSelector((state) => state.messages);
  const { selectedUser, onlineUsers } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);
  const selectedLanguage = useSelector((state) => state.language.selectedLanguage);

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(fetchMessages(selectedUser._id));
    }
  }, [dispatch, selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    messages.forEach((message) => {
      if (message.text) {
        dispatch(
          translateMessage({
            messageId: message._id,
            targetLanguage: selectedLanguage,
          })
        );
      }
    });
  }, [dispatch, messages, selectedLanguage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRetryTranslation = (messageId) => {
    dispatch(
      resetMessageTranslationError({
        messageId,
        targetLanguage: selectedLanguage,
      })
    );
    dispatch(
      translateMessage({
        messageId,
        targetLanguage: selectedLanguage,
      })
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      dispatch(
        sendMessage({
          receiverId: selectedUser._id,
          text: text.trim(),
          image: imagePreview,
        })
      );

      setText("");
      removeImage();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!selectedUser) return null;

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Chat Header */}
      <div className="p-1 lg:p-2.5 custom-bg border-b border-base-300">
        <div className="flex items-center justify-between custom-text">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>
            <div>
              <h3 className="font-medium custom-text">
                {selectedUser.fullName}
              </h3>
              <p className="text-sm text-base-content/70 custom-text">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <button onClick={() => dispatch(setSelectedUser(null))}>
            <X />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading
          ? Array(6)
              .fill(null)
              .map((_, idx) => (
                <div
                  key={idx}
                  className={`chat ${
                    idx % 2 === 0 ? "chat-start" : "chat-end"
                  }`}
                >
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full">
                      <div className="skeleton w-full h-full rounded-full" />
                    </div>
                  </div>
                  <div className="chat-header mb-1">
                    <div className="skeleton h-4 w-16" />
                  </div>
                  <div className="chat-bubble bg-transparent p-0">
                    <div className="skeleton h-16 w-[200px]" />
                  </div>
                </div>
              ))
          : messages.map((message) => (
              <div
                key={message._id}
                className={`chat ${
                  message.senderId === currentUser._id
                    ? "chat-end"
                    : "chat-start"
                }`}
                ref={messageEndRef}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full">
                    <img
                      src={
                        message.senderId === currentUser._id
                          ? currentUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                </div>
                <div className="chat-bubble custom-input-bg custom-text flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Image"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && (
                    <div className="space-y-1">
                      <p>
                        {message.translations?.[selectedLanguage] ||
                          message.text}
                      </p>
                      {(selectedLanguage !== "en" ||
                        message.translations?.[selectedLanguage]) && (
                        <p className="text-xs opacity-60 border-t border-base-300/50 pt-1">
                          {message.translationStatus?.[selectedLanguage] ===
                          "loading"
                            ? "Translating..."
                            : message.translationStatus?.[selectedLanguage] ===
                              "error"
                            ? message.translationError?.[selectedLanguage] ||
                              "Translation failed"
                            : `Original: ${message.text}`}
                        </p>
                      )}
                      {message.translationStatus?.[selectedLanguage] ===
                        "error" && (
                        <button
                          type="button"
                          className="text-xs underline opacity-80 text-left"
                          onClick={() => handleRetryTranslation(message._id)}
                        >
                          Retry translation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
      </div>

      {/* Message Input */}
      <div className="p-4 w-full border-t border-base-300">
        {imagePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                  flex items-center justify-center"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              className="w-full input input-bordered lg:h-12 rounded-4xl input-sm sm:input-md"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <button
              type="button"
              className={`hidden sm:flex btn custom-bg custom-text lg:btn-lg btn-circle ${
                imagePreview ? "text-emerald-500" : "text-zinc-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={22} />
            </button>
          </div>
          <button
            type="submit"
            className="btn custom-bg custom-text btn-sm lg:btn-lg btn-circle"
            disabled={!text.trim() && !imagePreview}
          >
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;
