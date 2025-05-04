<template>
  <div class="content-wrapper">
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
</template>

<script>
export default {
  name: "MessagesPage"
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

.messages-container {
  background: var(--surface-color);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.message-list {
  display: flex;
  flex-direction: column;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.message-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  margin-right: 1rem;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-content h4 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: var(--text-primary);
}

.message-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-left: 1rem;
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