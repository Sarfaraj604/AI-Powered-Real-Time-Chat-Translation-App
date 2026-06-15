
import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { allowedOrigins } from "./cors.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const onlineUsers = new Map();

const getReceiverSocketId = (userId) => {
  return onlineUsers.get(userId);
};

io.on("connection", (socket) => {
  console.log(" A user connected:", socket.id);

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("online-users", Array.from(onlineUsers.keys()));
    console.log(" User disconnected:", socket.id);
  });
});

export { io, app, server, getReceiverSocketId };

