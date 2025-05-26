// src/socket.js
import { io } from "socket.io-client";
import { getSocketUrl } from "@/services/api";

let socket = null;

export function initSocket(userId) {
  try {
    console.log('🔌 Yeni socket.io bağlantısı kuruluyor...');
    
    // Direkt socket URL'sini kullan
    const SOCKET_URL = getSocketUrl();
    
    // Mevcut soketi kapat (varsa)
    if (socket) {
      console.log('🔄 Mevcut soket kapatılıyor ve yeniden başlatılıyor');
      socket.disconnect();
    }
    
    // Yeni soket bağlantısı
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      query: { userId }
    });
    
    // Bağlantı olayları
    socket.on('connect', () => {
      console.log('✅ Socket.IO bağlantısı kuruldu');
    });
    
    socket.on('connect_error', (error) => {
      console.log('🚨 Socket.IO bağlantı hatası:', error.message);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO bağlantısı kesildi:', reason);
    });
    
    return socket;
  } catch (error) {
    console.error('⚠️ Socket başlatma hatası:', error);
    return null;
  }
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
