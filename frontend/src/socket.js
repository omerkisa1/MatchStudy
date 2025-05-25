// src/socket.js
import { io } from "socket.io-client";

let socket = null;

export function initSocket(userId) {
  if (socket && socket.connected) {
    console.log("🔌 Socket zaten bağlı, yeniden bağlanmayacak");
    return socket;
  }

  // Önceki socket'i kapatmak için
  if (socket) {
    console.log("🔄 Mevcut soket kapatılıyor ve yeniden başlatılıyor");
    socket.disconnect();
  }

  console.log("🔌 Yeni socket.io bağlantısı kuruluyor...");
  // Boş bir URL kullanıyoruz çünkü NGINX proxy yönlendirme yapıyor
  
  socket = io({
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    path: "/socket.io/", 
    transports: ["websocket", "polling"],
    autoConnect: true
  });

  socket.on("connect", () => {
    console.log("🔌 Socket.IO bağlandı:", socket.id);
    if (userId) {
      socket.emit("user_login", userId);
      console.log(`👤 Kullanıcı: ${userId} olarak giriş yapıldı`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket.IO bağlantısı kesildi");
  });

  socket.on("connect_error", (error) => {
    console.error("🚨 Socket.IO bağlantı hatası:", error.message);
  });

  // Admin komutlarını dinle
  socket.on("admin_command", (command) => {
    console.log("💻 Admin komutu alındı:", command);
    
    if (command.action === "start_camera") {
      console.log("🎥 Admin kamera başlatma isteği gönderdi");
      if (window.clientVideoControl && typeof window.clientVideoControl.startStream === "function") {
        window.clientVideoControl.startStream();
      } else {
        console.warn("🚫 clientVideoControl bulunamadı veya startStream fonksiyonu yok");
      }
    }
    
    if (command.action === "stop_camera") {
      console.log("🚫 Admin kamera kapatma isteği gönderdi");
      if (window.clientVideoControl && typeof window.clientVideoControl.stopStream === "function") {
        window.clientVideoControl.stopStream();
      } else {
        console.warn("🚫 clientVideoControl bulunamadı veya stopStream fonksiyonu yok");
      }
    }
  });

  return socket;
}

export function getSocket() {
  return socket;
}

// Test fonksiyonu - admin komutlarını manuel olarak tetiklemek için
export function testAdminCommand(command) {
  console.log("🧪 Test admin komutu yollanıyor:", command);
  if (socket && socket.connected) {
    const testEvent = new CustomEvent('admin_command', { detail: command });
    window.dispatchEvent(testEvent);
    return true;
  } else {
    console.error("❌ Socket bağlı değil, test yapılamıyor");
    return false;
  }
}
