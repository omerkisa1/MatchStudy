<template>
  <div class="friends-container">
    <div class="friends-header">
      <h2>Arkadaşlarım</h2>
    </div>

    <div v-if="friends.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-3-3.87M7 21v-2a4 4 0 0 1 3-3.87M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
      </svg>
      <p>Henüz arkadaşınız yok.</p>
    </div>

    <div class="friends-list">
      <div 
        v-for="friend in friends" 
        :key="friend.id" 
        class="friend-item"
      >
        <div class="friend-icon">👥</div>
        <div class="friend-info">
          <div class="friend-header">
            <span class="friend-name">{{ friend.sender_name }} {{ friend.sender_surname }}</span>
            <p class="friend-meta">
              Yaş: {{ friend.sender_age }} | Eğitim: {{ friend.sender_education_level }}
            </p>
          </div>
        </div>
        <div class="friend-actions">
          <button class="action-btn message" @click="navigateToMessages(friend.sender_id)" title="Mesajlaş">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button class="action-btn block" @click="blockFriend(friend.sender_id)" title="Engelle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
            </svg>
          </button>
          <button class="action-btn unfriend" @click="unfriendUser(friend.sender_id)" title="Arkadaşlıktan Çıkar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="18" y1="8" x2="23" y2="13"/>
              <line x1="23" y1="8" x2="18" y2="13"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: "FriendsPage",
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const friends = ref([]);

    const fetchFriendRequests = async () => {
      try {
        const response = await axios.get(`https://matchstudy-production.up.railway.app/friend_requests/get_friend_requests?user_id=${userStore.id}`);
        friends.value = response.data.requests.filter(r => r.status === 'accepted');
      } catch (error) {
        console.error("Arkadaşlar alınamadı:", error);
      }
    };

    const navigateToMessages = (userId) => {
      // Update the current content in the parent component
      const event = new CustomEvent('navigate', { detail: 'messages' });
      window.dispatchEvent(event);
      
      // Add a small delay to ensure the messages page is loaded
      setTimeout(() => {
        // Then navigate to the specific chat
        router.push({
          path: '/home',
          query: { content: 'messages', userId: userId }
        });
      }, 100);
    };

    const blockFriend = async (userId) => {
      if (!confirm('Bu kullanıcıyı engellemek istediğinize emin misiniz?')) return;
      
      try {
   await axios.post(
      `https://matchstudy-production.up.railway.app/friend_requests/manage`,
      {
        sender_id:   userId,
        receiver_id: userStore.id,
        status:      'blocked'
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
        
        // Engellenen kullanıcıyı listeden kaldır
        friends.value = friends.value.filter(f => f.sender_id !== userId);
      } catch (error) {
        console.error("Kullanıcı engellenemedi:", error);
        alert("Kullanıcı engellenirken bir hata oluştu.");
      }
    };

    const unfriendUser = async (userId) => {
      if (!confirm('Bu kullanıcıyı arkadaş listenizden çıkarmak istediğinize emin misiniz?')) return;
      
      try {
        await axios.post(
          `https://matchstudy-production.up.railway.app/friend_requests/manage`,
          {
            sender_id: userId,
            receiver_id: userStore.id,
            status: 'rejected'
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        
        // Arkadaşlıktan çıkarılan kullanıcıyı listeden kaldır
        friends.value = friends.value.filter(f => f.sender_id !== userId);
      } catch (error) {
        console.error("Arkadaşlıktan çıkarılamadı:", error);
        alert("Arkadaşlıktan çıkarılırken bir hata oluştu.");
      }
    };

    onMounted(() => {
      fetchFriendRequests();
    });

    return {
      friends,
      navigateToMessages,
      blockFriend,
      unfriendUser
    };
  }
};
</script>

<style scoped>
.friends-container {
  max-width: 800px;
  padding: 2rem 2rem 2rem 3rem;
  margin-left: 0;
}

.friends-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 2rem;
}

.friends-header h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0;
}

.friends-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friend-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-color-light);
  border-radius: 12px;
  transition: all 0.3s ease;
  align-items: center;
  max-width: 600px;
}

.friend-icon {
  width: 40px;
  height: 40px;
  background: rgba(126, 87, 194, 0.1);
  color: #7E57C2;
  font-size: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.friend-info {
  flex: 1;
}

.friend-header {
  display: flex;
  flex-direction: column;
}

.friend-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.friend-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
}

.friend-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.message:hover {
  color: #4CAF50;
}

.action-btn.block:hover {
  color: #F44336;
}

.action-btn.unfriend:hover {
  color: #FF9800;
}
</style>
