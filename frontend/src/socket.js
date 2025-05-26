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
    
    // Direkt socket URL'sini kullan
    const SOCKET_URL = getSocketUrl();
    
    // Mevcut soketi kapat (varsa)
    if (socket) {
      console.log('🔄 Mevcut soket kapatılıyor ve yeniden başlatılıyor');
      socket.disconnect();
      
      // Varsa zamanlayıcıları temizle
      clearAllTimers();
    }
    
    // Yeni soket bağlantısı - gelişmiş konfigürasyon
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 30000,
      query: { userId },
      forceNew: true,
      autoConnect: true
    });
    
    // Bağlantı olayları
    socket.on('connect', () => {
      console.log('✅ Socket.IO bağlantısı kuruldu');
      connectionStatus.status = 'connected';
      connectionStatus.lastError = null;
      reconnectAttempts = 0;
      
      // Kullanıcı login bildirimi
      if (userId) {
        socket.emit('user_login', userId);
      }
      
      // Bağlantı kontrolü için 30 saniyelik ping zamanlayıcısı
      startConnectionCheck();
    });
    
    socket.on('connect_error', (error) => {
      console.log('🚨 Socket.IO bağlantı hatası:', error.message);
      connectionStatus.status = 'disconnected';
      connectionStatus.lastError = error.message;
      reconnectAttempts++;
      
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log(`⚠️ Maksimum yeniden bağlanma denemesi (${MAX_RECONNECT_ATTEMPTS}) aşıldı.`);
        connectionStatus.status = 'failed';
        
        // 30 saniye sonra tekrar bağlanmayı dene
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            console.log('⏰ 30 saniye sonra yeniden bağlanma denemesi yapılıyor...');
            connectionStatus.status = 'connecting';
            reconnectAttempts = 0;
            initSocket(userId);
          }, 30000);
        }
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO bağlantısı kesildi:', reason);
      connectionStatus.status = 'disconnected';
      
      // Connection check timer'ı durdur
      if (connectionCheckTimer) {
        clearTimeout(connectionCheckTimer);
        connectionCheckTimer = null;
      }
      
      // Başka bir hata olmadıkça, socket.io kendi yeniden bağlanma mekanizmasını kullanacak
      // Ancak transport close, ping timeout gibi durumlarda manuel yeniden bağlanma deneyebiliriz
      if (reason === 'transport close' || reason === 'ping timeout' || reason === 'io server disconnect') {
        // 5 saniye sonra manuel yeniden bağlanma dene
        setTimeout(() => {
          if (!socket || !socket.connected) {
            console.log('🔄 Manuel yeniden bağlanma deneniyor...');
            connectionStatus.status = 'connecting';
            initSocket(userId);
          }
        }, 5000);
      }
    });
    
    // Hata olayı
    socket.on('error', (error) => {
      console.error('💥 Socket.IO hatası:', error);
      connectionStatus.lastError = error.message || 'Unknown error';
    });
    
    // Pong olayı - server'dan ping yanıtı
    socket.on('pong', () => {
      console.log('📡 Server pong yanıtı alındı');
    });
    
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
