import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

// Backend URL (hardcoded for consistent API calls)
const BACKEND_URL = 'https://matchstudy-production.up.railway.app';

/**
 * Safe array accessor to prevent "Cannot read properties of undefined (reading 'length')" errors
 * @param {Array|undefined|null} arr - The array to check
 * @returns {Array} - The original array or an empty array if undefined/null
 */
function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

/**
 * Notifications Store - handles fetching and storing notifications
 */
export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    // List of all notifications
    notifications: [],
    friendRequests: [],
    // Loading state
    isLoading: false,
    // Last fetch timestamp
    lastFetched: null,
    // Error state
    error: null
  }),

  actions: {
    /**
     * Fetch notifications from API
     */
    async fetchNotifications() {
      const userStore = useUserStore()
      if (!userStore.id) return
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await fetch(`${BACKEND_URL}/matches/notifications/${userStore.id}`)
        if (!response.ok) throw new Error('Bildirimler getirilemedi')
        
        const data = await response.json()
        this.notifications = Array.isArray(data.notifications) ? data.notifications : []
        this.lastFetched = new Date()
      } catch (error) {
        console.error('Error fetching notifications:', error)
        this.error = error.message || 'Bildirimler yüklenemedi'
        this.notifications = []
      } finally {
        this.isLoading = false
      }
    },

    async fetchFriendRequests() {
      const userStore = useUserStore()
      if (!userStore.id) return
    
      this.isLoading = true
      this.error = null
      
      try {
        const res = await fetch(`${BACKEND_URL}/friend_requests/get_friend_requests?user_id=${userStore.id}`)
        if (!res.ok) throw new Error("Arkadaşlık istekleri alınamadı")
        const data = await res.json()
        this.friendRequests = Array.isArray(data.requests) ? data.requests : []
      } catch (error) {
        console.error("Error fetching friend requests:", error)
        this.error = error.message || 'Arkadaşlık istekleri yüklenemedi'
        this.friendRequests = []
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Mark a notification as read
     * @param {Number} notificationId - ID of the notification to mark as read
     */
    async markAsRead(notificationId) {
      if (!notificationId) return { success: false, error: 'Invalid notification ID' }
      
      try {
        // In a real app, this would send a request to the API
        // const response = await fetch(`${BACKEND_URL}/notifications/${notificationId}/read`, {
        //   method: 'PUT'
        // })
        
        // if (!response.ok) throw new Error('Notification could not be marked as read')
        
        // Update local state
        const notification = this.notifications.find(n => n && n.id === notificationId)
        if (notification) notification.read = true
        
        return { success: true }
      } catch (error) {
        console.error('Error marking notification as read:', error)
        return { success: false, error: error.message }
      }
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
      try {
        // In a real app, this would send a request to the API
        // const userStore = useUserStore()
        // const response = await fetch(`${BACKEND_URL}/users/${userStore.id}/notifications/read-all`, {
        //   method: 'PUT'
        // })
        
        // if (!response.ok) throw new Error('Notifications could not be marked as read')
        
        // Update local state - safely handle the array
        if (Array.isArray(this.notifications)) {
          this.notifications.forEach(notification => {
            if (notification) notification.read = true
          })
        }
        
        return { success: true }
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
        return { success: false, error: error.message }
      }
    },
    
    /**
     * Refresh notifications if they haven't been fetched recently
     * @param {Number} minutes - Minutes threshold for refresh
     */
    async refreshIfNeeded(minutes = 5) {
      if (!this.lastFetched) {
        await this.fetchNotifications()
        return
      }
      
      const now = new Date()
      const diffMs = now - this.lastFetched
      const diffMinutes = Math.floor(diffMs / 60000)
      
      if (diffMinutes >= minutes) {
        await this.fetchNotifications()
      }
    },
    
    /**
     * Clear all notifications (for testing or logout)
     */
    clearNotifications() {
      this.notifications = []
      this.friendRequests = []
      this.lastFetched = null
      this.error = null
    }
  },

  getters: {
    /**
     * Get unread notifications count
     * @returns {Number} - Count of unread notifications
     */
    unreadCount() {
      return safeArray(this.notifications).filter(notification => notification && !notification.read).length
    },
    
    /**
     * Get all unread notifications
     * @returns {Array} - List of unread notifications
     */
    unreadNotifications() {
      return safeArray(this.notifications).filter(notification => notification && !notification.read)
    },
    
    /**
     * Get all notifications sorted by date (newest first)
     * @returns {Array} - Sorted notifications
     */
    sortedNotifications() {
      return safeArray(this.notifications).sort((a, b) => {
        if (!a || !a.created_at) return 1
        if (!b || !b.created_at) return -1
        return new Date(b.created_at) - new Date(a.created_at)
      })
    },
    
    /**
     * Get pending friend requests
     * @returns {Array} - List of pending friend requests
     */
    pendingFriendRequests() {
      return safeArray(this.friendRequests).filter(req => req && req.status === 'pending')
    }
  }
}) 