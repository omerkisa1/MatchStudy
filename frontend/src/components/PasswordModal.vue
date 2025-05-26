<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="current-password" class="form-label">Mevcut Şifre</label>
            <input 
              type="password" 
              id="current-password"
              v-model="passwordForm.currentPassword" 
              class="form-input"
              :class="{ 'is-invalid': validation.currentPassword }"
              autocomplete="current-password"
              placeholder="Mevcut şifrenizi girin"
              ref="initialFocus"
            />
            <div v-if="validation.currentPassword" class="validation-message">
              {{ validation.currentPassword }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="new-password" class="form-label">Yeni Şifre</label>
            <input 
              type="password" 
              id="new-password"
              v-model="passwordForm.newPassword" 
              class="form-input"
              :class="{ 'is-invalid': validation.newPassword }"
              autocomplete="new-password"
              placeholder="Yeni şifrenizi girin"
            />
            <div v-if="validation.newPassword" class="validation-message">
              {{ validation.newPassword }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirm-password" class="form-label">Yeni Şifre (Tekrar)</label>
            <input 
              type="password" 
              id="confirm-password"
              v-model="passwordForm.confirmPassword" 
              class="form-input"
              :class="{ 'is-invalid': validation.confirmPassword }"
              autocomplete="new-password"
              placeholder="Yeni şifrenizi tekrar girin"
            />
            <div v-if="validation.confirmPassword" class="validation-message">
              {{ validation.confirmPassword }}
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">{{ cancelText }}</button>
        <button 
          class="submit-btn" 
          :disabled="isLoading || !isFormValid" 
          @click="handleSubmit"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span>{{ submitText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick } from 'vue'

export default {
  name: 'PasswordModal',
  props: {
    /**
     * Controls whether the modal is visible
     */
    modelValue: {
      type: Boolean,
      required: true
    },
    /**
     * Modal title
     */
    title: {
      type: String,
      default: 'Şifre Değiştir'
    },
    /**
     * Text for the cancel button
     */
    cancelText: {
      type: String,
      default: 'İptal'
    },
    /**
     * Text for the submit button
     */
    submitText: {
      type: String,
      default: 'Şifreyi Değiştir'
    },
    /**
     * Loading state
     */
    isLoading: {
      type: Boolean,
      default: false
    },
    /**
     * Error message from API
     */
    error: {
      type: String,
      default: ''
    },
    /**
     * Minimum password length
     */
    minPasswordLength: {
      type: Number,
      default: 8
    }
  },
  emits: ['update:modelValue', 'submit'],
  setup(props, { emit }) {
    const initialFocus = ref(null)
    
    // Password form state
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // Validation state
    const validation = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // Reset the form when the modal opens
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        resetForm()
        nextTick(() => {
          initialFocus.value?.focus()
        })
      }
    })
    
    // Form validation
    const validateForm = () => {
      // Reset validation messages
      validation.currentPassword = ''
      validation.newPassword = ''
      validation.confirmPassword = ''
      
      let isValid = true
      
      // Validate current password
      if (!passwordForm.currentPassword) {
        validation.currentPassword = 'Mevcut şifrenizi girmelisiniz'
        isValid = false
      }
      
      // Validate new password
      if (!passwordForm.newPassword) {
        validation.newPassword = 'Yeni şifre gereklidir'
        isValid = false
      } else if (passwordForm.newPassword.length < props.minPasswordLength) {
        validation.newPassword = `Şifre en az ${props.minPasswordLength} karakter olmalıdır`
        isValid = false
      }
      
      // Validate confirmation
      if (!passwordForm.confirmPassword) {
        validation.confirmPassword = 'Lütfen yeni şifrenizi tekrar girin'
        isValid = false
      } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        validation.confirmPassword = 'Şifreler eşleşmiyor'
        isValid = false
      }
      
      return isValid
    }
    
    const isFormValid = computed(() => {
      return (
        !!passwordForm.currentPassword &&
        !!passwordForm.newPassword &&
        !!passwordForm.confirmPassword &&
        passwordForm.newPassword === passwordForm.confirmPassword &&
        passwordForm.newPassword.length >= props.minPasswordLength
      )
    })
    
    const resetForm = () => {
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      
      validation.currentPassword = ''
      validation.newPassword = ''
      validation.confirmPassword = ''
    }
    
    const closeModal = () => {
      emit('update:modelValue', false)
    }
    
    const handleSubmit = () => {
      if (validateForm()) {
        emit('submit', {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        })
      }
    }
    
    return {
      passwordForm,
      validation,
      isFormValid,
      initialFocus,
      closeModal,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: var(--surface-color);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modal-in 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--error-color);
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  background-color: var(--input-bg-color);
  color: var(--text-primary);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(126, 87, 194, 0.2);
  outline: none;
}

.form-input.is-invalid {
  border-color: var(--error-color);
}

.validation-message {
  color: var(--error-color);
  font-size: 0.85rem;
  margin-top: 5px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid var(--border-color);
  gap: 10px;
}

.cancel-btn {
  padding: 10px 15px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: var(--surface-hover);
}

.submit-btn {
  padding: 10px 20px;
  background-color: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #6a5acd;
}

.submit-btn:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
  opacity: 0.7;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.error-message {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--error-color);
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

@keyframes modal-in {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style> 