import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

/**
 * Notifications Store - handles fetching and storing notifications
 */
export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    // List of all notifications
    notifications: [],
    // Loading state
    isLoading: false,
    // Last fetch timestamp
    lastFetched: null
  }),

  actions: {
    /**
     * Fetch notifications from API
     */
    async fetchNotifications() {
      const userStore = useUserStore()
      if (!userStore.id) return
      
      this.isLoading = true
      try {
        const response = await fetch(`http://127.0.0.1:8000/matches/notifications/${userStore.id}`)
        if (!response.ok) throw new Error('Bildirimler getirilemedi')
        
        const data = await response.json()
        this.notifications = data.notifications || []
        this.lastFetched = new Date()
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Mark a notification as read
     * @param {Number} notificationId - ID of the notification to mark as read
     */
    async markAsRead(notificationId) {
      try {
        // In a real app, this would send a request to the API
        // const response = await fetch(`http://127.0.0.1:8000/notifications/${notificationId}/read`, {
        //   method: 'PUT'
        // })
        
        // if (!response.ok) throw new Error('Notification could not be marked as read')
        
        // Update local state
        const notification = this.notifications.find(n => n.id === notificationId)
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
        // const response = await fetch(`http://127.0.0.1:8000/users/${userStore.id}/notifications/read-all`, {
        //   method: 'PUT'
        // })
        
        // if (!response.ok) throw new Error('Notifications could not be marked as read')
        
        // Update local state
        this.notifications.forEach(notification => {
          notification.read = true
        })
        
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
    }
  },

  getters: {
    /**
     * Get unread notifications count
     * @returns {Number} - Count of unread notifications
     */
    unreadCount() {
      return this.notifications.filter(notification => !notification.read).length
    },
    
    /**
     * Get all unread notifications
     * @returns {Array} - List of unread notifications
     */
    unreadNotifications() {
      return this.notifications.filter(notification => !notification.read)
    },
    
    /**
     * Get all notifications sorted by date (newest first)
     * @returns {Array} - Sorted notifications
     */
    sortedNotifications() {
      return [...this.notifications].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at)
      })
    }
  }
}) 