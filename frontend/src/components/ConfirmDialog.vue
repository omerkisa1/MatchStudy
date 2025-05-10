<template>
  <div v-if="isVisible" class="confirm-dialog-overlay">
    <div class="confirm-dialog">
      <div class="confirm-dialog-header">
        <h3>{{ title }}</h3>
      </div>
      <div class="confirm-dialog-content">
        <p>{{ message }}</p>
      </div>
      <div class="confirm-dialog-actions">
        <button class="cancel-btn" @click="cancel">İptal</button>
        <button class="confirm-btn" @click="confirm">Tamam</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Onay'
  },
  message: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['confirm', 'cancel']);
const isVisible = ref(false);

function show() {
  isVisible.value = true;
}

function hide() {
  isVisible.value = false;
}

function confirm() {
  emit('confirm');
  hide();
}

function cancel() {
  emit('cancel');
  hide();
}

// Bileşene erişim için fonksiyonları dışa aktar
defineExpose({
  show,
  hide
});
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.confirm-dialog {
  background-color: var(--surface-color);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slide-in 0.3s ease;
}

.confirm-dialog-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.confirm-dialog-header h3 {
  margin: 0;
  font-weight: 500;
}

.confirm-dialog-content {
  padding: 1.5rem 1rem;
}

.confirm-dialog-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  gap: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.confirm-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.confirm-btn:hover {
  background-color: var(--primary-dark);
}

@keyframes slide-in {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 