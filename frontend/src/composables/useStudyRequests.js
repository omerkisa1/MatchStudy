import { ref, reactive, computed, onMounted } from 'vue'
import { useStudyRequestsStore } from '../stores/studyRequestsStore'
import { useMatchesStore } from '../stores/matchesStore'
import { useUserStore } from '../stores/userStore'

/**
 * Composable for managing study requests - handles fetch/create/filter/join logic and state
 */
export function useStudyRequests() {
  // Get stores
  const studyRequestsStore = useStudyRequestsStore()
  const matchesStore = useMatchesStore()
  const userStore = useUserStore()
  
  // Local UI state
  const isLoading = ref(false)
  const error = ref(null)
  const success = ref(null)
  
  // Form state for creating requests
  const requestForm = reactive({
    category: null,
    duration: null,
    study_date: null,
    topic: '',
    note: ''
  })
  
  // Filter state for discovery
  const filters = reactive({
    category: null,
    duration: null,
    date: null
  })
  
  /**
   * Reset the request form to initial state
   */
  const resetForm = () => {
    requestForm.category = null
    requestForm.duration = null
    requestForm.study_date = null
    requestForm.topic = ''
    requestForm.note = ''
  }
  
  /**
   * Fetch all study requests
   */
  const fetchAllRequests = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      await studyRequestsStore.fetchAllRequests()
    } catch (err) {
      error.value = 'Çalışma istekleri yüklenirken bir hata oluştu.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Fetch the current user's study requests
   */
  const fetchUserRequests = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      await studyRequestsStore.fetchUserRequests()
    } catch (err) {
      error.value = 'Çalışma istekleriniz yüklenirken bir hata oluştu.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Create a new study request
   * @returns {Object} Result with success status
   */
  const createRequest = async () => {
    isLoading.value = true
    error.value = null
    success.value = null
    
    // Validate form
    if (!requestForm.category || !requestForm.duration || !requestForm.study_date || !requestForm.topic.trim()) {
      error.value = 'Lütfen tüm gerekli alanları doldurun.'
      isLoading.value = false
      return { success: false }
    }
    
    try {
      const result = await studyRequestsStore.createRequest({
        category: requestForm.category,
        duration: requestForm.duration.value || requestForm.duration,
        study_date: requestForm.study_date,
        topic: requestForm.topic,
        note: requestForm.note
      })
      
      if (result.success) {
        success.value = 'Çalışma isteği başarıyla oluşturuldu!'
        resetForm()
      } else {
        error.value = result.error || 'Çalışma isteği oluşturulurken bir hata oluştu.'
      }
      
      return result
    } catch (err) {
      error.value = 'Çalışma isteği oluşturulurken bir hata oluştu.'
      console.error(err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Join/apply to a study request
   * @param {Object} request - The study request to join
   * @returns {Object} Result with success status
   */
  const joinRequest = async (request) => {
    if (!userStore.id) {
      error.value = 'Önce giriş yapmalısınız.'
      return { success: false }
    }
    
    if (userStore.id === request.user_id) {
      error.value = 'Kendi isteğinize başvuru yapamazsınız.'
      return { success: false }
    }
    
    isLoading.value = true
    error.value = null
    success.value = null
    
    try {
      const result = await matchesStore.createMatch({
        user2_id: request.user_id,
        request_id: request.request_id || request.id
      })
      
      if (result.success) {
        success.value = 'İstek başarıyla gönderildi!'
        await fetchAllRequests() // Refresh the list to update statuses
      } else {
        error.value = result.error || 'İstek gönderilirken bir hata oluştu.'
      }
      
      return result
    } catch (err) {
      error.value = 'İstek gönderilirken bir hata oluştu.'
      console.error(err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Apply filters to the discovery page
   * @param {Object} newFilters - Object containing filter values
   */
  const applyFilters = (newFilters = {}) => {
    // Update local reactive state
    if (newFilters.category !== undefined) filters.category = newFilters.category
    if (newFilters.duration !== undefined) filters.duration = newFilters.duration
    if (newFilters.date !== undefined) filters.date = newFilters.date
    
    // Apply to store
    studyRequestsStore.setFilters({
      category: filters.category,
      duration: filters.duration,
      date: filters.date
    })
  }
  
  /**
   * Clear all applied filters
   */
  const clearFilters = () => {
    filters.category = null
    filters.duration = null
    filters.date = null
    studyRequestsStore.clearFilters()
  }
  
  /**
   * Format a date for display
   * @param {String} dateString - Date string to format
   * @returns {String} Formatted date
   */
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('tr-TR', options)
  }
  
  /**
   * Get current date in ISO format (YYYY-MM-DD)
   * @returns {String} Current date in ISO format
   */
  const getCurrentDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  
  /**
   * Get max selectable date (3 months from now)
   * @returns {String} Max date in ISO format
   */
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return maxDate.toISOString().split('T')[0]
  }
  
  // Computed properties
  
  /**
   * Get filtered study requests
   */
  const filteredRequests = computed(() => studyRequestsStore.filteredRequests)
  
  /**
   * Get user's study requests
   */
  const userRequests = computed(() => studyRequestsStore.userRequests)
  
  /**
   * Get user's active/open study requests
   */
  const openRequests = computed(() => studyRequestsStore.openRequests)
  
  /**
   * Get the match status of a specific request
   */
  const getMatchStatus = (requestId) => {
    return matchesStore.getMatchStatusForRequest()(requestId)
  }
  
  /**
   * Check if requests are currently loading
   */
  const isRequestsLoading = computed(() => isLoading.value || studyRequestsStore.isLoading)
  
  /**
   * Initialize by loading data
   */
  const initialize = async () => {
    await Promise.all([
      fetchAllRequests(),
      fetchUserRequests(),
      matchesStore.fetchMatches()
    ])
  }
  
  // Auto-initialize if autoInit is true
  onMounted(() => {
    if (userStore.id) {
      initialize()
    }
  })
  
  return {
    // State
    requestForm,
    filters,
    isLoading: isRequestsLoading,
    error,
    success,
    
    // Actions
    fetchAllRequests,
    fetchUserRequests,
    createRequest,
    joinRequest,
    applyFilters,
    clearFilters,
    resetForm,
    initialize,
    
    // Computed values
    filteredRequests,
    userRequests,
    openRequests,
    
    // Helpers
    formatDate,
    getCurrentDate,
    getMaxDate,
    getMatchStatus
  }
} 