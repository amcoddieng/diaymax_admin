import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.43.97:8080" || 'http://192.168.43.97:8080'

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

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  logout: () =>
    api.post('/api/auth/logout'),
  
  getCurrentUser: () =>
    api.get('/api/auth/me'),
}

// User Management APIs
export const userAPI = {
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
  
  getAccounts: () =>
    api.get('/api/comptes'),
  
  updateAccountStatus: (id: number, status: 'activate' | 'deactivate') =>
    api.put(`/api/comptes/${id}/${status}`),
  
  verifyAccount: (id: number) =>
    api.put(`/api/comptes/${id}/verify`),
}

// Boutique Management APIs
export const boutiqueAPI = {
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
}

// Category Management APIs
export const categoryAPI = {
  getCategories: () =>
    api.get('/api/categories'),
  
  getCategoriesWithSubCategories: () =>
    api.get('/api/categories/with-sous-categories'),
  
  createCategory: (data: any) =>
    api.post('/api/categories', data),
  
  updateCategory: (id: number, data: any) =>
    api.put(`/api/categories/${id}`, data),
  
  deleteCategory: (id: number) =>
    api.delete(`/api/categories/${id}`),
  
  searchCategories: (keyword: string) =>
    api.get(`/api/categories/search?keyword=${keyword}`),
}

// SubCategory Management APIs
export const subCategoryAPI = {
  getSubCategories: () =>
    api.get('/api/sous-categories'),
  
  getSubCategoriesWithCategory: () =>
    api.get('/api/sous-categories/with-categorie'),
  
  getSubCategoriesByCategory: (categoryId: number) =>
    api.get(`/api/sous-categories/categorie/${categoryId}`),
  
  createSubCategory: (data: any) =>
    api.post('/api/sous-categories', data),
  
  updateSubCategory: (id: number, data: any) =>
    api.put(`/api/sous-categories/${id}`, data),
  
  deleteSubCategory: (id: number) =>
    api.delete(`/api/sous-categories/${id}`),
  
  searchSubCategories: (keyword: string) =>
    api.get(`/api/sous-categories/search/with-categorie?keyword=${keyword}`),
}

// Product Management APIs
export const productAPI = {
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
  
  searchProducts: (params: any) =>
    api.get('/api/produits/search/combined', { params }),
}

// Article Management APIs
export const articleAPI = {
  getArticles: () =>
    api.get('/api/articles'),
  
  getArticlesByProduct: (productId: number) =>
    api.get(`/api/articles/produit/${productId}`),
  
  getArticleBySku: (sku: string) =>
    api.get(`/api/articles/sku/${sku}`),
  
  createArticle: (data: any) =>
    api.post('/api/articles', data),
  
  createArticleWithImage: (formData: FormData) =>
    api.post('/api/articles/with-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateArticle: (id: number, data: any) =>
    api.put(`/api/articles/${id}`, data),
  
  deleteArticle: (id: number) =>
    api.delete(`/api/articles/${id}`),
  
  updateStock: (id: number, newStock: number) =>
    api.put(`/api/articles/${id}/stock?newStock=${newStock}`),
  
  addStock: (id: number, quantity: number, motif: string) =>
    api.put(`/api/articles/${id}/stock/add?quantity=${quantity}&motif=${motif}`),
  
  removeStock: (id: number, quantity: number, motif: string) =>
    api.put(`/api/articles/${id}/stock/remove?quantity=${quantity}&motif=${motif}`),
  
  getOutOfStockArticles: () =>
    api.get('/api/articles/out-of-stock'),
  
  getArticlesByPriceRange: (min: number, max: number) =>
    api.get(`/api/articles/price-range?min=${min}&max=${max}`),
  
  searchArticles: (keyword: string) =>
    api.get(`/api/articles/search?keyword=${keyword}`),
  
  getArticlesCountOutOfStock: () =>
    api.get('/api/articles/count/out-of-stock'),
  
  getArticleMinPrice: (productId: number) =>
    api.get(`/api/articles/price/min/${productId}`),
  
  getArticleMaxPrice: (productId: number) =>
    api.get(`/api/articles/price/max/${productId}`),
  
  getArticleTotalStock: (productId: number) =>
    api.get(`/api/articles/stock/total/${productId}`),
}

// Document Management APIs
export const documentAPI = {
  getDocuments: () =>
    api.get('/api/documents'),
  
  getDocumentsByPerson: (personId: number) =>
    api.get(`/api/documents/personne/${personId}`),
  
  createDocument: (formData: FormData) =>
    api.post('/api/documents/with-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateDocument: (id: number, data: any) =>
    api.put(`/api/documents/${id}`, data),
  
  validateDocument: (id: number) =>
    api.put(`/api/documents/${id}/validate`),
  
  updateDocumentFile: (id: number, formData: FormData) =>
    api.post(`/api/documents/${id}/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
}

export default api
