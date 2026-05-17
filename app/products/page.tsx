'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import { productAPI, boutiqueAPI, categoryAPI, subCategoryAPI } from '@/lib/api'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

interface Product {
  id: number
  nom: string
  description: string
  image?: string
  statut: string
  prix?: number
  createdAt: string
  boutique?: {
    id: number
    nom: string
  }
  sousCategorie?: {
    id: number
    nom: string
    categorie?: {
      nom: string
    }
  }
}

interface Boutique {
  id: number
  nom: string
}

interface Category {
  id: number
  nom: string
}

interface SubCategory {
  id: number
  nom: string
  categorieId: number
  categorieNom?: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [boutiques, setBoutiques] = useState<Boutique[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBoutique, setFilterBoutique] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSubCategory, setFilterSubCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [productForm, setProductForm] = useState({
    nom: '',
    description: '',
    prix: 0,
    statut: 'ACTIF',
    boutiqueId: 0,
    sousCategorieId: 0
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchBoutiques()
    fetchCategories()
    fetchSubCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getProducts()
      console.log('📡 Products Page - API Response - getProducts:', response)
      const productData = response?.data?.data || response?.data
      console.log('📦 Products Page - Products Data:', productData)
      setProducts(Array.isArray(productData) ? productData : [])
    } catch (error) {
      console.error('❌ Products Page - Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchBoutiques = async () => {
    try {
      const response = await boutiqueAPI.getBoutiques()
      console.log('📡 Products Page - API Response - getBoutiques:', response)
      const boutiqueData = response?.data?.data || response?.data
      console.log('🏪 Products Page - Boutiques Data:', boutiqueData)
      setBoutiques(Array.isArray(boutiqueData) ? boutiqueData : [])
    } catch (error) {
      console.error('❌ Products Page - Error fetching boutiques:', error)
      setBoutiques([])
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories()
      console.log('📡 Products Page - API Response - getCategories:', response)
      const categoryData = response?.data?.data || response?.data
      console.log('📂 Products Page - Categories Data:', categoryData)
      setCategories(Array.isArray(categoryData) ? categoryData : [])
    } catch (error) {
      console.error('❌ Products Page - Error fetching categories:', error)
      setCategories([])
    }
  }

  const fetchSubCategories = async () => {
    try {
      const response = await subCategoryAPI.getSubCategoriesWithCategory()
      console.log('📡 Products Page - API Response - getSubCategoriesWithCategory:', response)
      const subCategoryData = response?.data?.data || response?.data
      console.log('📋 Products Page - SubCategories Data:', subCategoryData)
      setSubCategories(Array.isArray(subCategoryData) ? subCategoryData : [])
    } catch (error) {
      console.error('❌ Products Page - Error fetching subcategories:', error)
      setSubCategories([])
    }
  }

  const handleSearch = async () => {
    try {
      const params: any = {}
      if (searchTerm) params.nom = searchTerm
      if (filterBoutique) params.boutiqueId = parseInt(filterBoutique)
      if (filterSubCategory) params.sousCategorieId = parseInt(filterSubCategory)

      const response = await productAPI.searchProducts(params)
      setProducts(response.data || [])
    } catch (error) {
      console.error('Error searching products:', error)
    }
  }

  const handleCreateProduct = async () => {
    try {
      const formData = new FormData()
      formData.append('boutiqueId', productForm.boutiqueId.toString())
      formData.append('sousCategorieId', productForm.sousCategorieId.toString())
      formData.append('nom', productForm.nom)
      formData.append('description', productForm.description)
      formData.append('statut', productForm.statut)
      
      if (imageFile) {
        formData.append('image', imageFile)
      }

      await productAPI.createProduct(formData)
      fetchProducts()
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      await productAPI.deleteProduct(productId)
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const resetForm = () => {
    setProductForm({
      nom: '',
      description: '',
      prix: 0,
      statut: 'ACTIF',
      boutiqueId: 0,
      sousCategorieId: 0
    })
    setImageFile(null)
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setProductForm({
      nom: product.nom,
      description: product.description,
      prix: product.prix || 0,
      statut: product.statut,
      boutiqueId: product.boutique?.id || 0,
      sousCategorieId: product.sousCategorie?.id || 0
    })
    setEditImageFile(null)
    setShowEditModal(true)
  }

  const handleUpdateProduct = async () => {
    try {
      const formData = new FormData()
      formData.append('nom', productForm.nom)
      formData.append('description', productForm.description)
      formData.append('prix', productForm.prix.toString())
      formData.append('statut', productForm.statut)
      formData.append('boutiqueId', productForm.boutiqueId.toString())
      formData.append('sousCategorieId', productForm.sousCategorieId.toString())
      
      if (editImageFile) {
        formData.append('image', editImageFile)
      }

      await productAPI.updateProduct(selectedProduct!.id, formData)
      fetchProducts()
      setShowEditModal(false)
      setSelectedProduct(null)
      resetForm()
      setEditImageFile(null)
    } catch (error) {
      console.error('❌ Products Page - Error updating product:', error)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const filteredProducts = products.filter(product => {
    // Filtre par recherche (nom et description)
    const searchMatch = !searchTerm || 
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Récupérer les IDs depuis les objets imbriqués
    const boutiqueId = product.boutique?.id
    const sousCategorieId = product.sousCategorie?.id
    
    // Filtre par boutique
    const boutiqueMatch = !filterBoutique || 
      (boutiqueId && boutiqueId.toString() === filterBoutique)
    
    // Filtre par sous-catégorie
    const subCategoryMatch = !filterSubCategory || 
      (sousCategorieId && sousCategorieId.toString() === filterSubCategory)
    
    // Filtre par catégorie - utiliser la catégorie de la sous-catégorie
    // Permettre le filtrage par catégorie même si "Toutes les boutiques" est sélectionné
    const categoryMatch = !filterCategory || 
      subCategories.find(sub => sub.id === sousCategorieId)?.categorieId.toString() === filterCategory
    
    console.log('📦 FILTRE PRODUITS - FONCTIONNALITÉ CATÉGORIE SANS BOUTIQUE:')
    console.log('📦 Produit complet:', JSON.stringify(product, null, 2))
    console.log('📦 searchTerm:', `"${searchTerm}"`, 'searchMatch:', searchMatch)
    console.log('📦 filterBoutique:', `"${filterBoutique}"`, 'boutiqueMatch:', 'boutiqueId:', boutiqueId)
    console.log('📦 filterCategory:', `"${filterCategory}"`, 'categoryMatch:', 'sousCategorieId:', sousCategorieId)
    console.log('📦 filterSubCategory:', `"${filterSubCategory}"`, 'subCategoryMatch:', 'sousCategorieId:', sousCategorieId)
    console.log('📦 Types des IDs:', typeof boutiqueId, typeof filterBoutique, typeof sousCategorieId, typeof filterSubCategory)
    console.log('📦 Résultat final:', searchMatch && boutiqueMatch && subCategoryMatch && categoryMatch)
    console.log('📦 ---')
    
    return searchMatch && boutiqueMatch && subCategoryMatch && categoryMatch
  })

  const itemsPerPage = 12
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Gestion des Produits</h1>
            <p className="text-xs text-gray-600">Gérez tous les produits des boutiques</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Ajouter un produit
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-2 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
              />
              <MagnifyingGlassIcon className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
            </div>
            <select
              value={filterBoutique}
              onChange={(e) => setFilterBoutique(e.target.value)}
              className="px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Boutiques</option>
              {boutiques.map((boutique) => (
                <option key={boutique.id} value={boutique.id}>
                  {boutique.nom}
                </option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value)
                setFilterSubCategory('')
              }}
              className="px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nom}
                </option>
              ))}
            </select>
            <select
              value={filterSubCategory}
              onChange={(e) => setFilterSubCategory(e.target.value)}
              className="px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
              disabled={!filterCategory}
            >
              <option value="">Sous-catégories</option>
              {subCategories
                .filter(sub => sub.categorieId === parseInt(filterCategory))
                .map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.nom}
                  </option>
                ))}
            </select>
          </div>
          <div className="mt-2">
            <button
              onClick={handleSearch}
              className="px-2 py-1 text-xs bg-secondary-600 text-white rounded hover:bg-secondary-700 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded shadow overflow-hidden hover:shadow transition-shadow">
              <div className="h-32 bg-gray-200 relative">
                {product.image ? (
                  <img
                    src={`http://192.168.43.97:8080${product.image}`}
                    alt={product.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-1 right-1">
                  <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(product.statut)}`}>
                    {product.statut}
                  </span>
                </div>
              </div>
              
              <div className="p-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{product.nom}</h3>
                <p className="text-xs text-gray-600 mb-1 line-clamp-2">{product.description}</p>
                
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Boutique:</span>
                    <span className="text-xs font-medium text-gray-900 truncate">
                      {product.boutique?.nom || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Catégorie:</span>
                    <span className="text-xs font-medium text-gray-900 truncate">
                      {product.sousCategorie?.nom || 'N/A'}
                    </span>
                  </div>
                  {product.prix && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Prix:</span>
                      <span className="text-xs font-bold text-emerald-600">
                        {formatCurrency(product.prix)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-1">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setSelectedProduct(product)
                        setShowDetails(true)
                      }}
                      className="flex-1 flex items-center justify-center px-1 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
                    >
                      <EyeIcon className="h-3 w-3 mr-0.5" />
                      Voir
                    </button>
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 flex items-center justify-center px-1 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <PencilIcon className="h-3 w-3 mr-0.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center px-1 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <TrashIcon className="h-3 w-3 mr-0.5" />
                      Supprimer
                    </button>
                  </div>
                  <button
                    onClick={() => router.push(`/products/${product.id}/articles`)}
                    className="w-full flex items-center justify-center px-1 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <CubeIcon className="h-3 w-3 mr-0.5" />
                    Articles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> sur{' '}
                  <span className="font-medium">{filteredProducts.length}</span> produits
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        {showDetails && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Détails du produit</h3>
                <div className="space-y-3">
                  <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    {selectedProduct.image ? (
                      <img
                        src={`http://192.168.43.97:8080${selectedProduct.image}`}
                        alt={selectedProduct.nom}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Nom:</span> {selectedProduct.nom}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span> {selectedProduct.description}
                  </div>
                  <div>
                    <span className="font-medium">Boutique:</span> {selectedProduct.boutique?.nom || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Catégorie:</span> {selectedProduct.sousCategorie?.nom || 'N/A'}
                  </div>
                  {selectedProduct.prix && (
                    <div>
                      <span className="font-medium">Prix:</span> {formatCurrency(selectedProduct.prix)}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Statut:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProduct.statut)}`}>
                      {selectedProduct.statut}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Création:</span> {formatDate(selectedProduct.createdAt)}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier le produit</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={productForm.nom}
                      onChange={(e) => setProductForm({...productForm, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.prix}
                      onChange={(e) => setProductForm({...productForm, prix: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Boutique</label>
                    <select
                      value={productForm.boutiqueId}
                      onChange={(e) => setProductForm({...productForm, boutiqueId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Sélectionner une boutique</option>
                      {boutiques.map((boutique) => (
                        <option key={boutique.id} value={boutique.id}>
                          {boutique.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sous-catégorie</label>
                    <select
                      value={productForm.sousCategorieId}
                      onChange={(e) => setProductForm({...productForm, sousCategorieId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Sélectionner une sous-catégorie</option>
                      {subCategories.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={productForm.statut}
                      onChange={(e) => setProductForm({...productForm, statut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="ACTIF">Actif</option>
                      <option value="INACTIF">Inactif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image actuelle</label>
                    {selectedProduct.image ? (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.nom}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nouvelle image (optionnel)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedProduct(null)
                      resetForm()
                      setEditImageFile(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateProduct}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Product Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nouveau produit</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={productForm.nom}
                      onChange={(e) => setProductForm({...productForm, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.prix}
                      onChange={(e) => setProductForm({...productForm, prix: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Boutique</label>
                    <select
                      value={productForm.boutiqueId}
                      onChange={(e) => setProductForm({...productForm, boutiqueId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Sélectionner une boutique</option>
                      {boutiques.map((boutique) => (
                        <option key={boutique.id} value={boutique.id}>
                          {boutique.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sous-catégorie</label>
                    <select
                      value={productForm.sousCategorieId}
                      onChange={(e) => setProductForm({...productForm, sousCategorieId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Sélectionner une sous-catégorie</option>
                      {subCategories.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.nom} {subCategory.categorieNom && `(${subCategory.categorieNom})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={productForm.statut}
                      onChange={(e) => setProductForm({...productForm, statut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="ACTIF">Actif</option>
                      <option value="INACTIF">Inactif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateProduct}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
