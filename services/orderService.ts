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

export const orderService = {
  // Get all orders
  getOrders: () =>
    api.get('/api/commandes'),
  
  // Get order by ID
  getOrderById: (id: number) =>
    api.get(`/api/commandes/${id}`),
  
  // Get orders by client
  getOrdersByClient: (clientId: number) =>
    api.get(`/api/commandes/client/${clientId}`),
  
  // Get orders by boutique
  getOrdersByBoutique: (boutiqueId: number) =>
    api.get(`/api/commandes/boutique/${boutiqueId}`),
  
  // Get orders by status
  getOrdersByStatus: (status: string) =>
    api.get(`/api/commandes/statut/${status}`),
  
  // Get orders by payment status
  getOrdersByPaymentStatus: (status: string) =>
    api.get(`/api/commandes/paiement/${status}`),
  
  // Update order status
  updateOrderStatus: (orderId: number, status: string) =>
    api.put(`/api/commandes/${orderId}/statut?statut=${status}`),
  
  // Update payment status
  updatePaymentStatus: (orderId: number, status: string) =>
    api.put(`/api/commandes/${orderId}/paiement?statutPaiement=${status}`),
  
  // Cancel order
  cancelOrder: (orderId: number) =>
    api.post(`/api/commandes/${orderId}/annuler`),
  
  // Delete order (admin only)
  deleteOrder: (orderId: number) =>
    api.delete(`/api/commandes/${orderId}`),
  
  // Get total revenue
  getTotalRevenue: () =>
    api.get('/api/commandes/chiffre-affaires'),
  
  // Create order from cart
  createOrderFromCart: (cartId: number) =>
    api.post(`/api/commandes/creer/${cartId}`),
}

export default api
