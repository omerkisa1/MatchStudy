import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './userStore'
import { studyRequestsApi } from '@/services/api'

/**
 * Safe array accessor to prevent "Cannot read properties of undefined (reading 'length')" errors
 * @param {Array|undefined|null} arr - The array to check
 * @returns {Array} - The original array or an empty array if undefined/null
 */
function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

/**
 * Study Requests Store - handles all logic related to study requests
 * Creates, fetches, and filters study requests
 */
export const useStudyRequestsStore = defineStore('studyRequests', () => {
  const userStore = useUserStore()
  
  // State
  const allRequests = ref([])
  const userRequests = ref([])
  const pastRequests = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Actions
  /**
   * Fetch all study requests from API
   */
  const fetchAllRequests = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await studyRequestsApi.getAllRequests()
      allRequests.value = Array.isArray(response.requests) ? response.requests : []
      return allRequests.value
    } catch (err) {
      console.error('API error response:', err)
      error.value = `API error: ${err.message}`
      allRequests.value = []
      throw new Error('Tüm istekler getirilemedi')
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch user's study requests from API
   */
  const fetchUserRequests = async () => {
    if (!userStore.id) return []
    
    loading.value = true
    error.value = null
    
    try {
      const response = await studyRequestsApi.getUserRequests(userStore.id)
      userRequests.value = Array.isArray(response.requests) ? response.requests : []
      return userRequests.value
    } catch (err) {
      console.error('Error fetching user study requests:', err)
      error.value = err.message
      userRequests.value = []
      throw new Error('İstekler getirilemedi')
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch user's past study requests from API (where study_date < today)
   */
  const fetchPastRequests = async () => {
    if (!userStore.id) return []
    
    loading.value = true
    error.value = null
    
    try {
      const response = await studyRequestsApi.getUserRequests(userStore.id, true)
      pastRequests.value = Array.isArray(response.requests) ? response.requests : []
      return pastRequests.value
    } catch (err) {
      console.error('Error fetching past requests:', err)
      error.value = err.message
      pastRequests.value = []
      throw new Error('Geçmiş istekler getirilemedi')
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new study request
   */
  const createStudyRequest = async (requestData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await studyRequestsApi.createRequest({
        ...requestData,
        user_id: userStore.id
      })
      
      // Kullanıcı isteklerini yenile
      await fetchUserRequests()
      return response
    } catch (err) {
      console.error('Error creating study request:', err)
      error.value = err.message
      throw new Error('İstek oluşturulamadı')
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a study request
   */
  const deleteStudyRequest = async (requestId) => {
    loading.value = true
    error.value = null
    
    try {
      await studyRequestsApi.deleteRequest(requestId)
      
      // Listeden sil
      userRequests.value = safeArray(userRequests.value).filter(req => req && req.id !== requestId)
      allRequests.value = safeArray(allRequests.value).filter(req => req && req.id !== requestId)
      
      return true
    } catch (err) {
      console.error('Error deleting study request:', err)
      error.value = err.message
      throw new Error('İstek silinemedi')
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const activeRequests = computed(() => {
    return safeArray(userRequests.value).filter(req => {
      if (!req) return false;
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const requestDate = new Date(req.study_date)
      requestDate.setHours(0, 0, 0, 0)
      
      return requestDate >= today
    })
  })
  
  // Open requests (always returns an array even if empty)
  const openRequests = computed(() => {
    return safeArray(userRequests.value).filter(req => {
      if (!req) return false;
      return req.status === 'open' || !req.status;
    });
  })

  return {
    // State
    allRequests,
    userRequests,
    pastRequests,
    loading,
    error,
    
    // Actions
    fetchAllRequests,
    fetchUserRequests,
    fetchPastRequests,
    createStudyRequest,
    deleteStudyRequest,
    
    // Computed
    activeRequests,
    openRequests
  }
}) 