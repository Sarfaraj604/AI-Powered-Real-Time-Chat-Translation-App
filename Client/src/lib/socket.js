import { io } from "socket.io-client";
const Server = import.meta.env.VITE_SERVER_API_URL;

export const socket = io(`${Server}`, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});
