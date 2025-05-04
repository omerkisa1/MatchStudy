<template>
  <div class="dashboard-card" @click="navigateTo(target)">
    <div class="card-icon">{{ icon }}</div>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <div class="card-overlay">
      <span class="card-cta">{{ cta }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardCard",
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    cta: {
      type: String,
      required: true
    },
    target: {
      type: String,
      required: true
    },
    navigateTo: {
      type: Function,
      required: true
    }
  }
}
</script>

<style scoped>
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
</style> 