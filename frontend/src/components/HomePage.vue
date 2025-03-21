<template>
  <div class="home-container">
    <!-- Sol Navigasyon Bar -->
    <nav class="sidebar">
      <div class="sidebar-top">
        <!-- Logo -->
        <div class="logo-container">
          <div class="logo-circle">
            <div class="logo-inner">
              <span class="logo-letter">A</span>
            </div>
            <div class="logo-ring"></div>
          </div>
        </div>

        <!-- Ana Menü -->
        <div class="nav-menu">
          <a @click="changeContent('create-request')" :class="['nav-item', { active: currentContent === 'create-request' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <span>Ders İsteği Oluştur</span>
          </a>

          <a @click="changeContent('discover')" :class="['nav-item', { active: currentContent === 'discover' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <span>Keşfet</span>
          </a>

          <a @click="changeContent('messages')" :class="['nav-item', { active: currentContent === 'messages' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span>Mesajlar</span>
          </a>

          <a @click="changeContent('notifications')" :class="['nav-item', { active: currentContent === 'notifications' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <span>Bildirimler</span>
          </a>

          <a @click="changeContent('history')" :class="['nav-item', { active: currentContent === 'history' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span>Geçmiş</span>
          </a>
        </div>
      </div>

      <!-- Profil Bölümü (En Alt) -->
      <div class="profile-section">
        <a @click="changeContent('profile')" :class="['nav-item', { active: currentContent === 'profile' }]">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span>Profilim</span>
        </a>
      </div>
    </nav>

    <!-- Ana İçerik Alanı -->
    <main class="main-content">
      <transition name="fade" mode="out-in">
        <div v-if="currentContent === 'home'" class="content-wrapper">
          <h1>Hoş Geldiniz</h1>
          <p>Birlikte öğrenmek için eşleşmelerini yönet, çalışma isteklerini oluştur ve profilini tamamla.</p>
        </div>

        <div v-else-if="currentContent === 'create-request'" class="content-wrapper">
          <h1>Ders İsteği Oluştur</h1>
          <div class="create-request-form">
            <div class="form-group">
              <label>Ders Kategorisi</label>
              <div class="custom-select" data-dropdown="category" ref="categorySelect">
                <div class="selected-option" @click="toggleDropdown('category')">
                  {{ selectedCategory || 'Ders Seçiniz' }}
                  <div class="select-arrow" :class="{ 'open': dropdowns.category }">▼</div>
                </div>
                <div class="options-container" v-if="dropdowns.category">
                  <input type="text" 
                         v-model="categorySearch" 
                         @input="filterCategories" 
                         placeholder="Ders Ara..."
                         class="search-input"
                         @click.stop>
                  <div class="options-list">
                    <div v-for="category in filteredCategories" 
                         :key="category"
                         class="option"
                         @click.stop="selectCategory(category)">
                      {{ category }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Çalışma Tarihi</label>
              <input type="date" 
                     v-model="selectedDay"
                     class="form-input"
                     :min="getCurrentDate()"
                     :max="getMaxDate()" />
            </div>

            <div class="form-group">
              <label>Çalışma Süresi</label>
              <div class="custom-select" data-dropdown="duration" ref="durationSelect">
                <div class="selected-option" @click="toggleDropdown('duration')">
                  {{ selectedDuration?.label || 'Süre Seçiniz' }}
                  <div class="select-arrow" :class="{ 'open': dropdowns.duration }">▼</div>
                </div>
                <div class="options-container" v-if="dropdowns.duration">
                  <div class="options-list">
                    <div v-for="duration in durations" 
                         :key="duration.value"
                         class="option"
                         @click.stop="selectDuration(duration)">
                      {{ duration.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Konu Başlığı</label>
              <input type="text" 
                     v-model="topic" 
                     placeholder="Örn: Diferansiyel Denklemler, Veri Yapıları..."
                     class="form-input" />
            </div>

            <div class="form-group">
              <label>Açıklama</label>
              <textarea v-model="note" 
                        placeholder="Çalışmak istediğiniz konuyu ve tercihlerinizi detaylandırın..."
                        class="form-textarea"></textarea>
            </div>

            <button class="submit-btn" @click="createStudyRequest" :disabled="!isFormValid">
              <span class="btn-text">{{ isFormValid ? 'İstek Oluştur' : 'Tüm Alanları Doldurun' }}</span>
              <div class="btn-loader" v-if="isLoading"></div>
            </button>

            <!-- Debug bilgileri -->
          </div>
        </div>

        <div v-else-if="currentContent === 'discover'" class="content-wrapper">
          <h1>Keşfet</h1>
          
          <!-- Filtreleme Bölümü -->
          <div class="filters-container">
            <div class="filter-group">
              <label>Ders Kategorisi</label>
              <div class="custom-select" data-dropdown="filterCategory">
                <div class="selected-option" @click="toggleDropdown('filterCategory')">
                  {{ selectedFilterCategory || 'Tüm Kategoriler' }}
                  <div class="select-arrow" :class="{ 'open': dropdowns.filterCategory }">▼</div>
                </div>
                <div class="options-container" v-if="dropdowns.filterCategory">
                  <div class="options-list">
                    <div class="option" @click.stop="selectFilterCategory(null)">Tüm Kategoriler</div>
                    <div v-for="category in categories" 
                         :key="category"
                         class="option"
                         @click.stop="selectFilterCategory(category)">
                      {{ category }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="filter-group">
              <label>Çalışma Süresi</label>
              <div class="custom-select" data-dropdown="filterDuration">
                <div class="selected-option" @click="toggleDropdown('filterDuration')">
                  {{ selectedFilterDuration?.label || 'Tüm Süreler' }}
                  <div class="select-arrow" :class="{ 'open': dropdowns.filterDuration }">▼</div>
                </div>
                <div class="options-container" v-if="dropdowns.filterDuration">
                  <div class="options-list">
                    <div class="option" @click.stop="selectFilterDuration(null)">Tüm Süreler</div>
                    <div v-for="duration in durations" 
                         :key="duration.value"
                         class="option"
                         @click.stop="selectFilterDuration(duration)">
                      {{ duration.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="filter-group">
              <label>Çalışma Tarihi</label>
              <input type="date" 
                     v-model="selectedFilterDate"
                     class="form-input"
                     :min="getCurrentDate()" />
              <button class="clear-date-btn" @click="selectedFilterDate = null" v-if="selectedFilterDate">
                Tarihi Temizle
              </button>
            </div>
          </div>

          <!-- Çalışma İstekleri Grid -->
          <div class="discover-grid">
            <div class="study-card" v-for="request in filteredStudyRequests" :key="request.id">
              <div class="card-header">
                <h3>{{ request.topic }}</h3>
                <span class="tag">{{ request.category }}</span>
              </div>
              <p>{{ request.note }}</p>
              <div class="card-footer">
                <div class="card-info">
                  <span class="date">{{ formatDate(request.study_date) }}</span>
                  <span class="duration">{{ formatDuration(request.duration) }} saat</span>
                </div>
                <button class="join-btn" @click="joinStudyRequest(request.id)">Katıl</button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentContent === 'messages'" class="content-wrapper">
          <h1>Mesajlar</h1>
          <div class="messages-container">
            <div class="message-list">
              <div class="message-item" v-for="i in 5" :key="i">
                <div class="message-avatar"></div>
                <div class="message-content">
                  <h4>Kullanıcı {{i}}</h4>
                  <p>Son mesaj içeriği burada görünecek...</p>
                </div>
                <span class="message-time">14:30</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentContent === 'notifications'" class="content-wrapper">
          <h1>Bildirimler</h1>
          <div class="notifications-list">
            <div class="notification-item" v-for="i in 4" :key="i">
              <div class="notification-icon"></div>
              <div class="notification-content">
                <p>Yeni bir eşleşme isteği aldınız.</p>
                <span class="notification-time">2 saat önce</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentContent === 'history'" class="content-wrapper">
          <h1>Geçmiş</h1>
          <div class="history-timeline">
            <div class="timeline-item" v-for="i in 3" :key="i">
              <div class="timeline-date">
                <span>Mart {{i + 20}}</span>
              </div>
              <div class="timeline-content">
                <h3>Fizik Çalışma Oturumu</h3>
                <p>2 saat süren verimli bir çalışma gerçekleşti.</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentContent === 'profile'" class="content-wrapper">
          <h1>Profilim</h1>
          <div class="profile-container">
            <div class="profile-header">
              <div class="profile-avatar"></div>
              <div class="profile-info">
                <h2>Kullanıcı Adı</h2>
                <p>Üniversite / Bölüm</p>
              </div>
            </div>
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">12</span>
                <span class="stat-label">Tamamlanan Çalışma</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">4.8</span>
                <span class="stat-label">Ortalama Puan</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">8</span>
                <span class="stat-label">Aktif Grup</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

export default {
  name: "HomePage",
  setup() {
    const router = useRouter();
    const currentContent = ref('home');
    const userStore = useUserStore();

    // Form state
    const selectedCategory = ref(null);
    const selectedDay = ref(null);
    const selectedDuration = ref(null);
    const topic = ref('');
    const note = ref('');
    const isLoading = ref(false);
    const categorySearch = ref('');

    const studyRequests = ref([]);
    const isLoadingRequests = ref(false);

    // Filtre state'leri
    const selectedFilterCategory = ref(null);
    const selectedFilterDuration = ref(null);
    const selectedFilterDate = ref(null);

    // Check user authentication
    onMounted(async () => {
      // localStorage'dan kullanıcı bilgilerini al
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');

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
        router.push('/login');
      }
    });

    // Tarih yardımcı fonksiyonları
    const getCurrentDate = () => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3); // 3 ay sonrasına kadar seçilebilir
      return maxDate.toISOString().split('T')[0];
    };

    // Form validation
    const isFormValid = computed(() => {
      const validation = {
        category: !!selectedCategory.value,
        day: !!selectedDay.value,
        duration: !!selectedDuration.value,
        topic: !!topic.value?.trim(),
        note: !!note.value?.trim(),
        userId: !!userStore.id
      };

      console.log('Form Validation:', validation);
      console.log('User Store:', userStore);
      console.log('Selected Date:', selectedDay.value);

      return Object.values(validation).every(v => v === true);
    });

    const createStudyRequest = async () => {
      if (!isFormValid.value) {
        alert('Lütfen tüm alanları doldurun ve giriş yaptığınızdan emin olun.');
        return;
      }

      if (!userStore.id) {
        alert('Oturum açmanız gerekiyor.');
        router.push('/login');
        return;
      }

      isLoading.value = true;
      try {
        const response = await fetch('http://127.0.0.1:8000/study_requests/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userStore.id,
            category: selectedCategory.value,
            duration: selectedDuration.value.value,
            study_date: selectedDay.value,
            topic: topic.value,
            note: note.value
          })
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.detail || 'Bir hata oluştu');
        }

        // Form başarıyla gönderildi, formu sıfırla
        selectedCategory.value = null;
        selectedDay.value = null;
        selectedDuration.value = null;
        topic.value = '';
        note.value = '';
        
        // Başarı mesajı göster
        alert('Çalışma isteği başarıyla oluşturuldu!');
        // Ana sayfaya dön
        changeContent('home');
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Çalışma isteği oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        isLoading.value = false;
      }
    };

    // Çalışma isteklerini getir
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

    // Tarih formatla
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    // Süre formatla
    const formatDuration = (duration) => {
      return duration;
    };

    // Çalışma isteğine katıl
    const joinStudyRequest = async (requestId) => {
      // TODO: Implement join functionality
      alert('Bu özellik yakında eklenecek!');
    };

    // Content change function
    const changeContent = (content) => {
      currentContent.value = content;
    };

    // Dropdowns state
    const dropdowns = ref({
      category: false,
      day: false,
      duration: false,
      filterCategory: false,
      filterDuration: false
    });

    // Categories
    const categories = [
      'Matematik',
      'Fizik',
      'Kimya',
      'Biyoloji',
      'Bilgisayar Bilimleri',
      'Elektrik-Elektronik',
      'Makine Mühendisliği',
      'İnşaat Mühendisliği',
      'Ekonomi',
      'İşletme',
      'Psikoloji',
      'Sosyoloji',
      'Tarih',
      'Felsefe',
      'Hukuk',
      'Tıp',
      'Eczacılık',
      'Diş Hekimliği',
      'Mimarlık',
      'Grafik Tasarım',
      'İngilizce',
      'Almanca',
      'Fransızca',
      'İspanyolca',
      'Japonca',
      'Çince'
    ].sort();

    const filteredCategories = ref([...categories]);

    // Durations
    const durations = [
      { value: '1-2', label: '1-2 saat' },
      { value: '2-5', label: '2-5 saat' },
      { value: '5-6', label: '5-6 saat' }
    ];

    // Click outside handler
    const closeDropdowns = (event) => {
      if (!event.target.closest('.custom-select')) {
        Object.keys(dropdowns.value).forEach(key => {
          dropdowns.value[key] = false;
        });
      }
    };

    // Methods
    const toggleDropdown = (type) => {
      Object.keys(dropdowns.value).forEach(key => {
        dropdowns.value[key] = key === type ? !dropdowns.value[key] : false;
      });
    };

    const filterCategories = () => {
      const search = categorySearch.value.toLowerCase();
      filteredCategories.value = categories.filter(category => 
        category.toLowerCase().includes(search)
      );
    };

    const selectCategory = (category) => {
      selectedCategory.value = category;
      dropdowns.value.category = false;
      categorySearch.value = '';
      filteredCategories.value = [...categories];
    };

    const selectDuration = (duration) => {
      selectedDuration.value = duration;
      dropdowns.value.duration = false;
    };

    // Filtrelenmiş çalışma istekleri
    const filteredStudyRequests = computed(() => {
      return studyRequests.value.filter(request => {
        let matchCategory = true;
        let matchDuration = true;
        let matchDate = true;

        // Kategori filtresi
        if (selectedFilterCategory.value) {
          matchCategory = request.category === selectedFilterCategory.value;
        }

        // Süre filtresi
        if (selectedFilterDuration.value) {
          matchDuration = request.duration === parseInt(selectedFilterDuration.value.value.split('-')[1]);
        }

        // Tarih filtresi
        if (selectedFilterDate.value) {
          const requestDate = new Date(request.study_date).toISOString().split('T')[0];
          matchDate = requestDate === selectedFilterDate.value;
        }

        return matchCategory && matchDuration && matchDate;
      });
    });

    // Filtre seçim fonksiyonları
    const selectFilterCategory = (category) => {
      selectedFilterCategory.value = category;
      dropdowns.value.filterCategory = false;
    };

    const selectFilterDuration = (duration) => {
      selectedFilterDuration.value = duration;
      dropdowns.value.filterDuration = false;
    };

    // Keşfet sayfası açıldığında istekleri getir
    watch(() => currentContent.value, (newContent) => {
      if (newContent === 'discover') {
        fetchStudyRequests();
      }
    });

    // Component mount olduğunda ve currentContent discover ise istekleri getir
    onMounted(() => {
      if (currentContent.value === 'discover') {
        fetchStudyRequests();
      }
    });

    // Lifecycle hooks
    onMounted(() => {
      window.addEventListener('click', closeDropdowns);
    });

    onUnmounted(() => {
      window.removeEventListener('click', closeDropdowns);
    });

    return {
      currentContent,
      userStore,
      changeContent,
      selectedCategory,
      selectedDay,
      selectedDuration,
      topic,
      note,
      isLoading,
      categorySearch,
      dropdowns,
      categories,
      filteredCategories,
      durations,
      toggleDropdown,
      filterCategories,
      selectCategory,
      selectDuration,
      isFormValid,
      createStudyRequest,
      getCurrentDate,
      getMaxDate,
      studyRequests,
      isLoadingRequests,
      formatDate,
      formatDuration,
      joinStudyRequest,
      selectedFilterCategory,
      selectedFilterDuration,
      selectedFilterDate,
      filteredStudyRequests,
      selectFilterCategory,
      selectFilterDuration
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

/* Sidebar stili */
.sidebar {
  width: 280px;
  background: var(--surface-color);
  backdrop-filter: blur(20px);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-lg);
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo-circle {
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.logo-letter {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(126, 87, 194, 0.1);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary-color);
  color: white;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

/* Ana içerik alanı */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  height: 100vh;
  max-height: 100vh;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
  padding-bottom: 2rem; /* İçeriğin en altında biraz boşluk bırakmak için */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Form stilleri */
.create-request-form {
  background: var(--surface-color);
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  box-shadow: var(--shadow-md);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.custom-select {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.selected-option {
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: var(--surface-color-light);
  color: var(--text-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.3s ease;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.select-arrow.open {
  transform: translateY(-50%) rotate(180deg);
}

.options-container {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background: var(--surface-color-light);
  border-radius: 6px;
  box-shadow: var(--shadow-md);
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
  animation: slideDown 0.2s ease;
}

.search-input {
  width: calc(100% - 2rem);
  margin: 1rem;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  background: var(--surface-color);
  color: var(--text-primary);
}

.options-list {
  padding: 0.5rem 0;
}

.option {
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.option:hover {
  background: var(--primary-color);
  color: white;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: var(--surface-color-light);
  color: var(--text-primary);
  font-family: inherit;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.submit-btn {
  position: relative;
  width: 100%;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-left: 0.5rem;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Scrollbar stilleri */
.options-container::-webkit-scrollbar {
  width: 8px;
}

.options-container::-webkit-scrollbar-track {
  background: var(--surface-color);
  border-radius: 4px;
}

.options-container::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 4px;
}

.options-container::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
}

/* Responsive tasarım */
@media (max-width: 768px) {
  .home-container {
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .sidebar {
    width: 100%;
    padding: 1rem;
    flex-shrink: 0;
  }

  .main-content {
    height: calc(100vh - 80px); /* Sidebar'ın yüksekliğini çıkarıyoruz */
    max-height: none;
  }

  .nav-menu {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .nav-item {
    white-space: nowrap;
  }
}

/* Keşfet grid */
.discover-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  min-height: 0; /* Grid içeriğinin düzgün scroll etmesi için */
}

.study-card {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.study-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.tag {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date, .duration {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.join-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.join-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Mesajlar */
.message-list {
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  margin-right: 1rem;
}

/* Bildirimler */
.notifications-list {
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Profil */
.profile-container {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--primary-color);
  margin-right: 2rem;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  text-align: center;
}

.stat-item {
  background: var(--surface-color-light);
  padding: 1.5rem;
  border-radius: 8px;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-color);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Timeline */
.history-timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 2rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -2rem;
  top: 0;
  width: 2px;
  height: 100%;
  background: var(--primary-color);
}

.timeline-item::after {
  content: '';
  position: absolute;
  left: -2.35rem;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary-color);
}

.timeline-date {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.timeline-content {
  background: var(--surface-color);
  padding: 1rem;
  border-radius: 8px;
}

/* Tarih input stilini ekleyelim */
input[type="date"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: var(--surface-color-light);
  color: var(--text-primary);
  font-family: inherit;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Filtre stilleri */
.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: var(--surface-color);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--text-primary);
}

.clear-date-btn {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-date-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive filtreler */
@media (max-width: 768px) {
  .filters-container {
    grid-template-columns: 1fr;
  }
}
</style>
