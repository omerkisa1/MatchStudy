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
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

export default {
  name: "DiscoverPage",
  props: {
    userId: {
      type: Number,
      required: true
    },
    studyRequests: {
      type: Array,
      default: () => []
    }
  },
  emits: ['requestUpdated'],
  setup(props, { emit }) {
    // Filtre state'leri
    const selectedFilterCategory = ref(null);
    const selectedFilterDuration = ref(null);
    const selectedFilterDate = ref(null);
    const isLoadingRequests = ref(false);

    // Dropdowns state
    const dropdowns = ref({
      filterCategory: false,
      filterDuration: false
    });

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

    // Tarih formatla
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    // Süre formatla
    const formatDuration = (duration) => {
      return duration;
    };

    // Filtre seçim fonksiyonları
    const selectFilterCategory = (category) => {
      selectedFilterCategory.value = category;
      dropdowns.value.filterCategory = false;
    };

    const selectFilterDuration = (duration) => {
      selectedFilterDuration.value = duration;
      dropdowns.value.filterDuration = false;
    };

    // Filtrelenmiş çalışma istekleri
    const filteredStudyRequests = computed(() => {
      return props.studyRequests.filter(request => {
        let matchCategory = true;
        let matchDuration = true;
        let matchDate = true;

        const notOwnRequest = request.user_id !== props.userId;
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

    const joinStudyRequest = async (request) => {
      if (props.userId === request.user_id) {
        alert("Kendi isteğinize başvuru yapamazsınız.");
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/matches/create?user1_id=${props.userId}&user2_id=${request.user_id}&request_id=${request.request_id}`, {
          method: 'POST'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'İstek gönderilemedi.');
        }

        alert('İstek başarıyla gönderildi.');
        emit('requestUpdated');
      } catch (error) {
        console.error(error);
        alert(error.message || 'Bir hata oluştu.');
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      window.addEventListener('click', closeDropdowns);
    });

    onUnmounted(() => {
      window.removeEventListener('click', closeDropdowns);
    });

    return {
      selectedFilterCategory,
      selectedFilterDuration,
      selectedFilterDate,
      isLoadingRequests,
      dropdowns,
      categories,
      durations,
      filteredStudyRequests,
      toggleDropdown,
      selectFilterCategory,
      selectFilterDuration,
      formatDate,
      formatDuration,
      joinStudyRequest,
      getCurrentDate
    };
  }
}
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
}

.join-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.join-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
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