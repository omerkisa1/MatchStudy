import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'

/**
 * Composable for managing user profile - handles profile data, editing, and uploads
 */
export function useProfile() {
  // Get store
  const userStore = useUserStore()
  
  // UI state
  const isLoading = ref(false)
  const error = ref(null)
  const success = ref(null)
  const isEditing = ref(false)
  
  // Form state
  const profileForm = reactive({
    name: '',
    university: '',
    department: '',
    bio: ''
  })
  
  // File upload state
  const fileInput = ref(null)
  const uploadProgress = ref(0)
  const isUploading = ref(false)
  
  /**
   * Initialize profile form with current user data
   */
  const initForm = () => {
    profileForm.name = userStore.name || ''
    profileForm.university = userStore.profile.university || ''
    profileForm.department = userStore.profile.department || ''
    profileForm.bio = userStore.profile.bio || ''
  }
  
  /**
   * Start editing profile
   */
  const startEditing = () => {
    initForm()
    isEditing.value = true
  }
  
  /**
   * Cancel editing and reset form
   */
  const cancelEditing = () => {
    isEditing.value = false
    initForm()
  }
  
  /**
   * Save profile changes
   * @returns {Object} Result with success status
   */
  const saveProfile = async () => {
    isLoading.value = true
    error.value = null
    success.value = null
    
    try {
      const result = await userStore.updateProfile({
        name: profileForm.name,
        university: profileForm.university,
        department: profileForm.department,
        bio: profileForm.bio
      })
      
      if (result.success) {
        success.value = 'Profil başarıyla güncellendi!'
        isEditing.value = false
      } else {
        error.value = result.error || 'Profil güncellenirken bir hata oluştu.'
      }
      
      return result
    } catch (err) {
      error.value = 'Profil güncellenirken bir hata oluştu.'
      console.error(err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Trigger file input click for avatar upload
   */
  const triggerFileInput = () => {
    if (fileInput.value) {
      fileInput.value.click()
    }
  }
  
  /**
   * Handle avatar file selection and upload
   * @param {Event} event - File input change event
   */
  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      error.value = 'Lütfen bir resim dosyası seçin.'
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      error.value = 'Dosya boyutu 5MB\'dan küçük olmalıdır.'
      return
    }
    
    isUploading.value = true
    uploadProgress.value = 0
    error.value = null
    
    try {
      // In a real app, you would upload to a server
      // For now, we'll just use FileReader to get a data URL
      const reader = new FileReader()
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          uploadProgress.value = Math.round((e.loaded / e.total) * 100)
        }
      }
      
      reader.onload = async (e) => {
        const result = await userStore.updateAvatar(e.target.result)
        
        if (result.success) {
          success.value = 'Profil fotoğrafı başarıyla güncellendi!'
        } else {
          error.value = result.error || 'Profil fotoğrafı güncellenirken bir hata oluştu.'
        }
        
        isUploading.value = false
        uploadProgress.value = 0
      }
      
      reader.onerror = () => {
        error.value = 'Dosya okunurken bir hata oluştu.'
        isUploading.value = false
      }
      
      reader.readAsDataURL(file)
    } catch (err) {
      error.value = 'Profil fotoğrafı güncellenirken bir hata oluştu.'
      isUploading.value = false
      console.error(err)
    }
    
    // Clear the input value so the same file can be selected again
    if (fileInput.value) fileInput.value.value = ''
  }
  
  /**
   * Add a new interest to the user's profile
   * @param {String} interest - Interest to add
   */
  const addInterest = async (interest) => {
    if (!interest.trim()) return
    
    isLoading.value = true
    error.value = null
    
    try {
      // Make a copy of the current interests
      const updatedInterests = [...userStore.profile.interests]
      
      // Check if interest already exists
      if (updatedInterests.includes(interest)) {
        error.value = 'Bu ilgi alanı zaten eklenmiş.'
        isLoading.value = false
        return { success: false }
      }
      
      // Add the new interest
      updatedInterests.push(interest)
      
      const result = await userStore.updateProfile({
        interests: updatedInterests
      })
      
      if (result.success) {
        success.value = 'İlgi alanı başarıyla eklendi!'
      } else {
        error.value = result.error || 'İlgi alanı eklenirken bir hata oluştu.'
      }
      
      return result
    } catch (err) {
      error.value = 'İlgi alanı eklenirken bir hata oluştu.'
      console.error(err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Remove an interest from the user's profile
   * @param {String} interest - Interest to remove
   */
  const removeInterest = async (interest) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Filter out the interest to remove
      const updatedInterests = userStore.profile.interests.filter(i => i !== interest)
      
      const result = await userStore.updateProfile({
        interests: updatedInterests
      })
      
      if (result.success) {
        success.value = 'İlgi alanı başarıyla kaldırıldı!'
      } else {
        error.value = result.error || 'İlgi alanı kaldırılırken bir hata oluştu.'
      }
      
      return result
    } catch (err) {
      error.value = 'İlgi alanı kaldırılırken bir hata oluştu.'
      console.error(err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Request a password change
   * @param {Object} passwordData - Object with current and new password
   */
  const changePassword = async (passwordData) => {
    isLoading.value = true
    error.value = null
    success.value = null
    
    try {
      // In a real app, you would call an API here
      // For now, just show a success message
      
      console.log('Password change requested for user:', userStore.id)
      // await api.changePassword(passwordData)
      
      success.value = 'Şifreniz başarıyla değiştirildi!'
      return { success: true }
    } catch (err) {
      error.value = 'Şifre değiştirilirken bir hata oluştu.'
      console.error(err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Request account deletion
   * @param {String} confirmationText - Confirmation text for deletion
   */
  const deleteAccount = async (confirmationText) => {
    if (confirmationText !== 'DELETE') {
      error.value = 'Hesap silme işlemini onaylamak için DELETE yazın.'
      return { success: false }
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // In a real app, you would call an API here
      // For now, just log out the user
      
      console.log('Account deletion requested for user:', userStore.id)
      // await api.deleteAccount(userStore.id)
      
      userStore.logout()
      return { success: true }
    } catch (err) {
      error.value = 'Hesap silinirken bir hata oluştu.'
      console.error(err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }
  
  // Computed properties
  
  /**
   * Get user's initials for avatar fallback
   */
  const userInitial = computed(() => {
    return userStore.name ? userStore.name.charAt(0).toUpperCase() : 'K'
  })
  
  /**
   * Get full user profile data
   */
  const profile = computed(() => userStore.fullProfile)
  
  /**
   * Get user profile completion percentage
   */
  const profileCompletionPercentage = computed(() => {
    const profile = userStore.profile
    let total = 0
    let completed = 0
    
    // Count fields that can be completed
    total += 5 // name, email, university, department, bio
    
    // Count fields that are completed
    if (userStore.name) completed++
    if (userStore.email) completed++
    if (profile.university) completed++
    if (profile.department) completed++
    if (profile.bio) completed++
    
    // Calculate percentage
    return Math.round((completed / total) * 100)
  })
  
  /**
   * Initialize profile data if needed
   */
  const initialize = async () => {
    isLoading.value = true
    
    try {
      await userStore.fetchUserProfile()
      initForm()
    } catch (err) {
      console.error('Error initializing profile:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Initialize on mount
  onMounted(() => {
    if (userStore.id) {
      initialize()
    }
  })
  
  return {
    // State
    isLoading,
    error,
    success,
    isEditing,
    profileForm,
    fileInput,
    isUploading,
    uploadProgress,
    
    // Actions
    initialize,
    startEditing,
    cancelEditing,
    saveProfile,
    triggerFileInput,
    handleAvatarChange,
    addInterest,
    removeInterest,
    changePassword,
    deleteAccount,
    
    // Computed values
    userInitial,
    profile,
    profileCompletionPercentage
  }
} 