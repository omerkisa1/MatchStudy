<template>
  <div class="content-wrapper">
    <h1>Mesajlar</h1>

    <!-- Hiç eşleşme yoksa -->
    <p v-if="uniqueMatchedUsers.length === 0" class="no-matches">
      Henüz onaylanmış bir eşleşmeniz bulunmuyor. Onaylı eşleşmeler burada görünecektir.
    </p>

    <!-- Eşleşmeler varsa -->
    <div v-else class="messages-container">
      <!-- Kullanıcı listesi -->
      <div class="message-list">
        <div
          v-for="user in uniqueMatchedUsers"
          :key="user.userId"
          class="message-item"
          :class="{ 'active': selectedUserId === user.userId }"
          @click="selectUserAndLoadMessages(user)"
        >
          <div class="message-avatar"></div>

          <div class="message-content">
            <h4>{{ user.displayName }}</h4>
            <p class="last-message-preview">
              {{ user.lastMessage || 'Henüz mesaj yok.' }}
            </p>
          </div>

          <div class="message-info">
            <span v-if="user.unreadCount > 0" class="unread-badge">
              {{ user.unreadCount }}
            </span>
            <span class="message-time">
              {{ user.lastMessageTime || '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Sohbet ekranı -->
      <div v-if="selectedUserId" class="chat-window">
        <div v-if="isLoadingChat" class="loading-chat">
          <p>Mesajlar yükleniyor...</p>
        </div>

        <template v-else>
          <!-- Başlık -->
          <div class="chat-header">
            <div class="user-info">
              <h3>{{ selectedUserName }}</h3>
              <p v-if="userInfoCache[selectedUserId]" class="user-meta">
                {{ userInfoCache[selectedUserId].age }} yaş |
                {{ userInfoCache[selectedUserId].education_level }}
              </p>
            </div>

            <div class="header-actions">
              <button 
                v-if="!friendshipStatus[selectedUserId]" 
                @click="sendFriendRequest" 
                class="friend-button"
              >
                Arkadaşlık İsteği Gönder
              </button>
              <div v-else-if="friendshipStatus[selectedUserId] === 'pending'" class="friend-status pending">
                Arkadaşlık İsteği Gönderildi
              </div>
              <div v-else-if="friendshipStatus[selectedUserId] === 'accepted'" class="friend-status accepted">
                Arkadaşsınız
              </div>
              <div v-else-if="friendshipStatus[selectedUserId] === 'rejected'" class="friend-status rejected">
                İstek Reddedildi
              </div>
              <div v-else-if="friendshipStatus[selectedUserId] === 'blocked'" class="friend-status blocked">
                Engellendi
              </div>

              <button @click="showDeleteConfirm" class="delete-button" title="Bu sohbeti sil">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Mesajlar -->
          <div class="messages" ref="messagesContainer">
            <div v-if="messages.length === 0" class="no-messages">
              <p>Henüz mesaj bulunmuyor. İlk mesajı göndermeye ne dersin?</p>
            </div>

            <div
              v-else
              v-for="(msg, i) in messages"
              :key="i"
              class="single-message"
              :class="{ 'own-message': msg.sender_id === currentUser }"
            >
              <div class="message-content">{{ msg.content }}</div>
              <div class="message-time">{{ formatMessageTime(msg.sent_at) }}</div>
            </div>
          </div>

          <!-- Mesaj yazma -->
          <div class="chat-input">
            <div v-if="friendshipStatus[selectedUserId] === 'blocked'" class="message-disabled">
              <p>Bu kullanıcı engellenmiş durumda. Mesaj gönderemezsiniz.</p>
            </div>
            <div v-else-if="friendshipStatus[selectedUserId] === 'rejected'" class="message-disabled">
              <p>Bu kullanıcıyla arkadaş değilsiniz. Mesaj gönderebilmek için arkadaş olmanız gerekiyor.</p>
            </div>
            <template v-else>
              <input 
                v-model="newMessage" 
                placeholder="Mesaj yaz..." 
                @keyup.enter="sendMessage" 
              />
              <button @click="sendMessage" :disabled="!newMessage.trim()">
                Gönder
              </button>
            </template>
          </div>
        </template>
      </div>

      <!-- Henüz kimse seçilmediyse -->
      <div v-else-if="uniqueMatchedUsers.length > 0" class="chat-placeholder">
        <p>Bir sohbet başlatmak için soldaki listeden bir kişi seçin</p>
      </div>
    </div>

    <!-- Onay Kutusu -->
    <ConfirmDialog 
      ref="confirmDialog"
      title="Sohbeti Sil"
      message="Bu sohbeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      @confirm="hideChat"
    />

    <!-- Toast Bildirimleri -->
    <ToastNotification ref="toast" />
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useMatchesStore } from '@/stores/matchesStore'
import { useUserStore } from '@/stores/userStore'
import { getSocket, initSocket } from '@/socket'
import { chatApi, userApi, friendRequestsApi } from '@/services/api'
let socket;
import ConfirmDialog from './ConfirmDialog.vue'
import ToastNotification from './ToastNotification.vue'

const matchesStore = useMatchesStore()
const userStore = useUserStore()
const confirmDialog = ref(null)
const toast = ref(null)

const acceptedMatches = computed(() => matchesStore.acceptedMatches)
const currentUser = computed(() => userStore.id)

// Benzersiz kullanıcılar listesi
const uniqueMatchedUsers = ref([])

// Hata durumu bilgisini tutalım
const apiError = ref(false)
const socketConnected = ref(false)

const selectedMatchId = computed(() => matchesStore.selectedMatchId)
const selectedUserId = ref(null);
const selectedUserName = computed(() => {
  if (!selectedUserId.value) return '';
  const user = uniqueMatchedUsers.value.find(u => u.userId === selectedUserId.value);
  return user ? user.displayName : '';
});

const selectedChatId = ref(null)
const messages = ref([])
const newMessage = ref('')
const isLoadingChat = ref(false)
const messagesContainer = ref(null)

// Track unread messages counts
const unreadMessages = ref({}) // format: { matchId: count }

// Kullanıcı bilgilerini tutan obje
const userInfoCache = ref({});

// Arkadaşlık durumunu tutan obje
const friendshipStatus = ref({});

// Socket yönetimi - başlatma ve yeniden bağlanma
function setupSocket() {
  // Make sure currentUser is available
  if (!currentUser.value) {
    console.warn('Socket kurulumu için kullanıcı ID gerekli');
    return;
  }
  
  socket = getSocket();
  
  if (!socket.connected) {
    // Socket bağlantısı yoksa, yeniden bağlanmayı dene
    socket = initSocket(currentUser.value);
    
    // Demo modunda bir kez login olayı göndermemiz gerekiyor
    // (Gerçek socket ile login_confirmed olayı otomatik tetiklenir)
    setTimeout(() => {
      if (socket && socket.connected) {
        socket.emit('user_login', currentUser.value);
      }
    }, 500);
  }
  
  // Yeni mesaj geldiğinde socket üzerinden ekle
  socket.on('new_message', handleNewMessage);
  
  // Socket bağlantı durumunu takip et
  socket.on('connect', () => {
    socketConnected.value = true;
    if (currentUser.value) {
      socket.emit('user_login', currentUser.value);
    }
  });
  
  socket.on('disconnect', () => {
    socketConnected.value = false;
  });
  
  socket.on('connect_error', () => {
    socketConnected.value = false;
  });
}

// Yeni mesaj işleyicisi
function handleNewMessage(msg) {
  // Eğer bu mesajı kendimiz göndermişsek ve zaten UI'da gösteriyorsak, tekrar ekleme
  if (msg.sender_id === currentUser.value) {
    // Sadece son mesaj bilgilerini güncelleyelim
    updateLastMessage(msg)
    return;
  }
  
  if (msg.chat_id === selectedChatId.value) {
    messages.value.push(msg)
    markMessagesAsRead(msg.chat_id)
    scrollToBottom()
    // Son mesajı güncelle
    updateLastMessage(msg)
  } else {
    // Diğer sohbetlerden gelen mesajları okunmamış olarak işaretle
    if (!unreadMessages.value[msg.chat_id]) {
      unreadMessages.value[msg.chat_id] = 0
    }
    unreadMessages.value[msg.chat_id]++
    // Toplam okunmamış mesaj sayacını da artır
    userStore.incrementUnreadMessages()
    // Son mesajı güncelle
    updateLastMessage(msg)
  }
}

// Kullanıcı bilgilerini getir
async function fetchUserInfo(userId) {
  if (userInfoCache.value[userId]) return;
  
  try {
    const data = await userApi.getUser(userId);
    
    if (data.user) {
      userInfoCache.value[userId] = data.user;
      
      // Kullanıcı listesindeki displayName'i güncelle
      const user = uniqueMatchedUsers.value.find(u => u.userId === userId);
      if (user) {
        user.displayName = `${data.user.name} ${data.user.surname}`;
      }
    }
  } catch (error) {
    console.error("Kullanıcı bilgileri alınamadı:", error);
    if (toast.value) {
      toast.value.error("Kullanıcı bilgileri alınamadı. Lütfen daha sonra tekrar deneyin.");
    }
  }
}

// Arkadaşlık durumunu kontrol et
async function checkFriendshipStatus(userId) {
  try {
    const data = await friendRequestsApi.getFriendRequests(currentUser.value);
    
    if (data.requests && data.requests.length > 0) {
      // Seçili kullanıcıyla ilgili arkadaşlık isteği var mı?
      const friendRequest = data.requests.find(request => 
        (request.sender_id == userId && request.receiver_id == currentUser.value) ||
        (request.sender_id == currentUser.value && request.receiver_id == userId)
      );
      
      if (friendRequest) {
        friendshipStatus.value[userId] = friendRequest.status;
      } else {
        friendshipStatus.value[userId] = null; // Hiç istek yok
      }
    }
  } catch (error) {
    console.error("Arkadaşlık durumu alınamadı:", error);
  }
}

// Son mesajı güncelle
function updateLastMessage(msg) {
  const userId = msg.sender_id === currentUser.value ? msg.receiver_id : msg.sender_id;
  const user = uniqueMatchedUsers.value.find(u => u.userId === userId);
  
  if (user) {
    user.lastMessage = msg.content;
    user.lastMessageTime = formatMessageTime(msg.sent_at);
  }
}

// Eşleşmenin ID'sini al (match_id veya id)
function getMatchId(match) {
  // Backend'den gelen data match_id kullanırken, frontend'de id kullanılabilir
  // Her iki durumu da kontrol edelim
  return match.match_id || match.id;
}

// Okunmamış mesaj sayaçlarını getir
async function fetchUnreadCounts() {
  if (!currentUser.value) return
  
  try {
    const data = await chatApi.getUnreadMessages(currentUser.value);
    
    if (data.success) {
      // Chat ID'leri eşleşme ID'leriyle ilişkilendirmek için tüm sohbetleri dönüyoruz
      // Gerçek uygulamada bu veritabanında daha iyi bir şekilde ilişkilendirilmelidir
      const chatMatchMap = {}
      for (const match of acceptedMatches.value) {
        // requester_id ve responder_id kullanarak karşı tarafı belirle
        const otherId = currentUser.value === match.requester_id ? match.responder_id : match.requester_id
        const chatData = await chatApi.getChat(currentUser.value, otherId);
        
        if (chatData.success) {
          chatMatchMap[chatData.chat_id] = getMatchId(match)
        }
      }
      
      // Okunmamış mesaj sayılarını her eşleşme için ayarla
      let totalUnread = 0
      for (const [chatId, count] of Object.entries(data.unread_counts)) {
        if (chatMatchMap[chatId]) {
          unreadMessages.value[chatMatchMap[chatId]] = count
          totalUnread += count
        }
      }
      
      // Toplam okunmamış mesaj sayısını userStore'a kaydet
      userStore.updateTotalUnreadMessages(totalUnread)
    }
  } catch (err) {
    console.error("Okunmamış mesaj sayıları alınamadı:", err)
  }
}


async function sendFriendRequest() {
  try {
    const senderId = currentUser.value
    const receiverId = selectedUserId.value
    
    const data = await friendRequestsApi.sendFriendRequest(senderId, receiverId);
    
    if (data.success) {
      // Kullanıcıya daha açıklayıcı bir mesaj göster
      if (data.alreadyExists) {
        if (toast.value) {
          toast.value.info('Arkadaşlık isteği zaten gönderilmişti.');
        } else {
          alert('Arkadaşlık isteği zaten gönderilmişti.');
        }
      } else {
        if (toast.value) {
          toast.value.success('Arkadaşlık isteği gönderildi!');
        } else {
          alert('Arkadaşlık isteği gönderildi!');
        }
      }
      
      // Arkadaşlık durumunu güncelle
      friendshipStatus.value[selectedUserId.value] = 'pending';
    } else {
      if (toast.value) {
        toast.value.error('İstek gönderilemedi: ' + (data.detail || 'Bilinmeyen hata'));
      } else {
        alert('İstek gönderilemedi: ' + (data.detail || 'Bilinmeyen hata'));
      }
    }
  } catch (err) {
    console.error("Arkadaşlık isteği gönderilirken hata:", err);
    if (toast.value) {
      toast.value.error('Bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } else {
      alert('Bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    }
  }
}


// Mesajları okundu olarak işaretle
async function markMessagesAsRead(chatId) {
  try {
    // API call to mark messages as read
    try {
      await chatApi.markRead(chatId, currentUser.value);
    } catch (apiError) {
      console.warn("API mesajları okundu işaretleyemedi (demo modunda normal):", apiError);
      // Demo mode - continue even if API fails
    }
    
    // Seçili eşleşmeye ait okunmamış mesajları sıfırla
    if (selectedMatchId.value) {
      // Mevcut sayıyı al
      const currentUnreadCount = unreadMessages.value[selectedMatchId.value] || 0
      
      // Toplam okunmamış mesaj sayısını güncelle
      if (currentUnreadCount > 0) {
        userStore.updateTotalUnreadMessages(userStore.totalUnreadMessages - currentUnreadCount)
      }
      
      // Bu sohbetteki okunmamış mesaj sayısını sıfırla
      unreadMessages.value[selectedMatchId.value] = 0
    }
  } catch (err) {
    console.error("Mesajlar okundu olarak işaretlenemedi:", err)
    // Demo modunda devam et - hata gösterme
  }
}

// İlk açılışta eşleşmeleri ve okunmamış mesaj sayılarını getir
onMounted(async () => {
  // Socket bağlantısını kur
  setupSocket();

  try {
    // Eşleşmeleri çek
    await matchesStore.fetchMatches();
    
    if (acceptedMatches.value.length > 0) {
      const usersMap = new Map();

      // Kullanıcı listesini doldur ve isimlerini getir
      for (const match of acceptedMatches.value) {
        const otherUserId = currentUser.value === match.requester_id
          ? match.responder_id
          : match.requester_id;

        if (!usersMap.has(otherUserId)) {
          const userEntry = {
            userId: otherUserId,
            displayName: `Kullanıcı ${otherUserId}`, // Geçici, sonra güncellenecek
            lastMessage: '', // Bu da dinamik olacak
            lastMessageTime: '',
            unreadCount: 0,
            match
          };

          usersMap.set(otherUserId, userEntry);

          try {
            // 1. Kullanıcı adını getir
            const data = await userApi.getUser(otherUserId);
            if (data.user) {
              userEntry.displayName = `${data.user.name} ${data.user.surname}`;
            }

            // 2. Chat ID'yi al ve son mesajı getir
            const chatData = await chatApi.getChat(currentUser.value, otherUserId);
            if (chatData.success) {
              const chatId = chatData.chat_id;

              const msgData = await chatApi.getLastMessage(chatId);

              if (msgData.success && msgData.message) {
                userEntry.lastMessage = msgData.message.content;
                userEntry.lastMessageTime = formatMessageTime(msgData.message.sent_at);
              }
            }
          } catch (e) {
            console.error('Kullanıcı ya da mesaj bilgisi alınamadı:', e);
          }

          uniqueMatchedUsers.value.push(userEntry);
        }
      }

      // Okunmamış mesaj sayılarını getir
      await fetchUnreadCounts();
    }

    // Arkadaşlık durumlarını getir
    try {
      const data = await friendRequestsApi.getFriendRequests(currentUser.value);

      if (data.requests && data.requests.length > 0) {
        data.requests.forEach(request => {
          const otherUserId = request.sender_id == currentUser.value ? request.receiver_id : request.sender_id;
          friendshipStatus.value[otherUserId] = request.status;
        });
      }
    } catch (error) {
      console.error("Arkadaşlık durumları alınamadı:", error);
      if (toast.value) {
        toast.value.warning("Arkadaşlık durumları yüklenirken bir sorun oluştu.");
      }
    }

    // URL'de bir userId varsa doğrudan o kullanıcıyı aç
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get('userId')
    if (userId) {
      const user = uniqueMatchedUsers.value.find(u => u.userId === parseInt(userId))
      if (user) {
        selectUserAndLoadMessages(user)
      }
    }
  } catch (error) {
    console.error("Mesaj sayfası yüklenirken hata oluştu:", error);
    apiError.value = true;
    if (toast.value) {
      toast.value.error("Veriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
    }
  }
});


   

// Mesajlar değiştiğinde otomatik kaydır
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// İçerik konteynerini aşağı kaydır
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Kullanıcıya tıklanınca yapılacaklar - yeni metot
async function selectUserAndLoadMessages(user) {
  //console.log("Kullanıcı seçildi:", user);
  
  // Seçilen kullanıcıyı ayarla
  selectedUserId.value = user.userId;
  isLoadingChat.value = true;
  
  // Eğer kullanıcı bilgileri henüz alınmadıysa, şimdi al
  if (!userInfoCache.value[user.userId]) {
    await fetchUserInfo(user.userId);
  }
  
  // Arkadaşlık durumunu kontrol et
  await checkFriendshipStatus(user.userId);
  
  try {
    // Chat ID'yi backend'den al veya oluştur
    let chatId = null;
    
    try {
      const data = await chatApi.getChat(currentUser.value, user.userId);
      
      if (data.success) {
        // Varolan chat ID'yi kullan
        chatId = data.chat_id;
      }
    } catch (apiError) {
      console.warn("Chat bilgisi API'den alınamadı:", apiError);
    }
    
    // API çalışmadıysa demo modu için chat ID oluştur
    if (!chatId) {
      const smaller = Math.min(currentUser.value, user.userId);
      const larger = Math.max(currentUser.value, user.userId);
      chatId = `${smaller}_${larger}`;
      console.log("Demo modu için chat ID oluşturuldu:", chatId);
    }
    
    // Chat ID'yi kaydet ve mesajları getir
    selectedChatId.value = chatId;
    await fetchMessages(chatId);
    
    // Bu sohbetteki mesajları okundu olarak işaretle
    await markMessagesAsRead(chatId);
  } catch (err) {
    console.error("Chat bilgisi alınamadı:", err);
    messages.value = [];
  } finally {
    isLoadingChat.value = false;
  }
}

// Mesajları backend'den al
async function fetchMessages(chatId) {
  try {
    let messagesLoaded = false;
    
    try {
      const data = await chatApi.getMessages(chatId);
      
      if (data.success) {
        messages.value = data.messages || [];
        messagesLoaded = true;
      }
    } catch (apiError) {
      console.warn("API üzerinden mesajlar alınamadı:", apiError);
      // Demo modunda devam et
    }
    
    // API başarısız olduysa veya mesaj yoksa ve demo modundaysak, 
    // global mockMessageStorage'dan mesajları al
    if (!messagesLoaded && typeof window !== 'undefined' && window.mockMessageStorage && window.mockMessageStorage.length > 0) {
      console.log("Demo modunda mesajlar mockMessageStorage'dan alınıyor");
      const chatMessages = window.mockMessageStorage.filter(msg => msg.chat_id === chatId);
      
      if (chatMessages.length > 0) {
        messages.value = chatMessages;
        messagesLoaded = true;
      }
    }
    
    // Her durumda mesajları okundu olarak işaretle
    await markMessagesAsRead(chatId);
    
    // Son mesajları güncelle
    if (messages.value.length > 0) {
      const lastMsg = messages.value[messages.value.length - 1];
      updateLastMessage(lastMsg);
    }
  } catch (err) {
    console.error("Mesajlar yüklenemedi:", err);
    messages.value = [];
    // Demo modunda hata gösterme
  }
}

// Mesaj gönder
async function sendMessage() {
  // Mesaj boşsa veya seçili chat yoksa mesaj gönderme
  if (!newMessage.value.trim() || !selectedChatId.value || !selectedUserId.value) return

  // Kullanıcı engellenmiş veya arkadaşlıktan çıkarılmışsa mesaj gönderme
  if (friendshipStatus.value[selectedUserId.value] === 'blocked') {
    toast.value.error('Bu kullanıcı engellenmiş durumda. Mesaj gönderemezsiniz.');
    return;
  }
  
  if (friendshipStatus.value[selectedUserId.value] === 'rejected') {
    toast.value.error('Bu kullanıcıyla arkadaş değilsiniz. Mesaj gönderebilmek için arkadaş olmanız gerekiyor.');
    return;
  }

  const msg = {
    chat_id: selectedChatId.value,
    sender_id: currentUser.value,
    receiver_id: selectedUserId.value,
    content: newMessage.value.trim(),
    sent_at: new Date().toISOString()
  }

  try {
    // Önce kendi UI'mıza ekleyelim
    messages.value.push(msg)
    
    // Mesajı temizle
    newMessage.value = ''
    
    // Otomatik kaydır
    scrollToBottom()
    
    // Socket bağlantımız varsa, socket üzerinden mesaj gönder
    if (socket && socket.connected) {
      socket.emit("send_message", msg);
    }
    
    // Her durumda REST API üzerinden de mesaj gönder
    // (Socket demo modundayken veritabanına kaydedilmesi için)
    try {
      await chatApi.sendMessage(selectedChatId.value, msg);
    } catch (apiError) {
      console.warn("API üzerinden mesaj kaydedilemedi (demo modunda bu normal):", apiError);
      // Demo modunda API hataları uygulama akışını bozmaz
    }
    
    // Mesajı gönderen olarak kendimize ekleyelim
    updateLastMessage(msg);
    
  } catch (error) {
    console.error("Mesaj gönderilirken hata:", error);
    toast.value.error("Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    
    // Hata durumunda, son eklenen mesajı kaldıralım
    messages.value.pop();
  }
}

// Mesaj zamanını formatlama
function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  
  let date;
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Sohbeti gizle/sil onay iletişim kutusunu göster
function showDeleteConfirm() {
  confirmDialog.value.show();
}

// Sohbeti gizle/sil
async function hideChat() {
  if (!selectedChatId.value) return;
  
  try {
    const data = await chatApi.hideChat(selectedChatId.value, currentUser.value);
    
    if (data.success) {
      // Sohbeti listeden kaldır
      const index = uniqueMatchedUsers.value.findIndex(u => u.userId === selectedUserId.value);
      if (index !== -1) {
        uniqueMatchedUsers.value.splice(index, 1);
      }
      
      // Seçili sohbeti temizle
      selectedUserId.value = null;
      selectedChatId.value = null;
      messages.value = [];
      
      // Başarılı toast bildirimi göster
      toast.value.success('Sohbet başarıyla silindi');
    } else {
      // Hata toast bildirimi göster
      toast.value.error('Sohbet silinirken bir hata oluştu: ' + data.message);
    }
  } catch (error) {
    console.error('Sohbet silinirken hata:', error);
    toast.value.error('Sohbet silinirken bir hata oluştu');
  }
}
</script>

<style scoped>
:root {
  --success-color: #4CAF50;
  --danger-color: #F44336;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1rem 2rem;
}

.no-matches {
  text-align: center;
  padding: 2rem;
  background: var(--surface-color);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.messages-container {
  display: flex;
  gap: 1.5rem;
  height: calc(100vh - 200px);
  min-height: 500px;
}

.message-list {
  flex: 1;
  background: var(--surface-color);
  border-radius: 12px;
  overflow-y: auto;
  max-width: 350px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-item {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.message-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.message-item.active {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  border-left: 3px solid var(--primary-color);
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  margin-right: 1rem;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-content h4 {
  margin: 0 0 0.25rem;
  font-weight: 500;
}

.message-content p {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.message-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.message-time {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.unread-badge {
  background-color: var(--primary-color);
  color: white;
  font-size: 0.7rem;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.chat-window {
  flex: 2;
  display: flex;
  flex-direction: column;
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info h3 {
  margin: 0;
  font-weight: 500;
}

.user-meta {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.no-messages {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.single-message {
  margin: 0.5rem 0;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  max-width: 70%;
  align-self: flex-start;
  position: relative;
}

.single-message .message-content {
  word-break: break-word;
}

.single-message .message-time {
  font-size: 0.7rem;
  margin-top: 0.25rem;
  text-align: right;
}

.own-message {
  background: var(--primary-color);
  align-self: flex-end;
  color: white;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
}

.chat-input input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
}

.chat-input button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.chat-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-placeholder {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-color);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Responsive Tasarım */
@media (max-width: 768px) {
  .messages-container {
    flex-direction: column;
    height: auto;
  }
  
  .message-list {
    max-width: 100%;
    max-height: 300px;
  }
  
  .chat-window, .chat-placeholder {
    height: 500px;
  }
}

.friend-button {
  margin-top: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
}

.friend-button:hover {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
}

.friend-status {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background-color: var(--surface-color);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
}

.pending {
  background-color: var(--primary-color);
}

.accepted {
  background-color: var(--success-color);
}

.rejected {
  background-color: var(--danger-color);
}

.blocked {
  background-color: var(--danger-color);
}

.message-disabled {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 0, 0, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  width: 100%;
  text-align: center;
}

.message-disabled p {
  color: var(--danger-color);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: var(--danger-color);
  color: white;
}

</style>
