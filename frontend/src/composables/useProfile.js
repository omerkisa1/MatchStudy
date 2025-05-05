import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import axios from 'axios'

/**
 * @typedef {Object} ProfileData
 * @property {number} profile_id - Profile ID 
 * @property {number} user_id - User ID
 * @property {string} name - User's first name
 * @property {string} surname - User's last name
 * @property {number|null} age - User's age
 * @property {string|null} education_level - User's education level (Bachelor, Master, etc)
 * @property {string|null} institution - User's educational institution
 * @property {string} created_at - When the profile was created
 * @property {string|null} updated_at - When the profile was last updated
 * @property {string|null} avatar - Avatar image URL
 * @property {string[]} interests - List of user interests
 * @property {number} completedStudies - Number of completed study sessions
 * @property {string} rating - User rating
 * @property {number} activeGroups - Number of active study groups
 */

/**
 * @typedef {Object} ProfileUpdateRequest
 * @property {string} [name] - User's first name
 * @property {string} [surname] - User's last name
 * @property {number|null} [age] - User's age
 * @property {string|null} [education_level] - User's education level
 * @property {string|null} [institution] - User's educational institution
 * @property {string|null} [bio] - User's biography
 * @property {string[]} [interests] - List of user interests
 */

/**
 * @typedef {Object} PasswordChangeRequest
 * @property {string} currentPassword - Current password
 * @property {string} newPassword - New password
 * @property {string} confirmPassword - Confirmation of new password
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} message - Response message
 * @property {*} [data] - Response data if any
 * @property {string[]} [errors] - List of errors if any
 */

// API base URL
const API_URL = 'http://localhost:8000'

/**
 * Composable for managing user profile - handles profile data, editing, and uploads
 * @returns {Object} Profile management methods and state
 */
export function useProfile() {
  // Get store
  const userStore = useUserStore()
  
  // UI state
  const isLoading = ref(false)
  const error = ref(null)
  const success = ref(null)
  const isEditing = ref(false)
  const interests = ref([])
  
  // Create a configured axios instance
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  /**
   * Add authorization header to requests if user is authenticated
   */
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  
  // Form state
  /** @type {import('vue').UnwrapRef<ProfileUpdateRequest>} */
  const profileForm = reactive({
    name: '',
    surname: '',
    age: null,
    education_level: '',
    institution: '',
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
    profileForm.surname = userStore.profile.surname || ''
    profileForm.age = userStore.profile.age || null
    profileForm.education_level = userStore.profile.education_level || ''
    profileForm.institution = userStore.profile.institution || ''
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
   * @returns {Promise<ApiResponse>} Result with success status
   */
  const saveProfile = async () => {
    isLoading.value = true
    error.value = null
    success.value = null
    
    try {
      const response = await api.put(`/profiles/update/${userStore.id}`, profileForm)
      const result = response.data
      
      if (result.success) {
        // Update local store with new profile data
        await userStore.updateProfile({
          name: profileForm.name,
          surname: profileForm.surname,
          age: profileForm.age,
          education_level: profileForm.education_level,
          institution: profileForm.institution,
          bio: profileForm.bio
        })
        
        success.value = 'Profile updated successfully!'
        isEditing.value = false
      } else {
        error.value = result.message || 'An error occurred while updating profile'
      }
      
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update profile'
      console.error(err)
      return { 
        success: false, 
        message: 'Failed to update profile',
        errors: [err.message] 
      }
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
      error.value = 'Please select an image file.'
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      error.value = 'File size must be less than 5MB.'
      return
    }
    
    isUploading.value = true
    uploadProgress.value = 0
    error.value = null
    
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await api.post(`/profiles/${userStore.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 0)
          )
        }
      })
      
      const result = response.data
      
      if (result.success) {
        // Update local avatar with returned URL or create a local preview
        const avatarUrl = result.data?.avatar_url || URL.createObjectURL(file)
        await userStore.updateAvatar(avatarUrl)
        success.value = 'Profile picture updated successfully!'
      } else {
        error.value = result.message || 'Failed to update profile picture'
      }
      
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update profile picture'
      console.error(err)
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
      
      // Clear the input value so the same file can be selected again
      if (fileInput.value) fileInput.value.value = ''
    }
  }
  
  /**
   * Add a new interest to the user's profile
   * @param {string} interest - Interest to add
   * @returns {Promise<ApiResponse>} Result with success status
   */
  const addInterest = async (interest) => {
    if (!interest.trim()) return { success: false, message: 'Interest cannot be empty' }
  
    isLoading.value = true
    error.value = null
  
    try {
      // Eğer interest zaten varsa tekrar gönderme
      if (interests.value.includes(interest)) {
        error.value = 'This interest is already added.'
        return { success: false, message: 'Interest already exists' }
      }
  
      const response = await api.post('/user_interests/add', {
        user_id: userStore.id,
        interest: interest.trim()
      })
  
      const result = response.data
  
      if (result.message === "Interest added successfully") {
        await fetchInterests() // ✅ Ekledikten sonra listeyi güncelle
        success.value = 'Interest added successfully!'
        return { success: true }
      } else {
        error.value = result.detail || 'Failed to add interest'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to add interest'
      return {
        success: false,
        message: error.value,
        errors: [err.message]
      }
    } finally {
      isLoading.value = false
    }
  }
  
  
  /**
   * Remove an interest from the user's profile
   * @param {string} interest - Interest to remove
   * @returns {Promise<ApiResponse>} Result with success status
   */
  const removeInterest = async (interest) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/user_interests/delete', {
        user_id: userStore.id,
        interest: interest
      })
      
      const result = response.data
      
      if (result.success) {
        await fetchInterests() // Refresh interests after removal
        success.value = 'Interest removed successfully!'
      } else {
        error.value = result.message || 'Failed to remove interest'
      }
      
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to remove interest'
      console.error(err)
      return { 
        success: false, 
        message: 'Failed to remove interest',
        errors: [err.message] 
      }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Request a password change
   * @param {PasswordChangeRequest} passwordData - Object with current and new password
   * @returns {Promise<ApiResponse>} Result with success status
   */
  const changePassword = async (passwordData) => {
    isLoading.value = true
    error.value = null
    success.value = null
    
    // Validate password data
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error.value = 'New passwords do not match'
      isLoading.value = false
      return {
        success: false,
        message: 'New passwords do not match'
      }
    }
    
    if (passwordData.newPassword.length < 8) {
      error.value = 'New password must be at least 8 characters long'
      isLoading.value = false
      return {
        success: false,
        message: 'New password must be at least 8 characters long'
      }
    }
    
    try {
      const response = await api.post(`/users/${userStore.id}/change-password`, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })
      
      const result = response.data
      
      if (result.success) {
        success.value = 'Password changed successfully!'
      } else {
        error.value = result.message || 'Failed to change password'
      }
      
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to change password'
      console.error(err)
      return { 
        success: false, 
        message: 'Failed to change password',
        errors: [err.message] 
      }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Delete user account
   * @param {string} confirmationText - Text to confirm deletion ("DELETE")
   * @returns {Promise<ApiResponse>} Result with success status
   */
  const deleteAccount = async (confirmationText) => {
    if (confirmationText !== 'DELETE') {
      return {
        success: false,
        message: 'Incorrect confirmation text'
      }
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.delete(`/users/${userStore.id}`)
      const result = response.data
      
      if (result.success) {
        // Log the user out and clear data
        userStore.logout()
        success.value = 'Account deleted successfully!'
      } else {
        error.value = result.message || 'Failed to delete account'
      }
      
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete account'
      console.error(err)
      return { 
        success: false, 
        message: 'Failed to delete account',
        errors: [err.message] 
      }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Fetch user profile data from API
   * @returns {Promise<ProfileData|null>} User profile data
   */
  const fetchProfile = async () => {
    if (!userStore.id) return null
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/profiles/${userStore.id}`)
      const result = response.data
      
      if (result.success && result.data) {
        // Update store with profile data
        await userStore.updateProfile(result.data)
        return result.data
      } else {
        error.value = result.message || 'Failed to fetch profile'
        return null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch profile'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  const fetchInterests = async () => {
    try {
      const response = await api.get(`/user_interests/list/${userStore.id}`)
      if (response.data.success) {
        interests.value = response.data.interests
      } else {
        error.value = response.data.message || "Failed to fetch interests"
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to fetch interests"
    }
  }
  

  /**
   * Initialize the profile data
   */
  const initialize = async () => {
    if (userStore.isAuthenticated) {
      await fetchProfile()
      await fetchInterests()
      initForm()
    }
  }
  
  // Initialize on mount if not explicitly called
  onMounted(initialize)
  
  // Computed properties
  const userInitial = computed(() => {
    const name = userStore.name || ''
    return name.charAt(0).toUpperCase()
  })
  
  const profile = computed(() => userStore.fullProfile)
  
  return {
    // State
    isLoading,
    error,
    success,
    isEditing,
    isUploading,
    uploadProgress,
    profileForm,
    fileInput,
    profile,
    userInitial,
    interests,
    
    // Methods
    initialize,
    fetchProfile,
    startEditing,
    cancelEditing,
    saveProfile,
    triggerFileInput,
    handleAvatarChange,
    addInterest,
    removeInterest,
    changePassword,
    deleteAccount,
    fetchInterests
  }
} 