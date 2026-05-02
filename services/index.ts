// Central export for all services
export { authService } from './authService'
export { userService } from './userService'
export { boutiqueService } from './boutiqueService'
export { categoryService, subCategoryService } from './categoryService'
export { productService } from './productService'
export { documentService } from './documentService'

// Re-export default API instance for direct usage if needed
export { default as api } from './authService'
