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
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';

export default {
  name: "FriendsPage",
  setup() {
    const userStore = useUserStore();
    const friends = ref([]);

    const fetchFriendRequests = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/friend_requests/get_friend_requests?user_id=${userStore.id}`);
        friends.value = response.data.requests.filter(r => r.status === 'accepted');
      } catch (error) {
        console.error("Arkadaşlar alınamadı:", error);
      }
    };

    onMounted(() => {
      fetchFriendRequests();
    });

    return {
      friends
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
</style>
