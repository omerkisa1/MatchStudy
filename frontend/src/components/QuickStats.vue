<template>
  <div class="quick-stats">
    <div class="stat">
      <span class="stat-value">{{ openRequestsCount }}</span>
      <span class="stat-label">Açık İstekler</span>
    </div>
    <div class="stat">
      <span class="stat-value">{{ pendingMatchesCount }}</span>
      <span class="stat-label">Bekleyen Eşleşmeler</span>
    </div>
    <div class="stat">
      <span class="stat-value">{{ notificationCount }}</span>
      <span class="stat-label">Yeni Bildirim</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "QuickStats",
  props: {
    openRequestsCount: {
      type: Number,
      default: 0
    },
    pendingMatchesCount: {
      type: Number,
      default: 0
    },
    notificationCount: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style>
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