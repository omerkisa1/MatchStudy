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
  
  function setUser(userData) {
    id.value = userData.id
    name.value = userData.name
    surname.value = userData.surname
    email.value = userData.email
    age.value = userData.age
    gender.value = userData.gender
    education_level.value = userData.education_level
    interests.value = userData.interests || []
  }
  
  function updateTotalUnreadMessages(count) {
    totalUnreadMessages.value = count
  }
  
  function incrementUnreadMessages() {
    totalUnreadMessages.value++
  }
  
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
  }

  const isLoggedIn = computed(() => !!id.value)
  const fullName = computed(() => `${name.value} ${surname.value}`)
  
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
    fullName,
    isLoggedIn,
    setUser,
    clearUser,
    updateTotalUnreadMessages,
    incrementUnreadMessages
  }
}) 