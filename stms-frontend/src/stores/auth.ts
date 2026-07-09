import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('stms_token'))
  const user = ref<User | null>(JSON.parse(localStorage.getItem('stms_user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(email: string, password: string) {
    const res = await axios.post('/api/v1/auth/login', { email, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('stms_token', res.data.token)
    localStorage.setItem('stms_user', JSON.stringify(res.data.user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('stms_token')
    localStorage.removeItem('stms_user')
    delete axios.defaults.headers.common['Authorization']
  }

  function init() {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }
  }

  return { token, user, isAuthenticated, login, logout, init }
})
