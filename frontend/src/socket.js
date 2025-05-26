// src/socket.js
import { io } from "socket.io-client";
import { getSocketUrl } from "@/services/api";

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectTimer = null;

/**
 * Socket.io bağlantısını başlatır
 * @param {number} userId - Kullanıcı ID
 * @returns {Object} Socket.io instance
 */
export function initSocket(userId) {
  try {
    console.log('🔌 Yeni socket.io bağlantısı kuruluyor...');
    
    // Direkt socket URL'sini kullan
    const SOCKET_URL = getSocketUrl();
    
    // Mevcut soketi kapat (varsa)
    if (socket) {
      console.log('🔄 Mevcut soket kapatılıyor ve yeniden başlatılıyor');
      socket.disconnect();
      
      // Varsa zamanlayıcıyı temizle
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    }
    
    // Yeni soket bağlantısı - gelişmiş konfigürasyon
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      query: { userId }
    });
    
    // Bağlantı olayları
    socket.on('connect', () => {
      console.log('✅ Socket.IO bağlantısı kuruldu');
      reconnectAttempts = 0;
      
      // Kullanıcı login bildirimi
      if (userId) {
        socket.emit('user_login', userId);
      }
    });
    
    socket.on('connect_error', (error) => {
      console.log('🚨 Socket.IO bağlantı hatası:', error.message);
      reconnectAttempts++;
      
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log(`⚠️ Maksimum yeniden bağlanma denemesi (${MAX_RECONNECT_ATTEMPTS}) aşıldı.`);
        
        // 30 saniye sonra tekrar bağlanmayı dene
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            console.log('⏰ 30 saniye sonra yeniden bağlanma denemesi yapılıyor...');
            reconnectAttempts = 0;
            initSocket(userId);
            reconnectTimer = null;
          }, 30000);
        }
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO bağlantısı kesildi:', reason);
      
      // Başka bir hata olmadıkça, socket.io kendi yeniden bağlanma mekanizmasını kullanacak
      // Ancak transport close, ping timeout gibi durumlarda manuel yeniden bağlanma deneyebiliriz
      if (reason === 'transport close' || reason === 'ping timeout') {
        // 5 saniye sonra manuel yeniden bağlanma dene
        setTimeout(() => {
          if (!socket.connected) {
            console.log('🔄 Manuel yeniden bağlanma deneniyor...');
            initSocket(userId);
          }
        }, 5000);
      }
    });
    
    // Hata olayı
    socket.on('error', (error) => {
      console.error('💥 Socket.IO hatası:', error);
    });
    
    return socket;
  } catch (error) {
    console.error('⚠️ Socket başlatma hatası:', error);
    return createFallbackSocket();
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
