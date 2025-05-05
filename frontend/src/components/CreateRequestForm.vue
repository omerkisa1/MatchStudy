<template>
  <div class="content-wrapper">
    <div class="form-container">
      <h2 class="form-title">Çalışma İsteği Oluştur</h2>
      
      <div class="form-content">
        <!-- Kategori Seçimi -->
        <div class="form-group">
          <label>Kategori</label>
          <div class="relative">
            <div class="custom-select" data-dropdown="category" ref="categorySelect">
              <div 
                class="selected-option"
                @click="toggleDropdown('category')"
              >
                {{ selectedCategory || 'Kategori Seçiniz' }}
                <div class="select-arrow" :class="{ 'open': dropdowns.category }">▼</div>
              </div>
              <div 
                v-if="dropdowns.category" 
                class="options-container"
              >
                <input
                  type="text"
                  v-model="categorySearch"
                  @input="filterCategories"
                  placeholder="Kategori ara..."
                  class="search-input"
                />
                <div class="options-list">
                  <div
                    v-for="category in filteredCategories"
                    :key="category"
                    class="option"
                    @click.stop="selectCategory(category)"
                  >
                    {{ category }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarih Seçimi -->
        <div class="form-group">
          <label>Çalışma Tarihi</label>
          <input
            type="date"
            v-model="selectedDay"
            :min="getCurrentDate()"
            :max="getMaxDate()"
            class="form-input"
          />
        </div>

        <!-- Süre Seçimi -->
        <div class="form-group">
          <label>Çalışma Süresi</label>
          <div class="relative">
            <div class="custom-select" data-dropdown="duration" ref="durationSelect">
              <div 
                class="selected-option"
                @click="toggleDropdown('duration')"
              >
                {{ selectedDuration?.label || 'Süre Seçiniz' }}
                <div class="select-arrow" :class="{ 'open': dropdowns.duration }">▼</div>
              </div>
              <div 
                v-if="dropdowns.duration" 
                class="options-container"
              >
                <div class="options-list">
                  <div
                    v-for="duration in durations"
                    :key="duration.value"
                    class="option"
                    @click.stop="selectDuration(duration)"
                  >
                    {{ duration.label }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Konu Başlığı -->
        <div class="form-group">
          <label>Konu Başlığı</label>
          <input
            type="text"
            v-model="topic"
            placeholder="Örn: Diferansiyel Denklemler, Veri Yapıları..."
            class="form-input"
          />
        </div>

        <!-- Açıklama -->
        <div class="form-group">
          <label>Açıklama</label>
          <textarea
            v-model="note"
            placeholder="Çalışmak istediğiniz konuyu ve tercihlerinizi detaylandırın..."
            rows="4"
            class="form-textarea"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button
          @click="createStudyRequest"
          :disabled="!isFormValid"
          class="submit-btn"
          :class="{ 'disabled': !isFormValid }"
        >
          <span v-if="!isLoading">{{ isFormValid ? 'İstek Oluştur' : 'Tüm Alanları Doldurun' }}</span>
          <div v-else class="btn-loader"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['requestCreated']);

// Form state
const selectedCategory = ref(null);
const selectedDay = ref(null);
const selectedDuration = ref(null);
const topic = ref('');
const note = ref('');
const isLoading = ref(false);
const categorySearch = ref('');

// Dropdowns state
const dropdowns = ref({
  category: false,
  duration: false
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

// Form validation
const isFormValid = computed(() => {
  return selectedCategory.value &&
         selectedDay.value &&
         selectedDuration.value &&
         topic.value?.trim() &&
         note.value?.trim() &&
         props.userId;
});

// Helper functions
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getMaxDate = () => {
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  return maxDate.toISOString().split('T')[0];
};

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

const createStudyRequest = async () => {
  if (!isFormValid.value) {
    alert('Lütfen tüm alanları doldurun ve giriş yaptığınızdan emin olun.');
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
        user_id: props.userId,
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

    // Reset form
    selectedCategory.value = null;
    selectedDay.value = null;
    selectedDuration.value = null;
    topic.value = '';
    note.value = '';
    
    alert('Çalışma isteği başarıyla oluşturuldu!');
    emit('requestCreated');
  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Çalışma isteği oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns);
});
</script>

<style scoped>
.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.form-container {
  background: rgba(30, 22, 54, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-title {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-input,
.form-textarea,
.selected-option {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(45, 35, 75, 0.5);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.selected-option:hover {
  border-color: rgba(124, 58, 237, 0.8);
  background: rgba(45, 35, 75, 0.7);
  outline: none;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.custom-select {
  position: relative;
  width: 100%;
}

.selected-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.select-arrow {
  transition: transform 0.2s ease;
}

.select-arrow.open {
  transform: rotate(180deg);
}

.options-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: rgba(45, 35, 75, 0.95);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 50;
  max-height: 250px;
  overflow-y: auto;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(30, 22, 54, 0.9);
  border: none;
  border-bottom: 1px solid rgba(124, 58, 237, 0.3);
  color: #fff;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  background: rgba(45, 35, 75, 0.9);
}

.options-list {
  padding: 0.5rem 0;
}

.option {
  padding: 0.75rem 1rem;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option:hover {
  background: rgba(124, 58, 237, 0.2);
}

.submit-btn {
  width: 100%;
  padding: 0.875rem;
  background: rgb(124, 58, 237);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(.disabled) {
  background: rgb(109, 40, 217);
  transform: translateY(-1px);
}

.submit-btn.disabled {
  background: rgba(124, 58, 237, 0.5);
  cursor: not-allowed;
}

.btn-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Custom Scrollbar */
.options-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(124, 58, 237, 0.5) rgba(30, 22, 54, 0.5);
}

.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: rgba(30, 22, 54, 0.5);
  border-radius: 3px;
}

.options-container::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.5);
  border-radius: 3px;
}

/* Responsive Design */
@media (max-width: 640px) {
  .content-wrapper {
    padding: 1rem;
  }
  
  .form-container {
    padding: 1.5rem;
  }
  
  .form-title {
    font-size: 1.25rem;
  }
}
</style> 