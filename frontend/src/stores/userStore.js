import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    email: null,
    name: null,
    isAuthenticated: false
  }),
  
  actions: {
    login(userData) {
      this.id = userData.id
      this.email = userData.email
      this.name = userData.name
      this.isAuthenticated = true

      // Kullanıcı bilgilerini localStorage'a kaydet
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('userEmail', userData.email)
      localStorage.setItem('userName', userData.name)
    },
    
    logout() {
      this.id = null
      this.email = null
      this.name = null
      this.isAuthenticated = false

      // localStorage'dan kullanıcı bilgilerini temizle
      localStorage.removeItem('userId')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userName')
    },

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
    }
  },
  
  persist: true // Bu sayede sayfa yenilendiğinde bile veriler kaybolmayacak
}) 