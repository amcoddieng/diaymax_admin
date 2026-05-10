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

export const documentService = {
  getDocuments: () =>
    api.get('/api/documents'),
  
  getDocumentsByPerson: (personId: number) =>
    api.get(`/api/documents/personne/${personId}`),
  
  getDocumentsByType: (type: string) =>
    api.get(`/api/documents/type/${type}`),
  
  getDocumentsByValidation: (validated: boolean) =>
    api.get(`/api/documents/validated/${validated}`),
  
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
