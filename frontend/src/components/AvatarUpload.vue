<template>
  <div class="avatar-upload">
    <div class="avatar-container" @click="triggerFileInput">
      <div class="avatar" :class="{ 'has-image': avatarUrl }">
        <span v-if="!avatarUrl">{{ displayInitial }}</span>
        <img v-else :src="avatarUrl" alt="Profile Picture" />
        <div class="avatar-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
      </div>
    </div>
    
    <button v-if="showUploadButton" class="upload-button" @click="triggerFileInput">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      Upload Photo
    </button>
    
    <input 
      type="file" 
      ref="fileInput" 
      class="file-input"
      accept="image/*"
      @change="handleFileChange"
    />
    
    <div v-if="isUploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
      <div class="progress-text">{{ uploadProgress }}%</div>
    </div>
    
    <div v-if="error" class="upload-error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, computed, defineEmits } from 'vue'

export default {
  name: 'AvatarUpload',
  props: {
    /**
     * Current avatar URL (if any)
     */
    avatarUrl: {
      type: String,
      default: ''
    },
    /**
     * User's initial to display when no avatar is available
     */
    initial: {
      type: String,
      default: '?'
    },
    /**
     * Whether to show the upload button beneath the avatar
     */
    showUploadButton: {
      type: Boolean,
      default: true
    },
    /**
     * Maximum file size in bytes (default: 5MB)
     */
    maxSize: {
      type: Number,
      default: 5 * 1024 * 1024 // 5MB
    },
    /**
     * Whether an upload is in progress
     */
    isUploading: {
      type: Boolean,
      default: false
    },
    /**
     * Upload progress percentage (0-100)
     */
    uploadProgress: {
      type: Number,
      default: 0
    },
    /**
     * Error message if upload failed
     */
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['file-selected', 'upload-error'],
  setup(props, { emit }) {
    const fileInput = ref(null)
    
    const displayInitial = computed(() => {
      return props.initial.charAt(0).toUpperCase()
    })
    
    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }
    
    const handleFileChange = (event) => {
      const file = event.target.files?.[0]
      if (!file) return
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        emit('upload-error', 'Please select an image file')
        return
      }
      
      // Validate file size
      if (file.size > props.maxSize) {
        const maxSizeMB = props.maxSize / (1024 * 1024)
        emit('upload-error', `File size must be less than ${maxSizeMB}MB`)
        return
      }
      
      // Emit the selected file to parent
      emit('file-selected', file)
      
      // Clear the input value so the same file can be selected again
      if (fileInput.value) fileInput.value.value = ''
    }
    
    return {
      fileInput,
      triggerFileInput,
      handleFileChange,
      displayInitial
    }
  }
}
</script>

<style scoped>
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.avatar-container {
  cursor: pointer;
  position: relative;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid #f0f0f0;
  font-size: 2.5rem;
  font-weight: bold;
  color: #666;
  position: relative;
}

.avatar.has-image {
  background-color: transparent;
  border-color: #ddd;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 50%;
}

.avatar-overlay svg {
  width: 24px;
  height: 24px;
  color: white;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.upload-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-button:hover {
  background-color: #e9ecef;
}

.upload-button svg {
  width: 16px;
  height: 16px;
}

.file-input {
  display: none;
}

.upload-progress {
  width: 100%;
  margin-top: 0.5rem;
}

.progress-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #4361ee;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.upload-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
}
</style> 