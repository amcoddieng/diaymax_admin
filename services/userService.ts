import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.8:8080'

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

export const userService = {
  // Personne APIs
  getPersons: () =>
    api.get('/api/personnes'),
  
  getPersonById: (id: number) =>
    api.get(`/api/personnes/${id}`),
  
  searchPersons: (nom: string) =>
    api.get(`/api/personnes/search/nom?nom=${nom}`),
  
  countPersons: () =>
    api.get('/api/personnes/count'),
  
  updateProfilePhoto: (id: number, formData: FormData) =>
    api.post(`/api/personnes/${id}/photo-profil`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Compte APIs
  getAccounts: () =>
    api.get('/api/comptes'),
  
  createAccount: (data: any) =>
    api.post('/api/comptes', data),
  
  updateAccountStatus: (id: number, status: 'activate' | 'deactivate') =>
    api.put(`/api/comptes/${id}/${status}`),
  
  verifyAccount: (id: number) =>
    api.put(`/api/comptes/${id}/verify`),
}

export default api
