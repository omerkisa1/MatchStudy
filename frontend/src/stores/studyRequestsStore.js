import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

/**
 * Study Requests Store - handles all logic related to study requests
 * Creates, fetches, and filters study requests
 */
export const useStudyRequestsStore = defineStore('studyRequests', {
  state: () => ({
    // All study requests in the system
    allRequests: [],
    // User's own study requests
    userRequests: [],
    // User's past study requests
    pastRequests: [],
    // Loading states
    isLoading: false,
    // Filter states
    filters: {
      category: null,
      duration: null,
      date: null
    }
  }),

  actions: {
    /**
     * Fetch all study requests from API
     */
    async fetchAllRequests() {
      this.isLoading = true
      try {
        const apiUrl = `${import.meta.env.VITE_APP_API_URL}/study_requests/all`;
        console.log('Fetching study requests from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Invalid content type. Response:', text.substring(0, 500));
          throw new Error('Invalid content type, expected JSON');
        }
        
        const data = await response.json();
        console.log('Study requests data received:', data);
        
        this.allRequests = data.requests || [];
      } catch (error) {
        console.error('Error fetching study requests:', error);
        // Reset allRequests to empty array on error to prevent further issues
        this.allRequests = [];
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch user's study requests from API
     */
    async fetchUserRequests() {
      const userStore = useUserStore()
      if (!userStore.id) return
      
      this.isLoading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/study_requests/user/${userStore.id}`)
        if (!response.ok) {
          throw new Error('İstekler getirilemedi')
        }
        const data = await response.json()
        // Add default status if missing
        this.userRequests = (data.requests || []).map(request => ({
          ...request,
          status: request.status || 'pending'
        }))
      } catch (error) {
        console.error('Error fetching user study requests:', error)
        this.userRequests = []
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch user's past study requests from API (where study_date < today)
     */
    async fetchPastRequests() {
      const userStore = useUserStore()
      if (!userStore.id) return
      
      this.isLoading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/study_requests/user/${userStore.id}/history`)
        if (!response.ok) {
          throw new Error('Geçmiş istekler getirilemedi')
        }
        const data = await response.json()
        this.pastRequests = data.requests || []
      } catch (error) {
        console.error('Error fetching past study requests:', error)
        this.pastRequests = []
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Create a new study request
     * @param {Object} requestData - Study request data
     * @returns {Object} - Response with success status
     */
    async createRequest(requestData) {
      const userStore = useUserStore()
      if (!userStore.id) {
        return { success: false, error: 'User not authenticated' }
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/study_requests/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userStore.id,
            ...requestData
          })
        })

        const responseData = await response.json()
        if (!response.ok) {
          throw new Error(responseData.detail || 'Bir hata oluştu')
        }

        // Refresh user requests after creation
        await this.fetchUserRequests()
        return { success: true }
      } catch (error) {
        console.error('Error creating study request:', error)
        return { success: false, error: error.message }
      }
    },

    /**
     * Set filter values for discovery page
     * @param {Object} filterData - Filter criteria
     */
    setFilters({ category, duration, date }) {
      this.filters = {
        category: category !== undefined ? category : this.filters.category,
        duration: duration !== undefined ? duration : this.filters.duration,
        date: date !== undefined ? date : this.filters.date
      }
    },

    /**
     * Clear all filters
     */
    clearFilters() {
      this.filters = {
        category: null,
        duration: null,
        date: null
      }
    }
  },

  getters: {
    /**
     * Get filtered study requests based on current filter criteria
     * @returns {Array} - Filtered study requests
     */
    filteredRequests() {
      const userStore = useUserStore()
      
      return this.allRequests.filter(request => {
        // Skip own requests
        if (request.user_id === userStore.id) return false
        
        let matchCategory = true
        let matchDuration = true
        let matchDate = true

        // Apply category filter
        if (this.filters.category) {
          matchCategory = request.category === this.filters.category
        }

        // Apply duration filter
        if (this.filters.duration) {
          matchDuration = request.duration === parseInt(this.filters.duration.value.split('-')[1])
        }

        // Apply date filter
        if (this.filters.date) {
          const requestDate = new Date(request.study_date).toISOString().split('T')[0]
          matchDate = requestDate === this.filters.date
        }

        return matchCategory && matchDuration && matchDate
      })
    },
    
    /**
     * Get study requests that have not been handled yet
     * @returns {Array} - Open study requests
     */
    openRequests() {
      return this.userRequests.filter(req => 
        req.status === 'pending' || req.status === 'active'
      )
    }
  }
}) 