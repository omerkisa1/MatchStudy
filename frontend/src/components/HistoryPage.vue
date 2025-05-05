<template>
  <div class="content-wrapper">
    <h1>Geçmiş Çalışma İsteklerim</h1>
    
    <div v-if="isLoading" class="loading-container">
      <div class="loader"></div>
      <p>Geçmiş istekler yükleniyor...</p>
    </div>
    
    <div v-else-if="pastRequests.length === 0" class="empty-state">
      <p>Geçmiş çalışma isteği bulunmuyor.</p>
    </div>
    
    <div v-else class="history-timeline">
      <div class="timeline-item" v-for="request in pastRequests" :key="request.id">
        <div class="timeline-date">
          <span>{{ formatDate(request.study_date) }}</span>
        </div>
        <div class="timeline-content">
          <h3>{{ request.topic }}</h3>
          <div class="request-details">
            <span class="badge category">{{ request.category }}</span>
            <span class="badge duration">{{ request.duration }} saat</span>
            <span class="badge status" :class="request.status || 'completed'">
              {{ getStatusText(request.status) }}
            </span>
          </div>
          <p v-if="request.note">{{ request.note }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStudyRequests } from '../composables/useStudyRequests'
import { useStudyRequestsStore } from '../stores/studyRequestsStore'

// Composable ile geçmiş istekleri yükleme
const { fetchPastRequests, isLoading, error } = useStudyRequests()
const studyRequestsStore = useStudyRequestsStore()
const pastRequests = computed(() => studyRequestsStore.pastRequests)

// Durum metinleri
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Bekliyor',
    'active': 'Aktif',
    'completed': 'Tamamlandı',
    'canceled': 'İptal Edildi'
  }
  return statusMap[status] || 'Tamamlandı'
}

// Tarih formatlama
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('tr-TR', options)
}

// Sayfa yüklendiğinde geçmiş istekleri getir
onMounted(async () => {
  await fetchPastRequests()
})
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loader {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-state {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.history-timeline {
  position: relative;
  padding-left: 2rem;
}

.history-timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--primary-color), var(--primary-dark));
}

.timeline-item {
  position: relative;
  padding-bottom: 2rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -2rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--primary-color);
  border: 2px solid var(--surface-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.timeline-date {
  margin-bottom: 0.5rem;
}

.timeline-date span {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-color);
  color: white;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.timeline-content {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.timeline-content h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.timeline-content p {
  margin: 0.5rem 0 0 0;
  color: var(--text-secondary);
}

.request-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.category {
  background-color: var(--info-light);
  color: var(--info-dark);
}

.duration {
  background-color: var(--warning-light);
  color: var(--warning-dark);
}

.status {
  background-color: var(--success-light);
  color: var(--success-dark);
}

.status.pending {
  background-color: var(--warning-light);
  color: var(--warning-dark);
}

.status.active {
  background-color: var(--primary-light);
  color: var(--primary-dark);
}

.status.canceled {
  background-color: var(--danger-light);
  color: var(--danger-dark);
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 