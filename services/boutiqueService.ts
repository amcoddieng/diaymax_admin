import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.153.54.247:8080"

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

export const boutiqueService = {
  getBoutiques: () =>
    api.get('/api/boutiques'),
  
  getBoutiqueById: (id: number) =>
    api.get(`/api/boutiques/${id}`),
  
  createBoutique: (formData: FormData) =>
    api.post('/api/boutiques/with-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateBoutique: (id: number, data: any) =>
    api.put(`/api/boutiques/${id}`, data),
  
  updateBoutiqueLogo: (id: number, formData: FormData) =>
    api.post(`/api/boutiques/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateBoutiqueInfo: (id: number, data: any) =>
    api.put(`/api/boutiques/${id}/infos`, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  
  updateBoutiqueNote: (id: number, note: number) =>
    api.put(`/api/boutiques/${id}/note?note=${note}`),
  
  updateBoutiqueStatus: (id: number, statut: string) =>
    api.put(`/api/boutiques/${id}/statut?statut=${statut}`),
  
  getBoutiquesByVendeur: (vendeurId: number) =>
    api.get(`/api/boutiques/vendeur/${vendeurId}`),
  
  searchBoutiques: (keyword: string) =>
    api.get(`/api/boutiques/search?keyword=${keyword}`),
  
  getBoutiquesByStatus: (statut: string) =>
    api.get(`/api/boutiques/statut/${statut}`),
  
  // Vendeur specific APIs
  getVendeurBoutiques: () =>
    api.get('/api/boutiques/mes-boutiques'),
  
  getVendeurBoutique: () =>
    api.get('/api/boutiques/ma-boutique'),
}

export default api
