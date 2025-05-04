import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

/**
 * Matches Store - handles match status, sending responses, and pending count
 */
export const useMatchesStore = defineStore('matches', {
  state: () => ({
    // List of all matches for the user
    matches: [],
    // Loading state
    isLoading: false,
    // Selected match for viewing details
    selectedMatchId: null
  }),

  actions: {
    /**
     * Fetch all matches for the current user
     */
    async fetchMatches() {
      const userStore = useUserStore()
      if (!userStore.id) return
      
      this.isLoading = true
      try {
        const response = await fetch(`http://127.0.0.1:8000/matches/user/${userStore.id}`)
        if (!response.ok) throw new Error('Eşleşmeler getirilemedi')
        
        const data = await response.json()
        this.matches = data.matches || []
      } catch (error) {
        console.error('Error fetching matches:', error)
        this.matches = []
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Create a new match request (join a study request)
     * @param {Object} requestData - Request data with user IDs and request ID
     * @returns {Object} - Response with success status
     */
    async createMatch(requestData) {
      const userStore = useUserStore()
      if (!userStore.id) {
        return { success: false, error: 'User not authenticated' }
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/matches/create?user1_id=${userStore.id}&user2_id=${requestData.user2_id}&request_id=${requestData.request_id}`,
          { method: 'POST' }
        )

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.detail || 'İstek gönderilemedi.')
        }

        // Refresh matches after creating a new one
        await this.fetchMatches()
        return { success: true }
      } catch (error) {
        console.error('Error creating match:', error)
        return { success: false, error: error.message }
      }
    },

    /**
     * Respond to a match request (accept or reject)
     * @param {Number} matchId - ID of the match to respond to
     * @param {Boolean} accept - Whether to accept the match
     * @returns {Object} - Response with success status
     */
    async respondToMatch(matchId, accept) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/matches/${matchId}/respond`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: accept ? 'accepted' : 'rejected'
          })
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.detail || 'İşlem yapılamadı')
        }

        // Update the local match status
        const matchIndex = this.matches.findIndex(m => m.id === matchId)
        if (matchIndex !== -1) {
          this.matches[matchIndex].status = accept ? 'accepted' : 'rejected'
        }

        return { success: true }
      } catch (error) {
        console.error('Error responding to match:', error)
        return { success: false, error: error.message }
      }
    },

    /**
     * Set the selected match for viewing details
     * @param {Number} matchId - ID of the match to select
     */
    selectMatch(matchId) {
      this.selectedMatchId = matchId
    }
  },

  getters: {
    /**
     * Get all pending matches (waiting for current user's response)
     * @returns {Array} - List of pending matches
     */
    pendingMatches() {
      return this.matches.filter(match => match.status === 'pending')
    },
    
    /**
     * Get count of pending matches
     * @returns {Number} - Count of pending matches
     */
    pendingMatchesCount() {
      return this.pendingMatches.length
    },
    
    /**
     * Get all accepted matches
     * @returns {Array} - List of accepted matches
     */
    acceptedMatches() {
      return this.matches.filter(match => match.status === 'accepted')
    },
    
    /**
     * Get the currently selected match
     * @returns {Object|null} - Selected match or null
     */
    selectedMatch() {
      if (!this.selectedMatchId) return null
      return this.matches.find(match => match.id === this.selectedMatchId) || null
    },
    
    /**
     * Get match status for a specific study request
     * @returns {Function} - Function that returns match status for a request
     */
    getMatchStatusForRequest() {
      return (requestId) => {
        const match = this.matches.find(m => m.request_id === requestId)
        return match ? match.status : null
      }
    }
  }
}) 