// src/socket.js
import { io } from "socket.io-client";

let socket = null;

export function initSocket(userId) {
  if (socket && socket.connected) {
    console.log("🔌 Socket zaten bağlı, yeniden bağlanmayacak");
    return socket;
  }

  socket = io("http://127.0.0.1:3000");

  socket.on("connect", () => {
    console.log("🔌 Socket.IO bağlandı:", socket.id);
    if (userId) {
      socket.emit("user_login", userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket.IO bağlantısı kesildi:", socket.id);
  });

  return socket;
}


export function getSocket() {
  return socket;
}
