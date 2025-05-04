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
          <a @click="navigateTo('home')" :class="['nav-item', { active: currentContent === 'home' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span>Ana Sayfa</span>
          </a>

          <a @click="navigateTo('create-request')" :class="['nav-item', { active: currentContent === 'create-request' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <span>Ders İsteği Oluştur</span>
          </a>

          <a @click="navigateTo('discover')" :class="['nav-item', { active: currentContent === 'discover' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <span>Keşfet</span>
          </a>

          <a @click="navigateTo('messages')" :class="['nav-item', { active: currentContent === 'messages' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span>Mesajlar</span>
          </a>

          <a @click="navigateTo('notifications')" :class="['nav-item', { active: currentContent === 'notifications' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <span>Bildirimler</span>
          </a>

          <a @click="navigateTo('history')" :class="['nav-item', { active: currentContent === 'history' }]">
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
        <a @click="navigateTo('profile')" :class="['nav-item', { active: currentContent === 'profile' }]">
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
          <div class="dashboard-welcome">
            <h1>Hoş Geldiniz, {{ userProfile.name || 'Öğrenci' }}</h1>
            <p class="welcome-subtitle">Birlikte öğrenmeye başlamak için bir seçenek seçin</p>
          </div>
          
          <div class="dashboard-grid">
            <div class="dashboard-card" @click="navigateTo('create-request')">
              <div class="card-icon">✏️</div>
              <h2>Ders İsteği Oluştur</h2>
              <p>Öğrenmek istediğiniz konularda eşleşmeler bulmak için ders isteği oluşturun.</p>
              <div class="card-overlay">
                <span class="card-cta">Şimdi Başla →</span>
              </div>
            </div>
            
            <div class="dashboard-card" @click="navigateTo('discover')">
              <div class="card-icon">🔍</div>
              <h2>Keşfet</h2>
              <p>Diğer öğrencilerin ders isteklerini keşfedin ve ilgi duyduğunuz konulara katılın.</p>
              <div class="card-overlay">
                <span class="card-cta">Keşfet →</span>
              </div>
            </div>
            
            <div class="dashboard-card" @click="navigateTo('profile')">
              <div class="card-icon">👤</div>
              <h2>Profil</h2>
              <p>Profilinizi özelleştirin, ilgi alanlarınızı belirtin ve eşleşme şansınızı artırın.</p>
              <div class="card-overlay">
                <span class="card-cta">Profili Düzenle →</span>
              </div>
            </div>
            
            <div class="dashboard-card" @click="navigateTo('notifications')">
              <div class="card-icon">🔔</div>
              <h2>Bildirimler</h2>
              <p>Yeni eşleşmeler ve ders isteği güncellemeleri hakkında bildirimlerinizi görüntüleyin.</p>
              <div class="card-overlay">
                <span class="card-cta">Bildirimleri Gör →</span>
              </div>
            </div>
          </div>
          
          <div class="quick-stats">
            <div class="stat">
              <span class="stat-value">{{ userStudyRequests.length }}</span>
              <span class="stat-label">Açık İstekler</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ pendingMatches }}</span>
              <span class="stat-label">Bekleyen Eşleşmeler</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ notifications.length }}</span>
              <span class="stat-label">Yeni Bildirim</span>
            </div>
          </div>
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
                <button
                  class="join-btn"
                  :disabled="request.matchStatus === 'pending' || request.matchStatus === 'accepted'"
                  @click="joinStudyRequest(request)">
                  <template v-if="request.matchStatus === 'pending'">İstek Gönderildi</template>
                  <template v-else-if="request.matchStatus === 'accepted'">Kabul Edildi</template>
                  <template v-else-if="request.matchStatus === 'rejected'">Tekrar Gönder</template>
                  <template v-else>İstek Gönder</template>
                </button>
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
          <Notifications />
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
          <div class="profile-container">
            <div class="profile-header">
              <div class="profile-avatar-section">
                <div class="profile-avatar">
                  <span v-if="!userProfile.avatar">{{ userInitial }}</span>
                  <img v-else :src="userProfile.avatar" alt="Profil Fotoğrafı" />
                </div>
                <button class="edit-avatar-btn" @click="triggerFileInput">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Fotoğraf Yükle
                </button>
                <input 
                  type="file" 
                  ref="fileInput" 
                  style="display: none" 
                  accept="image/*"
                  @change="handleAvatarChange"
                />
              </div>

              <div class="profile-info">
                <div class="profile-name-section">
                  <div>
                    <h2>{{ userProfile.name || 'İsimsiz Kullanıcı' }}</h2>
                    <p class="profile-education">
                      {{ userProfile.university || 'Üniversite' }} - 
                      {{ userProfile.department || 'Bölüm' }}
                    </p>
                  </div>
                  <button class="edit-profile-btn" @click="isEditingProfile = true" v-if="!isEditingProfile">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Profili Düzenle
                  </button>
                </div>

                <div v-if="!isEditingProfile">
                  <p class="profile-bio">{{ userProfile.bio || 'Henüz bir biyografi eklenmemiş.' }}</p>
                  
                  <div class="profile-stats">
                    <div class="stat-item">
                      <span class="stat-value">{{ userProfile.completedStudies }}</span>
                      <span class="stat-label">Tamamlanan Çalışma</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value">{{ userProfile.rating }}</span>
                      <span class="stat-label">Ortalama Puan</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value">{{ userProfile.activeGroups }}</span>
                      <span class="stat-label">Aktif Grup</span>
                    </div>
                  </div>

                  <div class="interests-section">
                    <h3>İlgi Alanları</h3>
                    <div class="interests-container">
                      <span v-for="interest in userProfile.interests" 
                            :key="interest" 
                            class="interest-tag">
                        {{ interest }}
                      </span>
                      <button class="add-interest-btn" @click="showInterestModal = true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        İlgi Alanı Ekle
                      </button>
                    </div>
                  </div>
                </div>

                <div v-else class="profile-edit-form">
                  <div class="form-group">
                    <label>İsim</label>
                    <input type="text" v-model="editProfile.name" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label>Üniversite</label>
                    <input type="text" v-model="editProfile.university" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label>Bölüm</label>
                    <input type="text" v-model="editProfile.department" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label>Biyografi</label>
                    <textarea v-model="editProfile.bio" class="form-textarea"></textarea>
                  </div>
                  <div class="form-actions">
                    <button class="cancel-btn" @click="cancelProfileEdit">İptal</button>
                    <button class="save-btn" @click="saveProfileChanges">Kaydet</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="study-history">
              <h3>Çalışma Geçmişi</h3>
              <div v-if="userStudyRequests.length > 0">
                <div v-for="request in userStudyRequests" 
                     :key="request.request_id" 
                     class="history-card">
                  <div class="history-card-header">
                    <h4>{{ request.topic }}</h4>
                    <span class="tag">{{ request.category }}</span>
                  </div>
                  <p>{{ request.note }}</p>
                  <div class="history-card-footer">
                    <div>
                      <span class="date">{{ formatDate(request.study_date) }}</span>
                      <span class="duration">{{ formatDuration(request.duration) }} saat</span>
                    </div>
                    <span :class="['status', (request.status || 'pending').toLowerCase()]">
                      {{ request.status || 'Beklemede' }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                Henüz bir çalışma geçmişiniz bulunmuyor.
              </div>
            </div>

            <div class="settings-container">
              <h3>Hesap Ayarları</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Şifre Değiştir</h4>
                  <p>Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin</p>
                </div>
                <button class="setting-btn" @click="showPasswordModal = true">
                  Şifre Değiştir
                </button>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Bildirim Ayarları</h4>
                  <p>E-posta ve uygulama bildirimlerini yönetin</p>
                </div>
                <button class="setting-btn" @click="showNotificationSettings = true">
                  Ayarları Düzenle
                </button>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Hesabı Sil</h4>
                  <p>Hesabınızı kalıcı olarak silin</p>
                </div>
                <button class="delete-account-btn" @click="confirmDeleteAccount">
                  Hesabı Sil
                </button>
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
import ProfileSection from '@/components/ProfileSection.vue';
import Notifications from './Notifications.vue';

export default {
  name: "HomePage",
  components: {
    Notifications
  },
  setup() {
    const router = useRouter();
    const currentContent = ref('home');
    const userStore = useUserStore();
    const fileInput = ref(null);

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

    const notifications = ref([]);

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

    const isEditingProfile = ref(false);
    const editProfile = ref({ ...userProfile.value });
    const showInterestModal = ref(false);
    const showPasswordModal = ref(false);
    const showNotificationSettings = ref(false);
    const userStudyRequests = ref([]);

    // New navigation function
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

      // Check URL hash for direct navigation
      const hash = window.location.hash.replace('#', '');
      if (hash && ['create-request', 'discover', 'messages', 'notifications', 'history', 'profile'].includes(hash)) {
        currentContent.value = hash;
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

watch(() => currentContent.value, (newContent) => {
  if (newContent === 'notifications') {
    fetchNotifications();
  }
});

const handleResponse = async (matchId, status) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/matches/update/${matchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Güncelleme başarısız');
    fetchNotifications(); // Yeniden yükle
  } catch (err) {
    alert(err.message);
  }
};


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

    const joinStudyRequest = async (request) => {
  if (userStore.id === request.user_id) {
    alert("Kendi isteğinize başvuru yapamazsınız.");
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/matches/create?user1_id=${userStore.id}&user2_id=${request.user_id}&request_id=${request.request_id}`, {
      method: 'POST'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'İstek gönderilemedi.');
    }

    alert('İstek başarıyla gönderildi.');
    fetchStudyRequests(); // Güncelle
  } catch (error) {
    console.error(error);
    alert(error.message || 'Bir hata oluştu.');
  }
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

        const notOwnRequest = request.user_id !== userStore.id;
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

        return matchCategory && matchDuration && matchDate && notOwnRequest;
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

    // Profil düzenleme metodları
    const cancelProfileEdit = () => {
      isEditingProfile.value = false;
      editProfile.value = { ...userProfile.value };
    };

    const saveProfileChanges = async () => {
      try {
        userProfile.value = { ...editProfile.value };
        isEditingProfile.value = false;
        alert('Profil başarıyla güncellendi!');
      } catch (error) {
        alert('Profil güncellenirken bir hata oluştu.');
      }
    };

    const confirmDeleteAccount = () => {
      if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        alert('Hesap silme işlemi başlatıldı.');
      }
    };

    // Kullanıcının çalışma isteklerini getir
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

    // Profil sayfası açıldığında çalışma isteklerini getir
    watch(() => currentContent.value, (newContent) => {
      if (newContent === 'profile') {
        fetchUserStudyRequests();
      }
    });

    // Profil düzenleme metodları
    const userInitial = computed(() => {
      return userProfile.value.name ? userProfile.value.name.charAt(0).toUpperCase() : 'K';
    });

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const handleAvatarChange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          // Dosya yükleme simülasyonu
          const reader = new FileReader();
          reader.onload = (e) => {
            userProfile.value.avatar = e.target.result;
          };
          reader.readAsDataURL(file);
          alert('Profil fotoğrafı başarıyla yüklendi!');
        } catch (error) {
          alert('Profil fotoğrafı yüklenirken bir hata oluştu.');
        }
      }
    };

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
      selectFilterDuration,
      userProfile,
      isEditingProfile,
      editProfile,
      showInterestModal,
      showPasswordModal,
      showNotificationSettings,
      userStudyRequests,
      cancelProfileEdit,
      saveProfileChanges,
      confirmDeleteAccount,
      notifications,
      userInitial,
      triggerFileInput,
      handleAvatarChange,
      fileInput,
      pendingMatches,
      navigateTo
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
  gap: 0.75rem;
  margin-top: 2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  position: relative;
  overflow: hidden;
  background: transparent;
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(126, 87, 194, 0.08);
}

.nav-item.active {
  color: white;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  box-shadow: 0 4px 12px rgba(126, 87, 194, 0.25);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  pointer-events: none;
}

.nav-icon {
  width: 22px;
  height: 22px;
  margin-right: 12px;
  opacity: 0.9;
  flex-shrink: 0;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
  stroke-width: 2px;
  transition: transform 0.3s ease;
}

.nav-item:hover .nav-icon svg {
  transform: scale(1.1);
}

.nav-item span {
  font-weight: 500;
  letter-spacing: 0.2px;
}

/* Sidebar ayırıcı */
.sidebar-divider {
  height: 1px;
  background: linear-gradient(to right, 
    rgba(255, 255, 255, 0.05), 
    rgba(255, 255, 255, 0.1), 
    rgba(255, 255, 255, 0.05));
  margin: 1.5rem 0;
}

/* Sidebar üst kısmı */
.sidebar-top {
  display: flex;
  flex-direction: column;
}

.logo-container {
  padding: 1rem 0;
  margin-bottom: 1rem;
}

.logo-circle {
  position: relative;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(126, 87, 194, 0.25);
}

.logo-circle::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  z-index: 0;
}

.logo-letter {
  position: relative;
  z-index: 1;
  color: white;
  font-size: 22px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Profil bölümü için özel stiller */
.profile-section {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-section .nav-item {
  background: rgba(126, 87, 194, 0.08);
  border: 1px solid rgba(126, 87, 194, 0.15);
}

.profile-section .nav-item:hover {
  background: rgba(126, 87, 194, 0.12);
  border-color: rgba(126, 87, 194, 0.2);
  transform: translateY(-1px);
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

.notification-spacer {
  flex: 1; 
}


/* Profil */
.profile-container {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-header {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  overflow: hidden;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-avatar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.edit-avatar-btn svg {
  width: 16px;
  height: 16px;
}

.profile-info {
  flex: 1;
}

.profile-name-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.profile-name-section h2 {
  margin: 0;
  font-size: 1.75rem;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-profile-btn:hover {
  background: var(--primary-dark);
}

.edit-profile-btn svg {
  width: 16px;
  height: 16px;
}

.profile-education {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.profile-bio {
  color: var(--text-primary);
  line-height: 1.6;
}

.profile-section span {
  font-weight: 500;
  font-size: 14px;
}

.study-history {
  display: grid;
  gap: 1rem;
}

.history-card {
  background: var(--surface-color);
  border-radius: 8px;
  padding: 1rem;
}

.history-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-card-header h4 {
  margin: 0;
  font-size: 1.1rem;
}

.history-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  background: #FFC107; /* Varsayılan arka plan */
  color: black; /* Varsayılan metin rengi */
}

.status.pending {
  background: #FFC107;
  color: black;
}

.status.completed {
  background: #4CAF50;
  color: white;
}

.status.cancelled {
  background: #F44336;
  color: white;
}

.interests-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.add-interest-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 20px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-interest-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.add-interest-btn svg {
  width: 16px;
  height: 16px;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--surface-color);
  border-radius: 8px;
}

.setting-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.setting-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.setting-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.setting-btn:hover {
  background: var(--primary-dark);
}

.delete-account-btn {
  padding: 0.5rem 1rem;
  background: #F44336;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-account-btn:hover {
  background: #D32F2F;
}

.profile-edit-form {
  background: var(--surface-color-light);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: var(--primary-dark);
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-name-section {
    flex-direction: column;
    gap: 1rem;
  }

  .profile-stats {
    grid-template-columns: 1fr;
  }
}

/* Profil Butonu Stilleri */
.profile-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(126, 87, 194, 0.1);
  border: 1px solid rgba(126, 87, 194, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-button:hover {
  background: rgba(126, 87, 194, 0.15);
  border-color: rgba(126, 87, 194, 0.3);
  transform: translateY(-1px);
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.profile-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  line-height: 1.2;
}

.profile-role {
  color: var(--text-secondary);
  font-size: 12px;
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.edit-profile-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-profile-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.edit-profile-button svg {
  width: 14px;
  height: 14px;
}

/* Navbar stilleri */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--surface-color);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.accept-btn,
.reject-btn {
  all: unset;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.accept-btn {
  background-color: #4CAF50;
  color: white;
}

.accept-btn:hover {
  background-color: #388E3C;
  transform: scale(1.05);
}

.reject-btn {
  background-color: #F44336;
  color: white;
}

.reject-btn:hover {
  background-color: #D32F2F;
  transform: scale(1.05);
}

/* Profil sayfası için ek stiller */
.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;
  background: var(--surface-color-light);
  padding: 1.5rem;
  border-radius: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background: var(--surface-color-light);
  border-radius: 12px;
  margin: 1rem 0;
}

/* İlgi alanları için ek stiller */
.interests-section {
  margin-top: 2rem;
}

.interests-section h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.interests-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.interest-tag {
  background: rgba(126, 87, 194, 0.15);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  border: 1px solid rgba(126, 87, 194, 0.3);
}

/* Profil düzenleme formu için ek stiller */
.profile-edit-form {
  background: var(--surface-color-light);
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Dashboard Grid styles */
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

.dashboard-card {
  position: relative;
  background: rgba(45, 35, 75, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, var(--primary-color), var(--accent-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: var(--shadow-lg);
}

.dashboard-card:hover::before {
  opacity: 1;
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: inline-block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.dashboard-card h2 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.dashboard-card p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  flex-grow: 1;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 2rem;
  background: linear-gradient(to top, rgba(30, 22, 54, 0.9), transparent);
  transform: translateY(100%);
  transition: transform 0.3s ease;
  display: flex;
  justify-content: flex-end;
}

.dashboard-card:hover .card-overlay {
  transform: translateY(0);
}

.card-cta {
  color: var(--accent-color);
  font-weight: 500;
  font-size: 0.95rem;
}

/* Quick Stats styles */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  background: rgba(45, 35, 75, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-light);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-welcome h1 {
    font-size: 2rem;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat {
    padding: 1rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .stat:last-child {
    border-bottom: none;
  }
}

</style>
