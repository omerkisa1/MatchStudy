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

    <div class="notifications-list" v-if="filteredNotifications.length > 0">
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
            <span class="notification-time">{{ formatTime(notification.matched_at) }}</span>
          </div>
          <p class="notification-message">
            Gönderen: {{ notification.name }} {{ notification.surname }}<br/>
            Eğitim Seviyesi: {{ notification.education_level }}<br/>
            Kurum: {{ notification.institution }}<br/>
            Süre: {{ notification.duration }}<br/>
            Not: {{ notification.note }}
          </p>
          <div class="notification-actions">
            <button class="action-btn accept" @click="respondToMatch(notification.match_id, 'accepted')">Kabul Et</button>
            <button class="action-btn reject" @click="respondToMatch(notification.match_id, 'rejected')">Reddet</button>
          </div>
        </div>
      </div>
    </div>

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

export default {
  name: 'Notifications',
  setup() {
    const userStore = useUserStore();
    const notifications = ref([]);
    const currentFilter = ref('all');

    const filters = [
      { label: 'Tümü', value: 'all' },
      { label: 'Okunmamış', value: 'unread' },
      { label: 'Çalışma İstekleri', value: 'study' }
    ];

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/matches/notifications/${userStore.id}`);
        notifications.value = response.data.notifications.map(n => ({ ...n, read: false }));
      } catch (error) {
        console.error('Bildirimler alınamadı:', error);
      }
    };

    const formatTime = (timestamp) => {
      const now = new Date();
      const diff = now - new Date(timestamp);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      if (days > 0) return `${days} gün önce`;
      if (hours > 0) return `${hours} saat önce`;
      if (minutes > 0) return `${minutes} dakika önce`;
      return 'Az önce';
    };

    const markAllAsRead = () => {
      notifications.value = notifications.value.map(n => ({ ...n, read: true }));
    };

    const respondToMatch = async (matchId, status) => {
      try {
        await axios.put(`http://localhost:8000/matches/update/${matchId}?status=${status}`);
        notifications.value = notifications.value.map(n => n.match_id === matchId ? { ...n, read: true } : n);
      } catch (error) {
        console.error('Durum güncellenemedi:', error);
      }
    };

    const filteredNotifications = computed(() => {
      return notifications.value.filter(n => {
        if (currentFilter.value === 'all') return true;
        if (currentFilter.value === 'unread') return !n.read;
        if (currentFilter.value === 'study') return true;
        return false;
      });
    });

    const unreadNotifications = computed(() => notifications.value.filter(n => !n.read).length);

    onMounted(() => {
      fetchNotifications();
    });

    return {
      notifications,
      currentFilter,
      filters,
      filteredNotifications,
      unreadNotifications,
      formatTime,
      markAllAsRead,
      respondToMatch
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
