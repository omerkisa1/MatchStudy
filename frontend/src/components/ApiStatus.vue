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
        <small v-if="detailedMessage" class="detailed-message">{{ detailedMessage }}</small>
      </div>
      <div class="api-status-actions" v-if="status === 'offline'">
        <button @click="checkStatus" :disabled="isChecking">
          <span v-if="isChecking">Kontrol ediliyor...</span>
          <span v-else>Yeniden Dene</span>
        </button>
      </div>
      <div class="api-status-close" @click="hideStatus" v-if="status !== 'connecting'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { isApiAvailable, apiState } from '@/services/api';
import { connectionStatus } from '@/socket';

export default {
  name: 'ApiStatus',
  
  setup() {
    const status = ref('connecting'); // connecting, online, offline
    const showStatus = ref(false);
    const isChecking = ref(false);
    const lastError = ref(null);
    const socketStatus = ref('disconnected');
    
    // Computed properties for display
    const statusClass = computed(() => `status-${status.value}`);
    
    const statusMessage = computed(() => {
      switch (status.value) {
        case 'connecting':
          return 'Sunucu bağlantısı kuruluyor...';
        case 'online':
          return socketStatus.value === 'connected' 
            ? 'Tüm sistemler çevrimiçi' 
            : 'API bağlantısı kuruldu';
        case 'offline':
          return 'Sunucu bağlantısı kurulamadı';
        default:
          return '';
      }
    });
    
    const detailedMessage = computed(() => {
      if (status.value === 'offline' && lastError.value) {
        return `${lastError.value}`;
      }
      if (status.value === 'online' && socketStatus.value !== 'connected') {
        return 'WebSocket bağlantısı bekleniyor...';
      }
      return '';
    });
    
    // Check both API and Socket status
    async function checkStatus() {
      status.value = 'connecting';
      showStatus.value = true;
      isChecking.value = true;
      
      try {
        // Check API availability
        const available = await isApiAvailable();
        
        // Update status based on API availability
        status.value = available ? 'online' : 'offline';
        lastError.value = apiState.lastError;
        
        // If API is offline, keep status visible
        if (!available) {
          showStatus.value = true;
        } else {
          // If online, check socket status
          socketStatus.value = connectionStatus.status;
          
          // Hide after 3 seconds if everything is good
          if (socketStatus.value === 'connected') {
            setTimeout(() => {
              showStatus.value = false;
            }, 3000);
          } else {
            // If Socket is not connected, keep status visible but with a timeout
            setTimeout(() => {
              showStatus.value = false;
            }, 5000);
          }
        }
      } catch (error) {
        console.error('API status check error:', error);
        status.value = 'offline';
        lastError.value = error.message;
      } finally {
        isChecking.value = false;
      }
    }
    
    // Hide status notification
    function hideStatus() {
      showStatus.value = false;
    }
    
    // Watch for API state changes
    watch(() => apiState.isAvailable, (newValue) => {
      if (status.value === 'offline' && newValue === true) {
        // API came back online
        status.value = 'online';
        showStatus.value = true;
        
        // Hide after a few seconds
        setTimeout(() => {
          showStatus.value = false;
        }, 3000);
      } else if (status.value === 'online' && newValue === false) {
        // API went offline
        status.value = 'offline';
        lastError.value = apiState.lastError;
        showStatus.value = true;
      }
    });
    
    // Watch for Socket connection status changes
    watch(() => connectionStatus.status, (newValue) => {
      socketStatus.value = newValue;
      
      if (newValue === 'connected' && status.value === 'online') {
        // Everything is good, show briefly then hide
        showStatus.value = true;
        setTimeout(() => {
          showStatus.value = false;
        }, 3000);
      } else if (newValue === 'failed' || newValue === 'disconnected') {
        // Socket issues, show status if API is online
        if (status.value === 'online') {
          showStatus.value = true;
        }
      }
    });
    
    // Setup periodic status checks
    let statusCheckInterval = null;
    
    onMounted(() => {
      // Initial status check
      checkStatus();
      
      // Set up periodic checks every 30 seconds
      statusCheckInterval = setInterval(() => {
        // Only do automatic checks when status is 'offline'
        if (status.value === 'offline') {
          checkStatus();
        }
      }, 30000);
    });
    
    // Clean up on unmount
    onUnmounted(() => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    });
    
    return {
      status,
      statusClass,
      statusMessage,
      detailedMessage,
      showStatus,
      isChecking,
      checkStatus,
      hideStatus
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  background-color: #333;
  color: white;
  max-width: 90%;
  position: relative;
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
  flex-shrink: 0;
}

.api-status svg {
  width: 100%;
  height: 100%;
  color: white;
}

.api-status-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.detailed-message {
  display: block;
  opacity: 0.8;
  font-size: 12px;
  margin-top: 2px;
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
  font-size: 12px;
  white-space: nowrap;
}

.api-status-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.api-status-close {
  margin-left: 12px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.api-status-close:hover {
  opacity: 1;
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