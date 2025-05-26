<template>
  <div class="api-status-wrapper" v-if="showStatus">
    <div class="api-status" :class="statusClass">
      <div class="api-status-icon">
        <svg v-if="status === 'connecting'" class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        <svg v-else-if="status === 'online'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="api-status-message">
        {{ statusMessage }}
      </div>
      <div class="api-status-actions" v-if="status === 'offline'">
        <button @click="checkStatus">Yeniden Dene</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { isApiAvailable } from '@/services/api';

export default {
  name: 'ApiStatus',
  
  setup() {
    const status = ref('connecting'); // connecting, online, offline
    const showStatus = ref(false);
    
    const statusClass = computed(() => `status-${status.value}`);
    
    const statusMessage = computed(() => {
      switch (status.value) {
        case 'connecting':
          return 'API bağlantısı kuruluyor...';
        case 'online':
          return 'API bağlantısı kuruldu';
        case 'offline':
          return 'API bağlantısı kurulamadı. Sunucu yanıt vermiyor.';
        default:
          return '';
      }
    });
    
    async function checkStatus() {
      status.value = 'connecting';
      showStatus.value = true;
      
      try {
        const available = await isApiAvailable();
        status.value = available ? 'online' : 'offline';
        
        // If online, hide after 2 seconds
        if (status.value === 'online') {
          setTimeout(() => {
            showStatus.value = false;
          }, 2000);
        }
      } catch (error) {
        console.error('API status check error:', error);
        status.value = 'offline';
      }
    }
    
    onMounted(() => {
      checkStatus();
    });
    
    return {
      status,
      statusClass,
      statusMessage,
      showStatus,
      checkStatus
    };
  }
}
</script>

<style scoped>
.api-status-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  padding: 10px;
}

.api-status {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #333;
  color: white;
}

.status-connecting {
  background-color: #2196F3;
}

.status-online {
  background-color: #4CAF50;
}

.status-offline {
  background-color: #F44336;
}

.api-status-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.api-status svg {
  width: 100%;
  height: 100%;
  color: white;
}

.spinner {
  animation: rotate 2s linear infinite;
  transform-origin: center center;
}

.path {
  stroke: white;
  stroke-dasharray: 125;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite;
  stroke-linecap: round;
}

.api-status-actions {
  margin-left: 16px;
}

.api-status-actions button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dashoffset: 125; }
  50% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -125; }
}
</style> 