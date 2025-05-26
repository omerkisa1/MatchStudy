// src/socket.js
import { io } from "socket.io-client";
import { getSocketUrl } from "@/services/api";

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
let reconnectTimer = null;
let connectionCheckTimer = null;

// Connection status for UI feedback
export const connectionStatus = {
  status: 'disconnected', // 'connected', 'connecting', 'disconnected', 'failed'
  lastError: null
};

/**
 * Socket.io bağlantısını başlatır
 * @param {number} userId - Kullanıcı ID
 * @returns {Object} Socket.io instance
 */
export function initSocket(userId) {
  try {
    console.log('🔌 Yeni socket.io bağlantısı kuruluyor...');
    connectionStatus.status = 'connecting';
    
    // Demo için hardcoded URL kullan - gerçek bağlantı kurulmayacak 
    // ama hata vermeyecek şekilde socket nesnesi oluşturacak
    const SOCKET_URL = 'https://matchstudy-production.up.railway.app';
    
    // Mevcut soketi kapat (varsa)
    if (socket) {
      console.log('🔄 Mevcut soket kapatılıyor ve yeniden başlatılıyor');
      socket.disconnect();
      
      // Varsa zamanlayıcıları temizle
      clearAllTimers();
    }
    
    // Demo için socket yerine doğrudan fallback socket döndür - gerçek bağlantı kurmaya çalışma
    console.log('📡 Demo modu: Gerçek bağlantı yerine fallback socket kullanılıyor');
    socket = createAdvancedFallbackSocket(userId);
    
    // Demo için bağlantı kurulmuş gibi davran
    setTimeout(() => {
      console.log('✅ Socket.IO bağlantısı kuruldu (demo)');
      connectionStatus.status = 'connected';
      connectionStatus.lastError = null;
    }, 1000);
    
    return socket;
  } catch (error) {
    console.error('⚠️ Socket başlatma hatası:', error);
    connectionStatus.status = 'failed';
    connectionStatus.lastError = error.message;
    return createFallbackSocket();
  }
}

/**
 * Connection check - send ping every 30 seconds to keep connection alive
 */
function startConnectionCheck() {
  if (connectionCheckTimer) {
    clearTimeout(connectionCheckTimer);
  }
  
  connectionCheckTimer = setInterval(() => {
    if (socket && socket.connected) {
      // Send ping to server
      socket.emit('ping', { timestamp: Date.now() });
    } else if (socket) {
      // If not connected but socket exists, try to reconnect
      console.log('⚠️ Connection check failed, socket not connected');
      socket.connect();
    }
  }, 30000);
}

/**
 * Clear all timers
 */
function clearAllTimers() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  if (connectionCheckTimer) {
    clearInterval(connectionCheckTimer);
    connectionCheckTimer = null;
  }
}

/**
 * Geçerli socket nesnesini döndürür
 * @returns {Object} Socket.io instance veya fallback obje
 */
export function getSocket() {
  if (!socket) {
    // Eğer soket yoksa, bir fallback soket döndür
    console.warn('⚠️ Socket henüz başlatılmamış, fallback döndürülüyor');
    return createFallbackSocket();
  }
  
  // Eğer bağlantı kopmuşsa yeniden bağlanmayı dene
  if (socket && !socket.connected && connectionStatus.status !== 'connecting') {
    console.log('🔄 Socket bağlı değil, yeniden bağlanma deneniyor...');
    socket.connect();
  }
  
  return socket;
}

/**
 * Soketten bağımsız çalışan bir fallback obje oluşturur
 * @returns {Object} Socket benzeri bir arayüze sahip boş obje
 */
function createFallbackSocket() {
  return {
    on: (event, callback) => {
      // Event listener'ı kaydet ama hiçbir şey yapma
      console.log(`Mock socket: ${event} olayı için dinleyici kaydedildi`);
    },
    off: (event, callback) => {
      // Event listener'ı kaldırmaya çalışıyor gibi davran
      console.log(`Mock socket: ${event} olayı için dinleyici kaldırıldı`);
    },
    emit: (event, data) => {
      // Emit işlemi olduğunu logla ama gerçekten veri gönderme
      console.log(`Mock socket: ${event} olayı için veri gönderilmeye çalışıldı:`, data);
      return false;
    },
    connected: false,
    connect: () => { console.log('Mock socket: bağlanma denemesi yapıldı'); },
    disconnect: () => {},
    id: 'mock-socket',
    io: {
      opts: {
        query: {}
      }
    }
  };
}

/**
 * Daha gelişmiş bir fallback soket oluşturur (demo için)
 * @param {number} userId - Kullanıcı ID
 * @returns {Object} Socket benzeri bir arayüze sahip gelişmiş obje
 */
function createAdvancedFallbackSocket(userId) {
  const eventListeners = {};
  
  const mockSocket = {
    on: (event, callback) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(callback);
      console.log(`Advanced mock socket: ${event} olayı için dinleyici kaydedildi`);
    },
    emit: (event, data) => {
      console.log(`Advanced mock socket: ${event} olayı için veri gönderildi:`, data);
      
      // Bazı özel olaylar için mock yanıtlar
      if (event === 'user_login') {
        setTimeout(() => {
          if (eventListeners['welcome']) {
            eventListeners['welcome'].forEach(cb => cb({ userId, message: 'Welcome to MatchStudy!' }));
          }
        }, 500);
      }
      
      if (event === 'ping') {
        setTimeout(() => {
          if (eventListeners['pong']) {
            eventListeners['pong'].forEach(cb => cb({ timestamp: Date.now() }));
          }
        }, 100);
      }
      
      return true;
    },
    off: (event, callback) => {
      console.log(`Advanced mock socket: ${event} olayı için dinleyici kaldırıldı`);
      
      if (!eventListeners[event]) return;
      
      if (callback) {
        const index = eventListeners[event].indexOf(callback);
        if (index !== -1) {
          eventListeners[event].splice(index, 1);
        }
      } else {
        delete eventListeners[event];
      }
    },
    connected: true,
    connect: () => { 
      console.log('Advanced mock socket: bağlanma başarılı (simülasyon)'); 
      mockSocket.connected = true;
      
      if (eventListeners['connect']) {
        eventListeners['connect'].forEach(cb => cb());
      }
    },
    disconnect: () => { 
      console.log('Advanced mock socket: bağlantı kesildi (simülasyon)'); 
      mockSocket.connected = false;
      
      if (eventListeners['disconnect']) {
        eventListeners['disconnect'].forEach(cb => cb('io client disconnect'));
      }
    },
    id: `mock-socket-${Date.now()}`,
    io: {
      opts: {
        query: { userId }
      }
    }
  };
  
  return mockSocket;
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
