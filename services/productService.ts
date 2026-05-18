import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.153.46.247:8080"

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

export const productService = {
  getProducts: () =>
    api.get('/api/produits'),
  
  getProductById: (id: number) =>
    api.get(`/api/produits/${id}`),
  
  createProduct: (formData: FormData) =>
    api.post('/api/produits/with-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateProduct: (id: number, data: any) =>
    api.put(`/api/produits/${id}`, data),
  
  deleteProduct: (id: number) =>
    api.delete(`/api/produits/${id}`),
  
  // Search APIs
  searchProducts: (params: any) =>
    api.get('/api/produits/search/combined', { params }),
  
  searchProductsByBoutiqueAndCategory: (params: any) =>
    api.get('/api/produits/search/boutique-souscategorie-nom', { params }),
}

export default api
