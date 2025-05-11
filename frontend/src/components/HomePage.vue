<template>
  <div class="home-container">
    <!-- Çıkış Yap Butonu (Sağ üstte) -->
    <div class="header-logout">
      <button class="logout-btn" @click="logout">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
          <path d="M17 16l4-4m0 0l-4-4m4 4H7"></path>
          <path d="M9 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"></path>
        </svg>
        Çıkış Yap
      </button>
    </div>
    <!-- Using the updated Sidebar component with navigateTo function as prop -->
    <Sidebar :currentContent="currentContent" :navigateTo="navigateTo" />

    <!-- Ana İçerik Alanı -->
    <main class="main-content">
      <transition name="fade" mode="out-in">
        <!-- Home Dashboard -->
        <HomeDashboard 
          v-if="currentContent === 'home'" 
          :navigateTo="navigateTo"
        />

        <!-- Create Request Form -->
        <CreateRequestForm 
          v-else-if="currentContent === 'create-request'" 
          :userId="userStore.id"
          @requestCreated="handleRequestCreated"
        />
        <DiscoverPage v-else-if="currentContent === 'discover'" />
        <MessagesPage v-else-if="currentContent === 'messages'" />
        <Notifications v-else-if="currentContent === 'notifications'" />
        <HistoryPage v-else-if="currentContent === 'history'" />
        <ProfilePage v-else-if="currentContent === 'profile'" />
        <FriendsPage v-else-if="currentContent === 'friends'"/>
      </transition>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

// Import all components
import Sidebar from './Sidebar.vue';
import HomeDashboard from './HomeDashboard.vue';
import CreateRequestForm from './CreateRequestForm.vue';
import DiscoverPage from './DiscoverPage.vue';
import MessagesPage from './MessagesPage.vue';
import Notifications from './Notifications.vue';
import HistoryPage from './HistoryPage.vue';
import ProfilePage from './ProfilePage.vue';
import FriendsPage from './FriendsPage.vue';
import { initSocket, getSocket } from '@/socket'
export default {
  name: "HomePage",
  components: {
    Sidebar,
    HomeDashboard,
    CreateRequestForm,
    DiscoverPage,
    MessagesPage,
    Notifications,
    HistoryPage,
    ProfilePage,
    FriendsPage
  },
  setup() {
    const router = useRouter();
    const currentContent = ref('home');
    const userStore = useUserStore();
    const fileInput = ref(null);

    // State variables
    const studyRequests = ref([]);
    const isLoadingRequests = ref(false);
    const notifications = ref([]);
    const userStudyRequests = ref([]);

    // Profil state'leri
    const userProfile = ref({
      name: userStore.name || 'İsimsiz Kullanıcı',
      email: userStore.email || '',
      university: 'Üniversite',
      department: 'Bölüm',
      bio: 'Henüz bir biyografi eklenmemiş.',
      avatar: null,
      completedStudies: 0,
      rating: '0.0',
      activeGroups: 0,
      interests: ['Matematik', 'Fizik', 'Programlama']
    });

    // Navigation function
    const navigateTo = (content) => {
      currentContent.value = content;
      // Optionally update URL without page reload
      window.history.pushState(null, '', `#${content}`);
    };

    // Computed property for pending matches
    const pendingMatches = computed(() => {
      // Count how many study requests have pending matches
      return studyRequests.value.filter(request => 
        request.matchStatus === 'pending'
      ).length;
    });

    // Check user authentication
    onMounted(async () => {
      // localStorage'dan kullanıcı bilgilerini al
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');
      const socket = getSocket();
      if (!socket?.connected) {
        initSocket(userStore.id); // 🔁 Bağlantıyı tekrar kur
      }

      // Eğer localStorage'da kullanıcı bilgileri varsa store'a yükle
      if (userId && userEmail && userName) {
        userStore.$patch({
          id: parseInt(userId),
          email: userEmail,
          name: userName,
          isAuthenticated: true
        });
      }

      // Store'da kullanıcı bilgileri yoksa ve localStorage'da da yoksa login'e yönlendir
      if (!userStore.isAuthenticated && !userId) {
        router.push('/');
      }

      // Check URL hash for direct navigation
      const hash = window.location.hash.replace('#', '');
      if (hash && ['create-request', 'discover', 'messages', 'notifications', 'history', 'profile', 'friends'].includes(hash)) {
        currentContent.value = hash;
      }

      // Add event listener for navigation
      window.addEventListener('navigate', (event) => {
        currentContent.value = event.detail;
      });
    });

    onUnmounted(() => {
      // Clean up event listener
      window.removeEventListener('navigate', (event) => {
        currentContent.value = event.detail;
      });
    });

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/matches/notifications/${userStore.id}`);
        if (!response.ok) throw new Error('Bildirimler getirilemedi');
        const data = await response.json();
        notifications.value = data.notifications;
      } catch (error) {
        console.error('Bildirimler alınamadı:', error);
      }
    };

    // Fetch user study requests
    const fetchUserStudyRequests = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/study_requests/user/${userStore.id}`);
        if (!response.ok) throw new Error('İstekler getirilemedi');
        const data = await response.json();
        // Her istek için varsayılan status değeri ekle
        userStudyRequests.value = (data.requests || []).map(request => ({
          ...request,
          status: request.status || 'pending' // Eğer status yoksa 'pending' olarak ayarla
        }));
      } catch (error) {
        console.error('Error:', error);
        userStudyRequests.value = [];
      }
    };

    // Fetch study requests
    const fetchStudyRequests = async () => {
      isLoadingRequests.value = true;
      try {
        const response = await fetch('http://127.0.0.1:8000/study_requests/all');
        if (!response.ok) {
          throw new Error('Çalışma istekleri getirilemedi');
        }
        const data = await response.json();
        studyRequests.value = data.requests;
      } catch (error) {
        console.error('Error fetching study requests:', error);
      } finally {
        isLoadingRequests.value = false;
      }
    };

    // Watch for content changes to load appropriate data
    watch(() => currentContent.value, (newContent) => {
      if (newContent === 'notifications') {
        fetchNotifications();
      } else if (newContent === 'discover') {
        fetchStudyRequests();
      } else if (newContent === 'profile') {
        fetchUserStudyRequests();
      } else if (newContent === 'home') {
        fetchUserStudyRequests();
        fetchNotifications();
      }
    });

    // Event handlers
    const handleRequestCreated = () => {
      fetchUserStudyRequests();
      navigateTo('home');
    };

    const handleProfileUpdated = (updatedProfile) => {
      userProfile.value = { ...updatedProfile };
    };

    const handleAvatarUpdated = (avatarUrl) => {
      userProfile.value.avatar = avatarUrl;
    };

    const handlePasswordChangeRequested = () => {
      alert('Şifre değiştirme işlevi henüz uygulanmadı.');
    };

    const handleDeleteAccountRequested = () => {
      alert('Hesap silme işlevi henüz uygulanmadı.');
      // In a real app, you would call an API to delete the account
    };

    // Çıkış fonksiyonu
    const logout = () => {
      localStorage.removeItem('email');
      localStorage.removeItem('password');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      if (userStore.logout) userStore.logout(); // Pinia store'da logout fonksiyonu varsa
      router.push('/');
    };

    // Initial data loading
    onMounted(() => {
      if (userStore.id) {
        fetchUserStudyRequests();
        fetchNotifications();
      }
    });

    return {
      currentContent,
      userStore,
      userProfile,
      studyRequests,
      userStudyRequests,
      notifications,
      pendingMatches,
      navigateTo,
      fetchStudyRequests,
      fetchUserStudyRequests,
      handleRequestCreated,
      handleProfileUpdated,
      handleAvatarUpdated,
      handlePasswordChangeRequested,
      handleDeleteAccountRequested,
      logout
    };
  }
};
</script>

<style>
/* Global stil tanımlamaları */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  /* Ana renkler */
  --primary-color: #7E57C2;
  --primary-light: #B39DDB;
  --primary-dark: #4527A0;
  --accent-color: #FFD54F;
  
  /* Arka plan ve yüzey renkleri */
  --bg-gradient-start: #1A1033;
  --bg-gradient-end: #2D1A54;
  --surface-color: rgba(30, 22, 54, 0.85);
  --surface-color-light: rgba(45, 35, 75, 0.9);
  
  /* Metin renkleri */
  --text-primary: rgba(255, 255, 255, 0.9);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-disabled: rgba(255, 255, 255, 0.5);
  
  /* Gölgeler */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 5px 15px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.35);
}

.home-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
  color: var(--text-primary);
}

/* Ana içerik alanı */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  height: 100vh;
  max-height: 100vh;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive tasarım */
@media (max-width: 768px) {
  .home-container {
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .main-content {
    height: calc(100vh - 80px); /* Sidebar'ın yüksekliğini çıkarıyoruz */
    max-height: none;
  }
}

.header-logout {
  position: absolute;
  top: 24px;
  right: 32px;
  z-index: 100;
}

.logout-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(126, 87, 194, 0.15);
  display: flex;
  align-items: center;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
}
</style>
