import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.153.54.247:8080"
console.log("s",process.env.NEXT_PUBLIC_API_URL || "http://10.153.54.247:8080")
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  logout: () =>
    api.post('/api/auth/logout'),
  
  getCurrentUser: () =>
    api.get('/api/auth/me'),
  
  diagnostic: {
    checkEmail: (email: string) =>
      api.get(`/api/auth/diagnostic/check-email/${email}`),
    
    listAccounts: () =>
      api.get('/api/auth/diagnostic/list-accounts')
  }
  
}

export default api
