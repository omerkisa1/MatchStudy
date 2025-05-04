<template>
  <div class="home-container">
    <!-- Using the updated Sidebar component with navigateTo function as prop -->
    <Sidebar :currentContent="currentContent" :navigateTo="navigateTo" />

    <!-- Ana İçerik Alanı -->
    <main class="main-content">
      <transition name="fade" mode="out-in">
        <div v-if="currentContent === 'home'" class="content-wrapper">
          <div class="dashboard-welcome">
            <h1>Hoş Geldiniz, {{ userProfile.name || 'Öğrenci' }}</h1>
            <p class="welcome-subtitle">Birlikte öğrenmeye başlamak için bir seçenek seçin</p>
          </div>
          
          <!-- Using the DashboardCard component directly -->
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
          </div>
          
          <QuickStats 
            :openRequestsCount="userStudyRequests.length"
            :pendingMatchesCount="pendingMatches"
            :notificationCount="notifications.length"
          />
        </div>

        <!-- Rest of content sections... -->
      </transition>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';
import ProfileSection from '@/components/ProfileSection.vue';
import Notifications from './Notifications.vue';
import Sidebar from './Sidebar.vue';
import DashboardCard from './DashboardCard.vue';
import QuickStats from './QuickStats.vue';

export default {
  name: "HomePage",
  components: {
    Notifications,
    Sidebar,
    DashboardCard,
    QuickStats
  },
  setup() {
    const router = useRouter();
    const currentContent = ref('home');
    const userStore = useUserStore();
    
    // ... other setup code ...

    // Navigation function
    const navigateTo = (content) => {
      currentContent.value = content;
      // Optionally update URL without page reload
      window.history.pushState(null, '', `#${content}`);
    };

    // ... rest of setup code ...
    
    return {
      currentContent,
      userStore,
      // ... other returns ...
      navigateTo
    };
  }
}
</script>

<style>
/* Global styles */

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* Other styles... */
</style> 