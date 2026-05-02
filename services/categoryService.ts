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

export const categoryService = {
  // Category APIs
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

export const subCategoryService = {
  // SubCategory APIs
  getSubCategories: () =>
    api.get('/api/sous-categories'),
  
  getSubCategoriesWithCategory: () =>
    api.get('/api/sous-categories/with-categorie'),
  
  getSubCategoriesByCategory: (categoryId: number) =>
    api.get(`/api/sous-categories/categorie/${categoryId}`),
  
  getSubCategoriesByCategoryWithInfo: (categoryId: number) =>
    api.get(`/api/sous-categories/categorie/${categoryId}/with-categorie-info`),
  
  createSubCategory: (data: any) =>
    api.post('/api/sous-categories', data),
  
  updateSubCategory: (id: number, data: any) =>
    api.put(`/api/sous-categories/${id}`, data),
  
  deleteSubCategory: (id: number) =>
    api.delete(`/api/sous-categories/${id}`),
  
  searchSubCategories: (keyword: string) =>
    api.get(`/api/sous-categories/search/with-categorie?keyword=${keyword}`),
  
  searchSubCategoriesByName: (nom: string) =>
    api.get(`/api/sous-categories/search/nom/with-categorie?nom=${nom}`),
  
  searchSubCategoriesByCategoryAndName: (categoryId: number, nom: string) =>
    api.get(`/api/sous-categories/categorie/${categoryId}/search/nom?nom=${nom}`),
}

export default api
