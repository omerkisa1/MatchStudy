<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <input 
          ref="inputRef"
          type="text" 
          v-model="interestValue" 
          class="interest-input" 
          :placeholder="placeholder"
          @keyup.enter="handleSubmit"
        />
        
        <div v-if="suggestions.length > 0" class="suggestions">
          <div 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
            :class="{ 'active': currentSuggestionIndex === index }"
          >
            {{ suggestion }}
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">{{ cancelText }}</button>
        <button class="submit-btn" @click="handleSubmit" :disabled="isSubmitDisabled">
          {{ submitText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, defineEmits } from 'vue'

export default {
  name: 'InterestModal',
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
      default: 'Add Interest'
    },
    /**
     * Input placeholder text
     */
    placeholder: {
      type: String,
      default: 'Enter an interest...'
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
      default: 'Add'
    },
    /**
     * Minimum length required for the interest
     */
    minLength: {
      type: Number,
      default: 2
    },
    /**
     * Maximum length allowed for the interest
     */
    maxLength: {
      type: Number,
      default: 30
    },
    /**
     * List of interest suggestions
     */
    suggestions: {
      type: Array,
      default: () => []
    },
    /**
     * List of existing interests (to prevent duplicates)
     */
    existingInterests: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'submit'],
  setup(props, { emit }) {
    const interestValue = ref('')
    const inputRef = ref(null)
    const currentSuggestionIndex = ref(-1)
    
    const isSubmitDisabled = computed(() => {
      // Check if interest is too short or too long
      if (interestValue.value.length < props.minLength || 
          interestValue.value.length > props.maxLength) {
        return true
      }
      
      // Check if interest already exists
      return props.existingInterests.includes(interestValue.value.trim())
    })
    
    // Reset form and focus the input when modal opens
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        interestValue.value = ''
        currentSuggestionIndex.value = -1
        nextTick(() => {
          inputRef.value?.focus()
        })
      }
    })
    
    const closeModal = () => {
      emit('update:modelValue', false)
    }
    
    const handleSubmit = () => {
      const value = interestValue.value.trim()
      if (value && !isSubmitDisabled.value) {
        emit('submit', value)
        interestValue.value = ''
        closeModal()
      }
    }
    
    const selectSuggestion = (suggestion) => {
      interestValue.value = suggestion
      handleSubmit()
    }
    
    // Handle keyboard navigation for suggestions
    const handleKeyNavigation = (event) => {
      if (!props.suggestions.length) return
      
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        currentSuggestionIndex.value = Math.min(
          currentSuggestionIndex.value + 1, 
          props.suggestions.length - 1
        )
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        currentSuggestionIndex.value = Math.max(currentSuggestionIndex.value - 1, 0)
      } else if (event.key === 'Enter' && currentSuggestionIndex.value >= 0) {
        event.preventDefault()
        selectSuggestion(props.suggestions[currentSuggestionIndex.value])
      }
    }
    
    return {
      interestValue,
      inputRef,
      currentSuggestionIndex,
      isSubmitDisabled,
      closeModal,
      handleSubmit,
      selectSuggestion,
      handleKeyNavigation
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
  position: relative;
}

.interest-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
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
}

.submit-btn:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.suggestions {
  position: absolute;
  left: 1rem;
  right: 1rem;
  background: white;
  border: 1px solid #ced4da;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
}

.suggestion-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.suggestion-item:hover, .suggestion-item.active {
  background-color: #f8f9fa;
}
</style> 