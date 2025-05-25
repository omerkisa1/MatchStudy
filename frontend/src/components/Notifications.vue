<template>
  <div class="notifications-container">
    <div class="notifications-header">
      <h2>Bildirimler</h2>
      <div class="header-actions">
        <button class="mark-all-read" @click="markAllAsRead" v-if="unreadNotifications > 0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Tümünü Okundu İşaretle
        </button>
      </div>
    </div>

    <div class="notifications-filters">
      <button 
        v-for="filter in filters" 
        :key="filter.value"
        :class="['filter-btn', { active: currentFilter === filter.value }]"
        @click="currentFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Kullanıcının kendi oluşturduğu çalışma istekleri -->
    <div v-if="currentFilter === 'my_requests'" class="notifications-list">
      <div 
        v-for="req in myRequests" 
        :key="req.request_id" 
        class="notification-item"
      >
        <div class="notification-icon system">📘</div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">
              {{ req.topic }} başlıklı isteğin ({{ req.category }})
            </span>
            <p class="notification-time">
              {{ formatTime(req.created_at) }} oluşturuldu
            </p>
          </div>
          <p class="notification-message">
            Eğitim Tarihi: {{ req.study_date }}<br/>
            Süre: {{ req.duration }}<br/>
            Not: {{ req.note }}<br/>
            Durum: 
            <span :style="{ color: req.status === 'matched' ? '#4CAF50' : (req.status === 'cancelled' ? '#F44336' : '#FF9800') }">
              {{ req.status === 'matched' ? 'Eşleşti' : req.status === 'cancelled' ? 'İptal Edildi' : 'Bekliyor' }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Arkadaşlık istekleri -->
    <div class="notifications-list" v-else-if="currentFilter === 'friend_requests'">
      <div 
        v-for="request in friendRequests" 
        :key="request.id" 
        class="notification-item unread"
      >
        <div class="notification-icon system">👥</div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">
              {{ request.sender_name }} {{ request.sender_surname }} sana arkadaşlık isteği gönderdi
            </span>
            <p class="notification-time">
              {{ formatTime(request.created_at) }}
            </p>
          </div>
          <p class="notification-message">
            Yaş: {{ request.sender_age }}<br/>
            Eğitim: {{ request.sender_education_level }}
          </p>

          <div class="notification-actions">
            <template v-if="request.status === 'pending'">
              <button class="action-btn accept" @click="respondToFriendRequest(request.sender_id, 'accepted')">Kabul Et</button>
              <button class="action-btn reject" @click="respondToFriendRequest(request.sender_id, 'rejected')">Reddet</button>
            </template>
            <template v-else-if="request.status === 'accepted'">
              <span style="color: #4CAF50; font-weight: 500;">✅ Kabul Edildi</span>
            </template>
            <template v-else-if="request.status === 'rejected'">
              <span style="color: #F44336; font-weight: 500;">❌ Reddedildi</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Diğer çalışma istekleri ve eşleşmeler -->
    <div class="notifications-list" v-else-if="filteredNotifications.length > 0">
      <div 
        v-for="notification in filteredNotifications" 
        :key="notification.match_id"
        :class="['notification-item', { unread: !notification.read }]"
      >
        <div class="notification-icon study">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">{{ notification.topic }} konusu için eşleşme isteği</span>
            <p class="notification-time">
              <span v-if="notification.status === 'pending'">
                {{ formatTime(notification.matched_at) }} gönderildi
              </span>
              <span v-else>
                {{ formatTime(notification.updated_at) }} {{ notification.status === 'accepted' ? 'kabul edildi' : 'reddedildi' }}
              </span>
            </p>
          </div>
          <p class="notification-message">
            Gönderen: {{ notification.name }} {{ notification.surname }}<br/>
            Konu: {{ notification.topic }}<br/>
            Eğitim Seviyesi: {{ notification.education_level }}<br/>
            Kurum: {{ notification.institution }}<br/>
            Süre: {{ notification.duration }}<br/>
            Not: {{ notification.note }}
          </p>

          <div class="notification-actions" v-if="notification.status === 'pending'">
            <button class="action-btn accept" @click="respondToMatch(notification.match_id, 'accepted')">Kabul Et</button>
            <button class="action-btn reject" @click="respondToMatch(notification.match_id, 'rejected')">Reddet</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hiçbir bildirim yoksa -->
    <div v-else class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <p>Henüz bildirim bulunmuyor</p>
    </div>
  </div>
</template>



<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import { useMatchesStore } from '@/stores/matchesStore';
export default {
  name: 'Notifications',
  setup() {
    const userStore = useUserStore();
    const notifications = ref([]);
    const currentFilter = ref('all');
    const recentActivities = ref([]);
    const matchesStore = useMatchesStore();
    const filters = [
      { label: 'Tümü', value: 'all' },
      { label: 'Arkadaşlık İstekleri', value: 'friend_requests' },
      { label: 'Çalışma İstekleri', value: 'study' },
      { label: 'Son Aktiviteler', value: 'latest' },
      { label: 'Kendi İsteklerim', value: 'my_requests' }
    ];

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/matches/notifications/${userStore.id}`);
        notifications.value = response.data.notifications.map(n => ({ ...n, read: false }));
      } catch (error) {
        console.error('Bildirimler alınamadı:', error);
      }
    };

    const fetchRecentActivities = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/matches/history/${userStore.id}`);
    recentActivities.value = response.data.history.map(n => ({ ...n, read: true })); 
  } catch (error) {
    console.error("Son aktiviteler alınamadı:", error);
  }
};
const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});
const studyMatches = computed(() => {
  return matchesStore.pendingResponderMatches
})
const formatTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  return `${days} gün önce`;
};


    const markAllAsRead = () => {
      notifications.value = notifications.value.map(n => ({ ...n, read: true }));
    };

    const respondToMatch = async (matchId, status) => {
      try {
        await axios.put(`${import.meta.env.VITE_APP_API_URL}/matches/update/${matchId}?status=${status}`);
        notifications.value = notifications.value.map(n => n.match_id === matchId ? { ...n, read: true } : n);
      } catch (error) {
        console.error('Durum güncellenemedi:', error);
      }
    };


    const friendRequests = ref([])
    const fetchFriendRequests = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/friend_requests/get_friend_requests?user_id=${userStore.id}`)
        friendRequests.value = res.data.requests
      } catch (error) {
        console.error("Arkadaşlık istekleri alınamadı:", error)
      }
    }

    const respondToFriendRequest = async (senderId, status) => {
  try {
    await axios.post(`${import.meta.env.VITE_APP_API_URL}/friend_requests/manage?sender_id=${senderId}&receiver_id=${userStore.id}&status=${status}`);
    
    // güncel listeyi yeniden al
    await fetchFriendRequests();
  } catch (error) {
    console.error('Arkadaşlık isteği güncellenemedi:', error);
  }
};


    const filteredNotifications = computed(() => {
  if (currentFilter.value === 'latest') return recentActivities.value;
  if (currentFilter.value === 'my_requests') return myRequests.value;
  if (currentFilter.value === 'friend_requests') return friendRequests.value;
  return notifications.value.filter(n => {
    if (currentFilter.value === 'all') return n.status === 'pending';
    if (currentFilter.value === 'study') return studyMatches.value;
    return false;
  });
});

const myRequests = ref([]);

const fetchMyRequests = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/study_requests/user/${userStore.id}`);
    myRequests.value = response.data.requests;
  } catch (error) {
    console.error("Kullanıcı istekleri alınamadı:", error);
  }
};

    

    onMounted(() => {
      fetchNotifications();
      fetchRecentActivities();
      fetchMyRequests();
      fetchFriendRequests();
    });

    return {
      notifications,
      currentFilter,
      filters,
      filteredNotifications,
      unreadNotifications,
      formatTime,
      markAllAsRead,
      respondToMatch,
      myRequests,
      friendRequests,
      respondToFriendRequest
    };
  }
};
</script>

<style scoped>
.notifications-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.notifications-header h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.mark-all-read {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(126, 87, 194, 0.1);
  border: 1px solid rgba(126, 87, 194, 0.2);
  border-radius: 8px;
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mark-all-read:hover {
  background: rgba(126, 87, 194, 0.15);
  border-color: rgba(126, 87, 194, 0.3);
}

.mark-all-read svg {
  width: 16px;
  height: 16px;
}

.notifications-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-color-light);
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.notification-item.unread {
  background: rgba(126, 87, 194, 0.05);
  border-left: 4px solid var(--primary-color);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.study {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.notification-icon.message {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.notification-icon.system {
  background: rgba(255, 193, 7, 0.1);
  color: #FFC107;
}

.notification-icon svg {
  width: 20px;
  height: 20px;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-title {
  font-weight: 600;
  color: var(--text-primary);
}

.notification-time {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.notification-message {
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.accept {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.action-btn.accept:hover {
  background: rgba(76, 175, 80, 0.2);
}

.action-btn.reject {
  background: rgba(244, 67, 54, 0.1);
  color: #F44336;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.action-btn.reject:hover {
  background: rgba(244, 67, 54, 0.2);
}

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
