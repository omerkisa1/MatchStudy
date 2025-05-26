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
  
  // Global mock message storage (window scope to persist between user switches)
  // Make sure we're in a browser environment
  if (typeof window !== 'undefined') {
    if (!window.mockMessageStorage) {
      window.mockMessageStorage = [];
    }
  } else {
    // Fallback for non-browser environments
    globalThis.mockMessageStorage = globalThis.mockMessageStorage || [];
  }
  
  // Use the correct storage based on environment
  const messageStorage = typeof window !== 'undefined' ? window.mockMessageStorage : globalThis.mockMessageStorage;
  
  const mockSocket = {
    on: (event, callback) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(callback);
      console.log(`Advanced mock socket: ${event} olayı için dinleyici kaydedildi`);
      
      // If this is a new_message listener, immediately deliver any pending messages for this user
      if (event === 'new_message' && messageStorage.length > 0) {
        setTimeout(() => {
          const userMessages = messageStorage.filter(msg => 
            msg.receiver_id == userId || msg.sender_id == userId
          );
          
          if (userMessages.length > 0) {
            console.log(`Delivering ${userMessages.length} cached messages for user ${userId}`);
            userMessages.forEach(msg => {
              callback(msg);
            });
          }
        }, 1000);
      }
    },
    emit: (event, data) => {
      console.log(`Advanced mock socket: ${event} olayı için veri gönderildi:`, data);
      
      // Handle message sending
      if (event === 'send_message') {
        // Store the message in the mock storage
        messageStorage.push(data);
        
        // Create a unique ID for the message (for demo purposes)
        const messageId = Date.now() + Math.floor(Math.random() * 1000);
        
        // Add additional fields that would normally come from the server
        const enhancedMessage = {
          ...data,
          message_id: messageId,
          read: false,
          delivered: true
        };
        
        // Replace the basic message with the enhanced one
        const msgIndex = messageStorage.findIndex(m => 
          m.chat_id === data.chat_id && 
          m.sender_id === data.sender_id && 
          m.content === data.content && 
          m.sent_at === data.sent_at
        );
        
        if (msgIndex !== -1) {
          messageStorage[msgIndex] = enhancedMessage;
        }
        
        // Notify self about message sent (for UI updates)
        setTimeout(() => {
          if (eventListeners['message_sent']) {
            eventListeners['message_sent'].forEach(cb => cb({
              success: true,
              message_id: messageId,
              chat_id: data.chat_id,
              timestamp: new Date().toISOString()
            }));
          }
          
          // Simulate message delivery to receiver (demo purposes)
          setTimeout(() => {
            // We're simulating both sides since we're in demo mode
            if (eventListeners['new_message']) {
              eventListeners['new_message'].forEach(cb => cb(enhancedMessage));
            }
          }, 500);
        }, 200);
      }
      
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
