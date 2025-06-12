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
        <button class="reload-btn" @click="reload" title="Yenile">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
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

    <!-- Yükleniyor göstergesi -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Bildirimler yükleniyor...</p>
    </div>

    <!-- Hata durumu -->
    <div v-else-if="hasError" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{{ errorMessage }}</p>
      <button class="retry-btn" @click="reload">Tekrar Dene</button>
    </div>

    <!-- Kullanıcının kendi oluşturduğu çalışma istekleri -->
    <div v-else-if="currentFilter === 'my_requests'" class="notifications-list">
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
          <div class="notification-actions" v-else>
            <template v-if="notification.status === 'accepted'">
              <span style="color: #4CAF50; font-weight: 500;">✅ Kabul Edildi</span>
            </template>
            <template v-else-if="notification.status === 'rejected'">
              <span style="color: #F44336; font-weight: 500;">❌ Reddedildi</span>
            </template>
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
import { useUserStore } from '@/stores/userStore';
import { useMatchesStore } from '@/stores/matchesStore';
import { matchesApi, studyRequestsApi, friendRequestsApi } from '@/services/api';

export default {
  name: 'Notifications',
  setup() {
    const userStore = useUserStore();
    const notifications = ref([]);
    const currentFilter = ref('all');
    const recentActivities = ref([]);
    const matchesStore = useMatchesStore();
    const isLoading = ref(true);
    const hasError = ref(false);
    const errorMessage = ref('');
    
    const filters = [
      { label: 'Tümü', value: 'all' },
      { label: 'Arkadaşlık İstekleri', value: 'friend_requests' },
      { label: 'Çalışma İstekleri', value: 'study' },
      { label: 'Son Aktiviteler', value: 'latest' },
      { label: 'Kendi İsteklerim', value: 'my_requests' }
    ];

const fetchNotifications = async () => {
  try {
    const { notifications: realNotes } = await matchesApi.getNotifications(userStore.id);
    notifications.value = realNotes;
    return true;
  } catch (error) {
    console.error('Bildirimler alınamadı:', error);
    hasError.value = true;
    errorMessage.value = error.message || 'Bildirimler yüklenirken hata oluştu';
    return false;
  }
};


    const fetchRecentActivities = async () => {
      try {
        // Hardcoded direct API call for demo
        const response = await fetch(`https://matchstudy-production.up.railway.app/users/list`);
        if (!response.ok) {
          throw new Error('Son aktiviteler alınamadı');
        }
        const data = await response.json();
        // Demo için boş aktivite dizisi kullan
        recentActivities.value = data.users && data.users.length > 0 ? 
          data.users.slice(0, 3).map(u => ({
            match_id: u.id || Math.random().toString(36).substring(7),
            read: true,
            matched_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString(),
            status: 'accepted',
            name: u.name || 'İsim',
            surname: u.surname || 'Soyisim',
            topic: 'Fizik',
            education_level: u.education_level || 'Lise',
            institution: u.institution || 'Demo Lisesi',
            duration: '1 saat',
            note: 'Demo aktivite'
          })) : [];
        return true;
      } catch (error) {
        console.error("Son aktiviteler alınamadı:", error);
        return false;
      }
    };
    
    const unreadNotifications = computed(() => {
      return notifications.value.filter(n => !n.read).length;
    });
    
    const studyMatches = computed(() => {
      return matchesStore.pendingResponderMatches
    });
    
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      
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
        isLoading.value = true;
        await matchesApi.updateMatch(matchId, status);
        
        // Bildirim durumunu güncelle
        notifications.value = notifications.value.map(n => {
          if (n.match_id === matchId) {
            return { 
              ...n, 
              read: true,
              status: status,
              updated_at: new Date().toISOString()
            };
          }
          return n;
        });
      } catch (error) {
        console.error('Durum güncellenemedi:', error);
        hasError.value = true;
        errorMessage.value = 'Durum güncellenirken bir hata oluştu';
      } finally {
        isLoading.value = false;
      }
    };

    const friendRequests = ref([]);
const fetchFriendRequests = async () => {
  try {
    const { requests } = await friendRequestsApi.getFriendRequests(userStore.id);
    // Sadece bekleyenleri alın:
    friendRequests.value = requests;
  } catch (error) {
    console.error("Arkadaşlık istekleri alınamadı:", error);
    hasError.value = true;
    errorMessage.value = 'Arkadaşlık istekleri yüklenirken hata oluştu';
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
    const { requests } = await studyRequestsApi.getUserRequests(userStore.id);
    myRequests.value = requests;
    return true;
  } catch (error) {
    console.error('Kendi isteklerim yüklenemedi:', error);
    return false;
  }
};


    const loadAllData = async () => {
      isLoading.value = true;
      hasError.value = false;
      errorMessage.value = '';
      
      try {
        // Tüm veri çekme işlemlerini paralel yap
        const results = await Promise.allSettled([
          fetchNotifications(),
          fetchRecentActivities(),
          fetchMyRequests(),
          fetchFriendRequests()
        ]);
        
        // Eğer hepsi başarısız olursa genel bir hata göster
        if (results.every(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === false))) {
          hasError.value = true;
          errorMessage.value = 'Veriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.';
        }
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
        hasError.value = true;
        errorMessage.value = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      loadAllData();
    });

    // Yeniden yükleme fonksiyonu
    const reload = () => {
      loadAllData();
    };

    const respondToFriendRequest = async (senderId, status) => {
      try {
        isLoading.value = true;
        await friendRequestsApi.manageFriendRequest(senderId, userStore.id, status);
        
        // güncel listeyi yeniden al
        await fetchFriendRequests();
      friendRequests.value = friendRequests.value.map(r =>
     r.sender_id === senderId ? { ...r, status } : r
   );
      } catch (error) {
        console.error('Arkadaşlık isteği güncellenemedi:', error);
        hasError.value = true;
        errorMessage.value = 'Arkadaşlık isteği güncellenirken bir hata oluştu';
      } finally {
        isLoading.value = false;
      }
    };

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
      respondToFriendRequest,
      isLoading,
      hasError,
      errorMessage,
      reload
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

.mark-all-read, .reload-btn {
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

.mark-all-read:hover, .reload-btn:hover {
  background: rgba(126, 87, 194, 0.15);
  border-color: rgba(126, 87, 194, 0.3);
}

.mark-all-read svg, .reload-btn svg {
  width: 16px;
  height: 16px;
}

.reload-btn {
  padding: 0.5rem;
}

.notifications-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(126, 87, 194, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s infinite linear;
  margin-bottom: 1rem;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #F44336;
  background: rgba(244, 67, 54, 0.05);
  border-radius: 12px;
}

.error-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  stroke: #F44336;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(244, 67, 54, 0.1);
  color: #F44336;
  border: 1px solid rgba(244, 67, 54, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: rgba(244, 67, 54, 0.2);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style> 
