import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

/**
 * Safe array accessor to prevent "Cannot read properties of undefined (reading 'length')" errors
 * @param {Array|undefined|null} arr - The array to check
 * @returns {Array} - The original array or an empty array if undefined/null
 */
function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

/**
 * Safe property access for objects
 * @param {Object|undefined|null} obj - The object to check
 * @param {String} prop - The property to access
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} - The property value or default
 */
function safeGet(obj, prop, defaultValue = null) {
  if (!obj || typeof obj !== 'object') return defaultValue;
  return obj[prop] !== undefined ? obj[prop] : defaultValue;
}

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
    selectedMatchId: null,
    // Flag to determine if fetch was already performed
    hasFetched: false,
    // Error state
    error: null
  }),

  actions: {
    /**
     * Fetch all matches for the current user
     */
    async fetchMatches() {
      const userStore = useUserStore()
      if (!userStore.id) return
      
      this.isLoading = true
      this.error = null
      
      try {
        // Doğrudan API endpoint URL'sini kullan
        const response = await fetch(`https://matchstudy-production.up.railway.app/matches/user/${userStore.id}`)
        
        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }
        
        const data = await response.json()
        this.matches = Array.isArray(data.matches) ? data.matches : []
        
        console.log('Fetched matches from backend:', this.matches)
        
        this.hasFetched = true
      } catch (error) {
        console.error('Error fetching matches:', error)
        this.error = error.message || 'Eşleşmeler getirilemedi'
        
        // Demo için mock data kullan
        console.log('Using mock matches data for demo')
        this.matches = [
          {
            match_id: 1,
            request_id: 1,
            user1_id: userStore.id,
            user2_id: 2,
            status: 'pending',
            created_at: new Date().toISOString(),
            user1_name: 'Sen',
            user2_name: 'Ali Yılmaz'
          },
          {
            match_id: 2,
            request_id: 2,
            user1_id: 3,
            user2_id: userStore.id,
            status: 'accepted',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            user1_name: 'Ayşe Demir',
            user2_name: 'Sen'
          },
          {
            match_id: 3,
            request_id: 3,
            user1_id: userStore.id,
            user2_id: 4,
            status: 'rejected',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            user1_name: 'Sen',
            user2_name: 'Mehmet Kaya'
          }
        ]
        
        this.hasFetched = true
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
      
      if (!requestData || !requestData.user2_id || !requestData.request_id) {
        return { success: false, error: 'Invalid request data' }
      }

      this.isLoading = true
      this.error = null
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/matches/create?user1_id=${userStore.id}&user2_id=${requestData.user2_id}&request_id=${requestData.request_id}`,
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
        this.error = error.message || 'Eşleşme oluşturulamadı'
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Respond to a match request (accept or reject)
     * @param {Number} matchId - ID of the match to respond to
     * @param {Boolean} accept - Whether to accept the match
     * @returns {Object} - Response with success status
     */
    async respondToMatch(matchId, accept) {
      if (!matchId) {
        return { success: false, error: 'Invalid match ID' }
      }
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/matches/${matchId}/respond`, {
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
        const matchIndex = safeArray(this.matches).findIndex(m => this.getMatchId(m) === matchId)
        if (matchIndex !== -1) {
          this.matches[matchIndex].status = accept ? 'accepted' : 'rejected'
        }

        // Daha doğru bir yaklaşım: güncel listeyi al
        await this.fetchMatches();

        return { success: true }
      } catch (error) {
        console.error('Error responding to match:', error)
        this.error = error.message || 'Yanıt gönderilemedi'
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Set the selected match for viewing details or messaging
     * @param {Number} matchId - ID of the match to select
     */
    selectMatch(matchId) {
      this.selectedMatchId = matchId
    },
    
    /**
     * Clear the selected match
     */
    clearSelectedMatch() {
      this.selectedMatchId = null
    },
    
    /**
     * Ensure matches are fetched if not already done
     */
    async ensureMatchesLoaded() {
      if (!this.hasFetched && !this.isLoading) {
        await this.fetchMatches()
      }
      return this.matches
    },

    /**
     * Get match ID consistently (handles both id and match_id fields)
     * @param {Object} match - The match object
     * @returns {Number} - The match ID
     */
    getMatchId(match) {
      if (!match) return null;
      return safeGet(match, 'match_id', safeGet(match, 'id', null));
    },
    
    /**
     * Clear all matches data (for testing or logout)
     */
    clearMatches() {
      this.matches = [];
      this.selectedMatchId = null;
      this.hasFetched = false;
      this.error = null;
    }
  },

  getters: {
    /**
     * Get all pending matches (waiting for current user's response)
     * @returns {Array} - List of pending matches
     */
    pendingMatches() {
      return safeArray(this.matches).filter(match => match && match.status === 'pending')
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
      // Hem "accepted" hem de "ACCEPTED" olabilir, case-insensitive kontrol yapalım
      const acceptedMatches = safeArray(this.matches).filter(match => 
        match && match.status && match.status.toLowerCase() === 'accepted'
      );
      
      return acceptedMatches;
    },
    
    /**
     * Get the currently selected match
     * @returns {Object|null} - Selected match or null
     */
    selectedMatch() {
      if (!this.selectedMatchId) return null
      
      // Hem id hem de match_id kontrolü yapalım
      return safeArray(this.matches).find(match => 
        match && this.getMatchId(match) === this.selectedMatchId
      ) || null
    },
    
    /**
     * Get match status for a specific study request
     * @param {Number} requestId - ID of the request to check
     * @returns {String|null} - Match status or null
     */
    getMatchStatusForRequest: (state) => (requestId) => {
      if (!requestId) return null;
      const match = safeArray(state.matches).find(m => m && m.request_id === requestId)
      return match ? match.status : null
    },
    
    /**
     * Get pending matches where current user is the responder
     * @returns {Array} - List of pending matches for response
     */
    pendingResponderMatches(state) {
      const userStore = useUserStore()
      if (!userStore.id) return [];
      
      return safeArray(state.matches).filter(
        m => m && m.status === 'pending' && m.responder_id === userStore.id
      )
    }
  }
}) 