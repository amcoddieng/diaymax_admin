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
  addItemToCart: (cartId: number, articleId: number, quantite: number) =>
    api.post(`/api/paniers/${cartId}/items`, { articleId, quantite }),
  
  getCartItems: (cartId: number) =>
    api.get(`/api/paniers/${cartId}/items`),
  
  updateCartItem: (itemId: number, quantite: number) =>
    api.put(`/api/paniers/items/${itemId}`, { quantite }),
  
  deleteCartItem: (itemId: number) =>
    api.delete(`/api/paniers/items/${itemId}`),
  
  // Special Actions
  validateCart: (cartId: number) =>
    api.put(`/api/paniers/${cartId}/valider`),
  
  getCartsByClient: (clientId: number) =>
    api.get(`/api/paniers/client/${clientId}`),
  
  // Additional utility methods based on API documentation
  getActiveCartByClient: (clientId: number) =>
    api.get(`/api/paniers/client/${clientId}/actif`),
  
  clearCart: (cartId: number) =>
    api.delete(`/api/paniers/${cartId}/vider`),
  
  updateItemQuantity: (cartId: number, articleId: number, quantite: number) =>
    api.put(`/api/paniers/${cartId}/article/${articleId}/quantite?quantite=${quantite}`),
  
  removeItemFromCart: (cartId: number, articleId: number) =>
    api.delete(`/api/paniers/${cartId}/article/${articleId}`),
}

export default api
