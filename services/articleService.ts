import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://c3c9-102-164-160-251.ngrok-free.app"

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

export const articleService = {
  // Article CRUD operations
  createArticle: (data: {
    produitId: number
    sku: string
    prix: number
    stockActuel: number
    attributs: string
    image?: string
  }) => api.post('/api/articles', data),
  
  createArticleWithImage: (produitId: number, formData: FormData) =>
    api.post(`/api/articles/with-image?produitId=${produitId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  getArticlesByProduct: (produitId: number) =>
    api.get(`/api/articles/produit/${produitId}`),
  
  getArticleBySku: (sku: string) =>
    api.get(`/api/articles/sku/${sku}`),
  
  updateArticle: (id: number, data: {
    produitId: number
    sku: string
    prix: number
    stockActuel: number
    attributs: string
    image?: string
  }) => api.put(`/api/articles/${id}`, data),
  
  deleteArticle: (id: number) =>
    api.delete(`/api/articles/${id}`),
  
  // Image management
  updateArticleImage: (id: number, formData: FormData) =>
    api.post(`/api/articles/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Stock management
  updateStock: (id: number, newStock: number) =>
    api.put(`/api/articles/${id}/stock?newStock=${newStock}`),
  
  addStock: (id: number, quantity: number, motif: string) =>
    api.put(`/api/articles/${id}/stock/add?quantity=${quantity}&motif=${encodeURIComponent(motif)}`),
  
  removeStock: (id: number, quantity: number, motif: string) =>
    api.put(`/api/articles/${id}/stock/remove?quantity=${quantity}&motif=${encodeURIComponent(motif)}`),
  
  // Search and filter
  getOutOfStockArticles: () =>
    api.get('/api/articles/out-of-stock'),
  
  getArticlesByPriceRange: (min: number, max: number) =>
    api.get(`/api/articles/price-range?min=${min}&max=${max}`),
  
  searchArticles: (keyword: string) =>
    api.get(`/api/articles/search?keyword=${encodeURIComponent(keyword)}`),
  
  getArticlesWithStockGreaterThan: (stock: number) =>
    api.get(`/api/articles/stock/greater/${stock}`),
  
  getArticlesWithStockLessThan: (stock: number) =>
    api.get(`/api/articles/stock/less/${stock}`),
  
  // Statistics
  getOutOfStockCount: () =>
    api.get('/api/articles/count/out-of-stock'),
  
  getMinPriceByProduct: (produitId: number) =>
    api.get(`/api/articles/price/min/${produitId}`),
  
  getMaxPriceByProduct: (produitId: number) =>
    api.get(`/api/articles/price/max/${produitId}`),
  
  getTotalStockByProduct: (produitId: number) =>
    api.get(`/api/articles/stock/total/${produitId}`),
  
  // Get all articles (if endpoint exists)
  getAllArticles: () =>
    api.get('/api/articles'),
}

export default api
