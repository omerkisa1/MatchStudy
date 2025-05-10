<template>
  <div class="content-wrapper">
    <h1>Mesajlar</h1>
    <p v-if="uniqueMatchedUsers.length === 0" class="no-matches">
      Henüz onaylanmış bir eşleşmeniz bulunmuyor. Onaylı eşleşmeler burada görünecektir.
    </p>

    <div v-else class="messages-container">
      <!-- Eşleşme listesi -->
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
            <p>{{ user.lastMessage }}</p>
          </div>
          <div class="message-info">
            <span v-if="user.unreadCount > 0" class="unread-badge">
              {{ user.unreadCount }}
            </span>
            <span class="message-time">{{ user.lastMessageTime }}</span>
          </div>
        </div>
      </div>

      <!-- Sohbet penceresi -->
      <div v-if="selectedUserId" class="chat-window">
        <div v-if="isLoadingChat" class="loading-chat">
          <p>Mesajlar yükleniyor...</p>
        </div>
        <template v-else>
          <div class="chat-header">
            <div class="user-info">
              <h3>{{ selectedUserName }}</h3>
              <p v-if="userInfoCache[selectedUserId]" class="user-meta">
                {{ userInfoCache[selectedUserId].age }} yaş | {{ userInfoCache[selectedUserId].education_level }}
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
      
      <div v-else-if="uniqueMatchedUsers.length > 0" class="chat-placeholder">
        <p>Bir sohbet başlatmak için soldaki listeden bir kişi seçin</p>
      </div>
    </div>
    
    <!-- Özel Onay İletişim Kutusu -->
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
import socket from '@/socket'
import ConfirmDialog from './ConfirmDialog.vue'
import ToastNotification from './ToastNotification.vue'

const matchesStore = useMatchesStore()
const userStore = useUserStore()
const confirmDialog = ref(null)
const toast = ref(null)

const acceptedMatches = computed(() => matchesStore.acceptedMatches)
const currentUser = computed(() => userStore.id)

// Benzersiz kullanıcılar listesi
const uniqueMatchedUsers = computed(() => {
  const users = new Map(); // Benzersiz kullanıcıları tutmak için Map kullanıyoruz
  
  acceptedMatches.value.forEach(match => {
    // Karşı taraf kullanıcı ID'sini belirle
    const otherUserId = currentUser.value === match.requester_id 
      ? match.responder_id 
      : match.requester_id;
    
    // Bu kullanıcı zaten listeye eklenmiş mi kontrol et
    if (!users.has(otherUserId)) {
      users.set(otherUserId, {
        userId: otherUserId,
        displayName: `Kullanıcı ${otherUserId}`, // Bu geçici olarak kalacak, sonra gerçek isimle değiştirilecek
        lastMessage: 'Son mesaj içeriği burada görünecek...',
        lastMessageTime: '14:30',
        unreadCount: unreadMessages.value[getMatchId(match)] || 0,
        match: match // İlgili eşleşme nesnesini saklayalım
      });
    }
  });
  
  return Array.from(users.values());
});

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

// Kullanıcı bilgilerini getir
async function fetchUserInfo(userId) {
  if (userInfoCache.value[userId]) return;
  
  try {
    const response = await fetch(`http://127.0.0.1:8000/users/user/${userId}`);
    const data = await response.json();
    
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
  }
}

// Arkadaşlık durumunu kontrol et
async function checkFriendshipStatus(userId) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/friend_requests/get_friend_requests?user_id=${currentUser.value}`);
    const data = await response.json();
    
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

// Yeni mesaj geldiğinde socket üzerinden ekle
socket.on('new_message', (msg) => {
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
    // Son mesajı güncelle
    updateLastMessage(msg)
  }
})

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
    const res = await fetch(`http://127.0.0.1:8000/messages/unread/${currentUser.value}`)
    const data = await res.json()
    
    if (data.success) {
      // Chat ID'leri eşleşme ID'leriyle ilişkilendirmek için tüm sohbetleri dönüyoruz
      // Gerçek uygulamada bu veritabanında daha iyi bir şekilde ilişkilendirilmelidir
      const chatMatchMap = {}
      for (const match of acceptedMatches.value) {
        // requester_id ve responder_id kullanarak karşı tarafı belirle
        const otherId = currentUser.value === match.requester_id ? match.responder_id : match.requester_id
        const res = await fetch(`http://127.0.0.1:8000/chat/${currentUser.value}/${otherId}`)
        const chatData = await res.json()
        
        if (chatData.success) {
          chatMatchMap[chatData.chat_id] = getMatchId(match)
        }
      }
      
      // Okunmamış mesaj sayılarını her eşleşme için ayarla
      for (const [chatId, count] of Object.entries(data.unread_counts)) {
        if (chatMatchMap[chatId]) {
          unreadMessages.value[chatMatchMap[chatId]] = count
        }
      }
    }
  } catch (err) {
    console.error("Okunmamış mesaj sayıları alınamadı:", err)
  }
}


async function sendFriendRequest() {
  try {
    const senderId = currentUser.value
    const receiverId = selectedUserId.value
    const res = await fetch(`http://127.0.0.1:8000/friend_requests/send?sender_id=${senderId}&receiver_id=${receiverId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender_id: currentUser.value,
        receiver_id: selectedUserId.value
      })
    })
    
    const data = await res.json()
    if (data.message) {
      alert('Arkadaşlık isteği gönderildi!')
      // Arkadaşlık durumunu güncelle
      friendshipStatus.value[selectedUserId.value] = 'pending';
    } else {
      alert('İstek gönderilemedi: ' + data.detail)
    }
  } catch (err) {
    alert('Bir hata oluştu: ' + err.message)
  }
}


// Mesajları okundu olarak işaretle
async function markMessagesAsRead(chatId) {
  try {
    await fetch('http://127.0.0.1:8000/messages/mark_read_by_chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: currentUser.value
      })
    })
    
    // Seçili eşleşmeye ait okunmamış mesajları sıfırla
    if (selectedMatchId.value) {
      unreadMessages.value[selectedMatchId.value] = 0
    }
  } catch (err) {
    console.error("Mesajlar okundu olarak işaretlenemedi:", err)
  }
}

// İlk açılışta eşleşmeleri ve okunmamış mesaj sayılarını getir
onMounted(async () => {
  console.log("Mesaj sayfası yükleniyor, kullanıcı ID:", currentUser.value);
  
  // Eşleşmeleri getir
  await matchesStore.fetchMatches();
  console.log("Tüm eşleşmeler:", matchesStore.matches);
  console.log("Kabul edilmiş eşleşmeler:", acceptedMatches.value);
  
  // Eşleşme hiç yoksa veya accepted olanlar yoksa uyarı göster
  if (matchesStore.matches.length === 0) {
    console.warn("Hiç eşleşme bulunamadı!");
  } else if (acceptedMatches.value.length === 0) {
    console.warn("Accepted statusünde eşleşme bulunamadı!");
    console.log("Eşleşmelerin statüleri:", matchesStore.matches.map(m => m.status));
  }
  
  await fetchUnreadCounts();
  
  // Tüm eşleşilmiş kullanıcıların bilgilerini getir
  for (const user of uniqueMatchedUsers.value) {
    await fetchUserInfo(user.userId);
  }
  
  // Tüm kullanıcıların arkadaşlık durumunu kontrol et
  try {
    const response = await fetch(`http://127.0.0.1:8000/friend_requests/get_friend_requests?user_id=${currentUser.value}`);
    const data = await response.json();
    
    if (data.requests && data.requests.length > 0) {
      // Tüm arkadaşlık isteklerini döngüye al
      data.requests.forEach(request => {
        const otherUserId = request.sender_id == currentUser.value ? request.receiver_id : request.sender_id;
        friendshipStatus.value[otherUserId] = request.status;
      });
    }
  } catch (error) {
    console.error("Arkadaşlık durumları alınamadı:", error);
  }
  
  console.log("Benzersiz eşleşilen kullanıcılar:", uniqueMatchedUsers.value);
  
  // URL'de bir match ID varsa otomatik olarak o sohbeti aç
  const urlParams = new URLSearchParams(window.location.search)
  const userId = urlParams.get('userId')
  if (userId) {
    // Önce kullanıcı bilgilerini getir
    await fetchUserInfo(parseInt(userId));
    
    const user = uniqueMatchedUsers.value.find(u => u.userId === parseInt(userId))
    if (user) {
      selectUserAndLoadMessages(user)
    }
  }
  
  // Socket bağlantısı kurulduğunda login olayını tetikle
  socket.on('connect', () => {
    if (currentUser.value) {
      socket.emit('user_login', currentUser.value)
    }
  })
})

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
  console.log("Kullanıcı seçildi:", user);
  
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
    // Chat ID yoksa backend'den al veya oluştur
    const res = await fetch(`http://127.0.0.1:8000/chat/${currentUser.value}/${user.userId}`)
    const data = await res.json()
    
    if (data.success) {
      // Varolan chat ID'yi kullan
      selectedChatId.value = data.chat_id
      await fetchMessages(data.chat_id)
      
      // Bu sohbetteki mesajları okundu olarak işaretle
      await markMessagesAsRead(data.chat_id)
    } else {
      // Chat ID yoksa oluştur
      await createNewChat(currentUser.value, user.userId)
    }
  } catch (err) {
    console.error("Chat bilgisi alınamadı:", err)
  } finally {
    isLoadingChat.value = false
  }
}

// Yeni bir chat oluştur
async function createNewChat(user1Id, user2Id) {
  console.log("Chat oluşturuluyor:", user1Id, user2Id);
  try {
    // Benzersiz bir chat ID oluştur
    const chatId = `chat_${user1Id}_${user2Id}_${Date.now()}`
    
    // Backend'e chat oluşturma isteği gönder
    const response = await fetch('http://127.0.0.1:8000/chat/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_1_id: user1Id,
        user_2_id: user2Id,
        chat_id: chatId
      })
    })
    
    const data = await response.json()
    console.log("Chat oluşturma cevabı:", data);
    
    if (data.success) {
      selectedChatId.value = chatId
      messages.value = []
    } else {
      console.error("Chat oluşturulamadı:", data.message)
    }
  } catch (err) {
    console.error("Chat oluşturma hatası:", err)
  }
}

// Mesajları backend'den al
async function fetchMessages(chatId) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/messages/${chatId}`)
    const data = await res.json()
    
    if (data.success) {
      messages.value = data.messages || []
      markMessagesAsRead(chatId)
      
      // Son mesajları güncelle
      if (messages.value.length > 0) {
        const lastMsg = messages.value[messages.value.length - 1];
        updateLastMessage(lastMsg);
      }
    } else {
      messages.value = []
    }
  } catch (err) {
    console.error("Mesajlar yüklenemedi:", err)
    messages.value = []
  }
}

// Mesaj gönder
async function sendMessage() {
  // Mesaj boşsa veya seçili chat yoksa mesaj gönderme
  if (!newMessage.value.trim() || !selectedChatId.value || !selectedUserId.value) return

  // Kullanıcı engellenmiş veya arkadaşlıktan çıkarılmışsa mesaj gönderme
  if (friendshipStatus.value[selectedUserId.value] === 'blocked') {
    alert('Bu kullanıcı engellenmiş durumda. Mesaj gönderemezsiniz.');
    return;
  }
  
  if (friendshipStatus.value[selectedUserId.value] === 'rejected') {
    alert('Bu kullanıcıyla arkadaş değilsiniz. Mesaj gönderebilmek için arkadaş olmanız gerekiyor.');
    return;
  }

  const msg = {
    chat_id: selectedChatId.value,
    sender_id: currentUser.value,
    receiver_id: selectedUserId.value,
    content: newMessage.value.trim(),
    sent_at: new Date().toISOString()
  }

  // Socket üzerinden mesaj gönder (diğer kullanıcı çevrimiçiyse anında alır)
  socket.emit("send_message", msg)
  
  // Kendi UI'mıza da ekleyelim
  messages.value.push(msg)
  
  // Mesajı temizle
  newMessage.value = ''
  
  // Otomatik kaydır
  scrollToBottom()
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
    const response = await fetch(`http://127.0.0.1:8000/chat/hide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: selectedChatId.value,
        user_id: currentUser.value
      })
    });
    
    const data = await response.json();
    
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
