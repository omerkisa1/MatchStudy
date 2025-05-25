import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * User store - handles user data, authentication info, avatar, and preferences
 */
export const useUserStore = defineStore('user', () => {
  const id = ref(null)
  const name = ref('')
  const surname = ref('')
  const email = ref('')
  const age = ref(null)
  const gender = ref('')
  const education_level = ref('')
  const interests = ref([])
  const totalUnreadMessages = ref(0)
  const isAuthenticated = ref(false)
  const profile = ref({
    university: '',
    department: '',
    bio: '',
    avatar: null,
    completedStudies: 0,
    rating: '0.0',
    activeGroups: 0,
    interests: []
  })

  /**
   * Login user and store data
   * @param {Object} userData - User data from authentication
   */
  function login(userData) {
    id.value = userData.id
    email.value = userData.email
    name.value = userData.name
    isAuthenticated.value = true

    // Store user info in localStorage
    localStorage.setItem('userId', userData.id)
    localStorage.setItem('userEmail', userData.email)
    localStorage.setItem('userName', userData.name)
  }
  
  /**
   * Set all user data
   * @param {Object} userData - Complete user data 
   */
  function setUser(userData) {
    id.value = userData.id
    name.value = userData.name
    surname.value = userData.surname || ''
    email.value = userData.email
    age.value = userData.age
    gender.value = userData.gender
    education_level.value = userData.education_level
    interests.value = userData.interests || []
    isAuthenticated.value = true
  }
  
  /**
   * Update total unread messages count
   * @param {number} count - Number of unread messages 
   */
  function updateTotalUnreadMessages(count) {
    //console.log("Toplam okunmamış mesaj sayısı güncelleniyor:", count);
    totalUnreadMessages.value = count;
  }
  
  /**
   * Increment unread messages count by 1
   */
  function incrementUnreadMessages() {
    //console.log("Okunmamış mesaj sayısı artırılıyor, şu anki değer:", totalUnreadMessages.value);
    totalUnreadMessages.value++;
    //console.log("Artırıldıktan sonraki değer:", totalUnreadMessages.value);
  }
  
  /**
   * Logout user and clear data
   */
  async function logout() {
    try {
      const { getSocket } = await import('@/socket');
      const socket = getSocket();
      if (socket && id.value) {
        socket.emit('user_logout', id.value);
        await new Promise((resolve) => setTimeout(resolve, 10));
        socket.disconnect();
      }
    } catch (e) {
      console.warn("Socket logout emit edilemedi:", e);
    }
  
    id.value = null
    email.value = null
    name.value = null
    surname.value = ''
    age.value = null
    gender.value = ''
    education_level.value = ''
    interests.value = []
    isAuthenticated.value = false
    totalUnreadMessages.value = 0
    profile.value = {
      university: '',
      department: '',
      bio: '',
      avatar: null,
      completedStudies: 0,
      rating: '0.0',
      activeGroups: 0,
      interests: []
    }
  
    // Local storage temizle
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
  }
  

  /**
   * Check if user is authenticated from localStorage
   * @returns {Boolean} Authentication status
   */
  function checkAuth() {
    const userId = localStorage.getItem('userId')
    const userEmail = localStorage.getItem('userEmail')
    const userName = localStorage.getItem('userName')

    if (userId && userEmail && userName) {
      id.value = parseInt(userId)
      email.value = userEmail
      name.value = userName
      isAuthenticated.value = true
      return true
    }

    return false
  }
  
  /**
   * Update user profile information
   * @param {Object} profileData - Updated profile data
   */
  async function updateProfile(profileData) {
    try {
      // Here you would typically make an API call to update the user profile
      // const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/users/${id.value}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profileData)
      // })
      
      // if (!response.ok) throw new Error('Profile update failed')
      
      // Update local state
      profile.value = { ...profile.value, ...profileData }
      
      // If name has changed, update it in both state and localStorage
      if (profileData.name) {
        name.value = profileData.name
        localStorage.setItem('userName', profileData.name)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Update user avatar
   * @param {String} avatarUrl - URL of the new avatar
   */
  async function updateAvatar(avatarUrl) {
    try {
      // API call would go here in a real app
      profile.value.avatar = avatarUrl
      return { success: true }
    } catch (error) {
      console.error('Error updating avatar:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Fetch user profile data from API
   */
  async function fetchUserProfile() {
    if (!id.value) return
    
    try {
      // In a real app, fetch from API
      // const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/users/${id.value}/profile`)
      // if (!response.ok) throw new Error('Failed to fetch profile')
      // const data = await response.json()
      // profile.value = data
      
      // For now, set some default data if profile is empty
      if (!profile.value.interests.length) {
        profile.value.interests = ['Matematik', 'Fizik', 'Programlama']
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }
  
  /**
   * Clear all user data
   */
  function clearUser() {
    id.value = null
    name.value = ''
    surname.value = ''
    email.value = ''
    age.value = null
    gender.value = ''
    education_level.value = ''
    interests.value = []
    totalUnreadMessages.value = 0
    isAuthenticated.value = false
  }

  // Computed properties
  const isLoggedIn = computed(() => !!id.value)
  const fullName = computed(() => `${name.value} ${surname.value}`)
  const displayName = computed(() => name.value || 'Öğrenci')
  const fullProfile = computed(() => ({ 
    id: id.value,
    email: email.value,
    name: name.value,
    ...profile.value
  }))
  
  return { 
    id, 
    name, 
    surname, 
    email, 
    age, 
    gender,
    education_level,
    interests,
    totalUnreadMessages,
    isAuthenticated,
    profile,
    fullName,
    isLoggedIn,
    displayName,
    fullProfile,
    setUser,
    clearUser,
    updateTotalUnreadMessages,
    incrementUnreadMessages,
    login,
    logout,
    checkAuth,
    updateProfile,
    updateAvatar,
    fetchUserProfile
  }
}, {
  persist: true // Persists state on page reload
}) 