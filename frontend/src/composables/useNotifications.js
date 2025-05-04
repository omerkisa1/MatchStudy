import { ref, computed, onMounted, watchEffect } from 'vue'
import { useNotificationsStore } from '../stores/notificationsStore'
import { useUserStore } from '../stores/userStore'

/**
 * Composable for managing notifications - handles fetching and updating notification states
 */
export function useNotifications() {
  // Get stores
  const notificationsStore = useNotificationsStore()
  const userStore = useUserStore()
  
  // UI state
  const isLoading = ref(false)
  const error = ref(null)
  const selectedNotificationId = ref(null)
  
  /**
   * Fetch all notifications for the current user
   */
  const fetchNotifications = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      await notificationsStore.fetchNotifications()
    } catch (err) {
      error.value = 'Bildirimler yüklenirken bir hata oluştu.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Set up polling for new notifications
   * @param {Number} intervalMinutes - Polling interval in minutes
   * @returns {Function} - Function to stop polling
   */
  const startNotificationPolling = (intervalMinutes = 1) => {
    if (!userStore.id) return () => {}
    
    const intervalId = setInterval(() => {
      notificationsStore.refreshIfNeeded(intervalMinutes)
    }, intervalMinutes * 60 * 1000)
    
    // Return cleanup function
    return () => clearInterval(intervalId)
  }
  
  /**
   * Mark a notification as read
   * @param {Number} notificationId - ID of the notification to mark
   */
  const markAsRead = async (notificationId) => {
    isLoading.value = true
    error.value = null
    
    try {
      await notificationsStore.markAsRead(notificationId)
    } catch (err) {
      error.value = 'Bildirim okundu olarak işaretlenirken bir hata oluştu.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      await notificationsStore.markAllAsRead()
    } catch (err) {
      error.value = 'Bildirimler okundu olarak işaretlenirken bir hata oluştu.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Select a notification to view details
   * @param {Number} notificationId - ID of the notification to select
   */
  const selectNotification = (notificationId) => {
    selectedNotificationId.value = notificationId
    
    // Auto-mark as read when selected
    if (notificationId) {
      markAsRead(notificationId)
    }
  }
  
  /**
   * Format the timestamp for display
   * @param {String} timestamp - ISO timestamp
   * @returns {String} Formatted date/time
   */
  const formatNotificationTime = (timestamp) => {
    const now = new Date()
    const notificationDate = new Date(timestamp)
    const diffMs = now - notificationDate
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 1) return 'Şimdi'
    if (diffMinutes < 60) return `${diffMinutes} dakika önce`
    if (diffHours < 24) return `${diffHours} saat önce`
    if (diffDays < 30) return `${diffDays} gün önce`
    
    // Default to formatted date for older notifications
    return notificationDate.toLocaleDateString('tr-TR')
  }
  
  // Computed properties
  
  /**
   * Get all notifications, sorted by date
   */
  const notifications = computed(() => notificationsStore.sortedNotifications)
  
  /**
   * Get unread notifications
   */
  const unreadNotifications = computed(() => notificationsStore.unreadNotifications)
  
  /**
   * Get unread notifications count
   */
  const unreadCount = computed(() => notificationsStore.unreadCount)
  
  /**
   * Get the currently selected notification
   */
  const selectedNotification = computed(() => {
    if (!selectedNotificationId.value) return null
    return notifications.value.find(n => n.id === selectedNotificationId.value) || null
  })
  
  /**
   * Check if notifications are currently loading
   */
  const isNotificationsLoading = computed(() => isLoading.value || notificationsStore.isLoading)
  
  /**
   * Initialize by loading data and starting polling
   */
  const initialize = async () => {
    if (!userStore.id) return
    
    await fetchNotifications()
    return startNotificationPolling()
  }
  
  // Auto cleanup when component is unmounted
  let stopPolling
  
  onMounted(() => {
    if (userStore.id) {
      stopPolling = initialize()
    }
    
    // Setup watcher for auth state changes
    watchEffect(() => {
      if (userStore.id && !stopPolling) {
        stopPolling = initialize()
      } else if (!userStore.id && stopPolling) {
        stopPolling()
        stopPolling = null
      }
    })
  })
  
  return {
    // State
    isLoading: isNotificationsLoading,
    error,
    selectedNotificationId,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    selectNotification,
    startNotificationPolling,
    
    // Computed values
    notifications,
    unreadNotifications,
    unreadCount,
    selectedNotification,
    
    // Helpers
    formatNotificationTime
  }
} 