<template>
  <div class="content-wrapper">
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
</template>

<script>
export default {
  name: "HistoryPage"
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
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.timeline-content p {
  margin: 0;
  color: var(--text-secondary);
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
</style> 