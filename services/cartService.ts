import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://98c3-102-164-160-251.ngrok-free.app"

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

export const cartService = {
  // Cart Management
  createCart: (clientId: number) =>
    api.post('/api/paniers', { clientId }),
  
  getCartById: (cartId: number) =>
    api.get(`/api/paniers/${cartId}`),
  
  updateCart: (cartId: number, data: any) =>
    api.put(`/api/paniers/${cartId}`, data),
  
  deleteCart: (cartId: number) =>
    api.delete(`/api/paniers/${cartId}`),
  
  // Cart Items Management
  addItemToCart: (clientId: number, articleId: number, quantite: number, prixUnitaire: number) =>
    api.post(`/api/paniers/client/${clientId}/ajouter`, { articleId, quantite, prixUnitaire }),
  
  getCartItems: (cartId: number) =>
    api.get(`/api/paniers/${cartId}`),
  
  updateCartItem: (cartId: number, articleId: number, quantite: number) =>
    api.put(`/api/paniers/${cartId}/article/${articleId}/quantite?quantite=${quantite}`),
  
  deleteCartItem: (cartId: number, articleId: number) =>
    api.delete(`/api/paniers/${cartId}/article/${articleId}`),
  
  // Special Actions
  validateCart: (cartId: number) =>
    api.post(`/api/paniers/${cartId}/valider`),
  
  getCartsByClient: (clientId: number) =>
    api.get(`/api/paniers/client/${clientId}`),

  getAllCarts: () =>
    api.get('/api/paniers'),
  
  // Additional utility methods based on API documentation
  getActiveCartByClient: (clientId: number) =>
    api.get(`/api/paniers/client/${clientId}/actif`),
  
  clearCart: (cartId: number) =>
    api.delete(`/api/paniers/${cartId}/vider`),
  
  removeItemFromCart: (cartId: number, articleId: number) =>
    api.delete(`/api/paniers/${cartId}/article/${articleId}`),
}

export default api
