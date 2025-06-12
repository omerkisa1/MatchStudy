<template>
  <div class="content-wrapper">
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
            :class="{
              'join-pending': getMatchStatus(request.request_id) === 'pending',
              'join-accepted': getMatchStatus(request.request_id) === 'accepted',
              'sending': requestInProgress === request.request_id
            }"
            :disabled="getMatchStatus(request.request_id) === 'pending' || getMatchStatus(request.request_id) === 'accepted' || requestInProgress === request.request_id"
            @click="joinStudyRequest(request)">
            <template v-if="requestInProgress === request.request_id">
              <span class="btn-spinner"></span>
            </template>
            <template v-else-if="getMatchStatus(request.request_id) === 'pending'">İstek Gönderildi</template>
            <template v-else-if="getMatchStatus(request.request_id) === 'accepted'">Kabul Edildi</template>
            <template v-else-if="getMatchStatus(request.request_id) === 'rejected'">Tekrar Gönder</template>
            <template v-else>İstek Gönder</template>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Bildirimleri -->
    <ToastNotification ref="toast" />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useStudyRequestsStore } from '../stores/studyRequestsStore';
import { useMatchesStore } from '../stores/matchesStore';
import ToastNotification from './ToastNotification.vue';

/**
 * Safe array accessor to prevent "Cannot read properties of undefined (reading 'length')" errors
 * @param {Array|undefined|null} arr - The array to check
 * @returns {Array} - The original array or an empty array if undefined/null
 */
function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

export default {
  name: "DiscoverPage",
  components: {
    ToastNotification
  },
  setup() {
    // Stores
    const userStore = useUserStore();
    const studyRequestsStore = useStudyRequestsStore();
    const matchesStore = useMatchesStore();

    // Toast referansı
    const toast = ref(null);
    
    // İstek durumu takibi için
    const requestInProgress = ref(null);

    // UI state
    const dropdowns = ref({
      filterCategory: false,
      filterDuration: false
    });

    // Filter state - now directly linked to store
    const selectedFilterCategory = ref(null);
    const selectedFilterDuration = ref(null);
    const selectedFilterDate = ref(null);

    // Categories
    const categories = [
      'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Bilgisayar Bilimleri',
      'Elektrik-Elektronik', 'Makine Mühendisliği', 'İnşaat Mühendisliği',
      'Ekonomi', 'İşletme', 'Psikoloji', 'Sosyoloji', 'Tarih',
      'Felsefe', 'Hukuk', 'Tıp', 'Eczacılık', 'Diş Hekimliği',
      'Mimarlık', 'Grafik Tasarım', 'İngilizce', 'Almanca', 'Fransızca',
      'İspanyolca', 'Japonca', 'Çince'
    ].sort();

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

    // Helper functions
    const getCurrentDate = () => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    };

    // Format date
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    // Format duration
    const formatDuration = (duration) => {
      return duration;
    };

    // Filter selection functions - now updating the store
    const selectFilterCategory = (category) => {
      selectedFilterCategory.value = category;
      studyRequestsStore.setFilters({ category });
      dropdowns.value.filterCategory = false;
    };

    const selectFilterDuration = (duration) => {
      selectedFilterDuration.value = duration;
      studyRequestsStore.setFilters({ duration });
      dropdowns.value.filterDuration = false;
    };

    // Watch for date filter changes
    watch(selectedFilterDate, (newDate) => {
      studyRequestsStore.setFilters({ date: newDate });
    });

    // Get filtered study requests from the store
 const filteredStudyRequests = computed(() => {
   return studyRequestsStore
     .filteredRequests
     // userStore.id ile eşleşen kendi isteklerinizi çıkarın
     .filter(req => req.user_id !== userStore.id);
 });

    // Get match status for a request
    const getMatchStatus = (requestId) => {
      if (!requestId) return null;
      return matchesStore.matches.find(m => m.request_id === requestId)?.status || null;
    };

    // Join study request function - updated to use toast
    const joinStudyRequest = async (request) => {
      if (userStore.id === request.user_id) {
        toast.value.error("Kendi isteğinize başvuru yapamazsınız.");
        return;
      }

      // İşlem başladığında buton durumunu güncelle
      requestInProgress.value = request.request_id;

      try {
        const result = await matchesStore.createMatch({
          user2_id: request.user_id,
          request_id: request.request_id
        });

        if (result.success) {
          toast.value.success('İstek başarıyla gönderildi.');
        } else {
          toast.value.error(result.error || 'Bir hata oluştu.');
        }
      } catch (error) {
        toast.value.error('İstek gönderilirken bir hata oluştu.');
        console.error('Error sending request:', error);
      } finally {
        // İşlem bittiğinde buton durumunu sıfırla
        setTimeout(() => {
          requestInProgress.value = null;
        }, 500);
      }
    };

    // Fetch data on component mount
    onMounted(async () => {
      try {
        // Add event listener
        window.addEventListener('click', closeDropdowns);
        
        // Fetch matches directly
        await matchesStore.fetchMatches();
        
        // Fetch study requests directly from API
        const fetchStudyRequests = async () => {
          try {
            console.log("Fetching study requests...");
            // Direkt olarak çalışma isteklerini API'dan al
            const response = await fetch('https://matchstudy-production.up.railway.app/study_requests/all');
            
            if (!response.ok) {
              throw new Error(`API yanıt hatası: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Study requests loaded:", data);
            // Direkt olarak store'a aktar - burada request_id'lerin id olarak store'a konulmasını sağlıyoruz
            const formattedRequests = safeArray(data.requests).map(req => ({
              ...req,
              id: req.request_id // id alanını da ekle
            }));
            studyRequestsStore.allRequests = formattedRequests;
          } catch (error) {
            console.error('Study requests alınırken hata oluştu:', error);
            toast.value?.error('Çalışma isteklerini almada hata oluştu. Lütfen daha sonra tekrar deneyin.');
            
            // Hata durumunda demo verileri kullan
            studyRequestsStore.allRequests = [
              {
                id: 1,
                request_id: 1,
                user_id: 1,
                category: "Matematik",
                duration: "1-2 saat",
                study_date: "2025-05-10",
                topic: "Türev Uygulamaları",
                note: "Lütfen grafik çizmeyi de tekrar edelim.",
                status: "pending",
                created_at: "2025-05-25T21:00:24",
                updated_at: "2025-05-25T21:00:24"
              },
              {
                id: 2,
                request_id: 2,
                user_id: 2,
                category: "Fizik",
                duration: "3-4 saat",
                study_date: "2025-05-11",
                topic: "Kuvvet ve Hareket",
                note: "Soru çözümü ağırlıklı çalışalım.",
                status: "pending",
                created_at: "2025-05-25T21:00:24",
                updated_at: "2025-05-25T21:00:24"
              },
              {
                id: 3,
                request_id: 3,
                user_id: 3,
                category: "Yazılım",
                duration: "5-6 saat",
                study_date: "2025-05-12",
                topic: "Python ile OOP",
                note: "Mini proje geliştirmek istiyorum.",
                status: "pending",
                created_at: "2025-05-25T21:00:24",
                updated_at: "2025-05-25T21:00:24"
              }
            ];
          }
        };
        
        await fetchStudyRequests();
      } catch (error) {
        console.error('Error initializing discover page:', error);
      }
    });

    onUnmounted(() => {
      window.removeEventListener('click', closeDropdowns);
    });

    return {
      // Stores
      userStore,
      studyRequestsStore,
      
      // UI state
      dropdowns,
      toast,
      requestInProgress,
      selectedFilterCategory,
      selectedFilterDuration,
      selectedFilterDate,
      categories,
      durations,
      
      // Computed
      filteredStudyRequests,
      
      // Methods
      toggleDropdown,
      selectFilterCategory,
      selectFilterDuration,
      formatDate,
      formatDuration,
      joinStudyRequest,
      getCurrentDate,
      getMatchStatus
    };
  }
};
</script>

<style scoped>
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
  padding-bottom: 2rem;
}

h1 {
  margin-bottom: 1.5rem;
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--surface-color);
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-md);
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
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

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: var(--surface-color-light);
  color: var(--text-primary);
  font-family: inherit;
}

.clear-date-btn {
  background: transparent;
  color: var(--primary-color);
  border: none;
  padding: 0.5rem 0;
  cursor: pointer;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.5rem;
}

.clear-date-btn:hover {
  text-decoration: underline;
}

.discover-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  min-height: 0;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.join-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.join-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.join-btn.join-pending {
  background: #FFA500; /* Turuncu */
}

.join-btn.join-accepted {
  background: #4CAF50; /* Yeşil */
}

.join-btn.sending {
  background: var(--primary-color);
  cursor: wait;
}

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-group {
    width: 100%;
  }
}
</style> 