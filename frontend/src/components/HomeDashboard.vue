<template>
  <div class="content-wrapper">
    <div class="dashboard-welcome">
      <h1>Hoş Geldiniz, {{ userStore.displayName }}</h1>
      <p class="welcome-subtitle">Birlikte öğrenmeye başlamak için bir seçenek seçin</p>
    </div>
    
    <!-- Dashboard Cards -->
    <div class="dashboard-grid">
      <DashboardCard 
        icon="✏️"
        title="Ders İsteği Oluştur"
        description="Öğrenmek istediğiniz konularda eşleşmeler bulmak için ders isteği oluşturun."
        cta="Şimdi Başla →"
        target="create-request"
        :navigateTo="navigateTo"
      />
      
      <DashboardCard 
        icon="🔍"
        title="Keşfet"
        description="Diğer öğrencilerin ders isteklerini keşfedin ve ilgi duyduğunuz konulara katılın."
        cta="Keşfet →"
        target="discover"
        :navigateTo="navigateTo"
      />
      
      <DashboardCard 
        icon="👤"
        title="Profil"
        description="Profilinizi özelleştirin, ilgi alanlarınızı belirtin ve eşleşme şansınızı artırın."
        cta="Profili Düzenle →"
        target="profile"
        :navigateTo="navigateTo"
      />
      
      <DashboardCard 
        icon="🔔"
        title="Bildirimler"
        description="Yeni eşleşmeler ve ders isteği güncellemeleri hakkında bildirimlerinizi görüntüleyin."
        cta="Bildirimleri Gör →"
        target="notifications"
        :navigateTo="navigateTo"
      />
      <DashboardCard 
        icon="👥"
        title="Arkadaşlarım"
        description="Arkadaş listenizi yönetin, yeni arkadaşlar edinin ve birlikte çalışın."
        cta="Arkadaşlara Git →"
        target="friends"
        :navigateTo="navigateTo"
      />
      <DashboardCard 
        icon="💬"
        title="Mesajlar"
        description="Diğer kullanıcılarla mesajlaşmalarınızı görüntüleyin ve yeni sohbet başlatın."
        cta="Mesajlara Git →"
        target="messages"
        :navigateTo="navigateTo"
      />
      <DashboardCard 
        icon="🕓"
        title="Geçmiş"
        description="Geçmiş çalışma isteklerinizi ve tamamlanan etkinliklerinizi inceleyin."
        cta="Geçmişi Gör →"
        target="history"
        :navigateTo="navigateTo"
      />
    </div>
    
    <!-- Quick Stats -->
    <QuickStats 
      :openRequestsCount="studyRequestsStore.openRequests.length"
      :pendingMatchesCount="matchesStore.pendingMatchesCount"
      :notificationCount="notificationsStore.unreadCount"
    />
  </div>
</template>

<script>
import { onMounted } from 'vue';
import DashboardCard from './DashboardCard.vue';
import QuickStats from './QuickStats.vue';
import { useUserStore } from '../stores/userStore';
import { useStudyRequestsStore } from '../stores/studyRequestsStore';
import { useMatchesStore } from '../stores/matchesStore';
import { useNotificationsStore } from '../stores/notificationsStore';

export default {
  name: "HomeDashboard",
  components: {
    DashboardCard,
    QuickStats
  },
  props: {
    navigateTo: {
      type: Function,
      required: true
    }
  },
  setup() {
    // Use stores instead of props
    const userStore = useUserStore();
    const studyRequestsStore = useStudyRequestsStore();
    const matchesStore = useMatchesStore();
    const notificationsStore = useNotificationsStore();

    // Fetch data on component mount
    onMounted(async () => {
      // Ensure user profile is loaded
      await userStore.fetchUserProfile();
      
      // Load data needed for stats
      await Promise.all([
        studyRequestsStore.fetchUserRequests(),
        matchesStore.fetchMatches(),
        notificationsStore.fetchNotifications()
      ]);
    });

    return {
      userStore,
      studyRequestsStore,
      matchesStore,
      notificationsStore
    };
  }
}
</script>

<style scoped>
.dashboard-welcome {
  text-align: center;
  margin-bottom: 2.5rem;
}

.dashboard-welcome h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--primary-light), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

@media (max-width: 768px) {
  .dashboard-welcome h1 {
    font-size: 2rem;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style> 