<template>
  <div class="content-wrapper">
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
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

export default {
  name: "CreateRequestForm",
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  emits: ['requestCreated'],
  setup(props, { emit }) {
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
        userId: !!props.userId
      };

      return Object.values(validation).every(v => v === true);
    });

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

        // Form başarıyla gönderildi, formu sıfırla
        selectedCategory.value = null;
        selectedDay.value = null;
        selectedDuration.value = null;
        topic.value = '';
        note.value = '';
        
        // Başarı mesajı göster
        alert('Çalışma isteği başarıyla oluşturuldu!');
        // Event emit
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

    return {
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
      getMaxDate
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
</style> 