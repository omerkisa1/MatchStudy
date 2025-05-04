import { defineStore } from 'pinia'

/**
 * User store - handles user data, authentication info, avatar, and preferences
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    email: null,
    name: null,
    isAuthenticated: false,
    profile: {
      university: '',
      department: '',
      bio: '',
      avatar: null,
      completedStudies: 0,
      rating: '0.0',
      activeGroups: 0,
      interests: []
    }
  }),
  
  actions: {
    /**
     * Login user and store data
     * @param {Object} userData - User data from authentication
     */
    login(userData) {
      this.id = userData.id
      this.email = userData.email
      this.name = userData.name
      this.isAuthenticated = true

      // Store user info in localStorage
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('userEmail', userData.email)
      localStorage.setItem('userName', userData.name)
    },
    
    /**
     * Logout user and clear data
     */
    logout() {
      this.id = null
      this.email = null
      this.name = null
      this.isAuthenticated = false
      this.profile = {
        university: '',
        department: '',
        bio: '',
        avatar: null,
        completedStudies: 0,
        rating: '0.0',
        activeGroups: 0,
        interests: []
      }

      // Clear user data from localStorage
      localStorage.removeItem('userId')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userName')
    },

    /**
     * Check if user is authenticated from localStorage
     * @returns {Boolean} Authentication status
     */
    checkAuth() {
      const userId = localStorage.getItem('userId')
      const userEmail = localStorage.getItem('userEmail')
      const userName = localStorage.getItem('userName')

      if (userId && userEmail && userName) {
        this.id = parseInt(userId)
        this.email = userEmail
        this.name = userName
        this.isAuthenticated = true
        return true
      }

      return false
    },
    
    /**
     * Update user profile information
     * @param {Object} profileData - Updated profile data
     */
    async updateProfile(profileData) {
      try {
        // Here you would typically make an API call to update the user profile
        // const response = await fetch(`http://127.0.0.1:8000/users/${this.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(profileData)
        // })
        
        // if (!response.ok) throw new Error('Profile update failed')
        
        // Update local state
        this.profile = { ...this.profile, ...profileData }
        
        // If name has changed, update it in both state and localStorage
        if (profileData.name) {
          this.name = profileData.name
          localStorage.setItem('userName', profileData.name)
        }
        
        return { success: true }
      } catch (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: error.message }
      }
    },
    
    /**
     * Update user avatar
     * @param {String} avatarUrl - URL of the new avatar
     */
    async updateAvatar(avatarUrl) {
      try {
        // API call would go here in a real app
        this.profile.avatar = avatarUrl
        return { success: true }
      } catch (error) {
        console.error('Error updating avatar:', error)
        return { success: false, error: error.message }
      }
    },
    
    /**
     * Fetch user profile data from API
     */
    async fetchUserProfile() {
      if (!this.id) return
      
      try {
        // In a real app, fetch from API
        // const response = await fetch(`http://127.0.0.1:8000/users/${this.id}/profile`)
        // if (!response.ok) throw new Error('Failed to fetch profile')
        // const data = await response.json()
        // this.profile = data
        
        // For now, set some default data if profile is empty
        if (!this.profile.interests.length) {
          this.profile.interests = ['Matematik', 'Fizik', 'Programlama']
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }
  },
  
  getters: {
    /**
     * Get user's full profile data
     */
    fullProfile() {
      return {
        id: this.id,
        email: this.email,
        name: this.name,
        ...this.profile
      }
    },
    
    /**
     * Get user display name or fallback
     */
    displayName() {
      return this.name || 'Öğrenci'
    }
  },
  
  persist: true // Persists state on page reload
}) 