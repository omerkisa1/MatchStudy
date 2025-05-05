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
            <label for="current-password">Current Password</label>
            <input 
              type="password" 
              id="current-password"
              v-model="passwordForm.currentPassword" 
              class="form-input"
              :class="{ 'is-invalid': validation.currentPassword }"
              autocomplete="current-password"
              ref="initialFocus"
            />
            <div v-if="validation.currentPassword" class="validation-message">
              {{ validation.currentPassword }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="new-password">New Password</label>
            <input 
              type="password" 
              id="new-password"
              v-model="passwordForm.newPassword" 
              class="form-input"
              :class="{ 'is-invalid': validation.newPassword }"
              autocomplete="new-password"
            />
            <div v-if="validation.newPassword" class="validation-message">
              {{ validation.newPassword }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirm-password">Confirm New Password</label>
            <input 
              type="password" 
              id="confirm-password"
              v-model="passwordForm.confirmPassword" 
              class="form-input"
              :class="{ 'is-invalid': validation.confirmPassword }"
              autocomplete="new-password"
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
      default: 'Change Password'
    },
    /**
     * Text for the cancel button
     */
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    /**
     * Text for the submit button
     */
    submitText: {
      type: String,
      default: 'Change Password'
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
        validation.currentPassword = 'Current password is required'
        isValid = false
      }
      
      // Validate new password
      if (!passwordForm.newPassword) {
        validation.newPassword = 'New password is required'
        isValid = false
      } else if (passwordForm.newPassword.length < props.minPasswordLength) {
        validation.newPassword = `Password must be at least ${props.minPasswordLength} characters`
        isValid = false
      }
      
      // Validate confirmation
      if (!passwordForm.confirmPassword) {
        validation.confirmPassword = 'Please confirm your new password'
        isValid = false
      } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        validation.confirmPassword = 'Passwords do not match'
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
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input.is-invalid {
  border-color: #dc3545;
}

.validation-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-message {
  background-color: #f8d7da;
  color: #842029;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn {
  padding: 0.5rem 1rem;
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style> 