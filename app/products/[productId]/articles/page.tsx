'use client'

import React, { useState, useEffect, use, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import { articleService } from '@/services/articleService'
import { productAPI, articleAPI } from '@/lib/api'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  CubeIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Article {
  id: number
  produitId: number
  sku: string
  prix: number
  stockActuel: number
  attributs: string
  image?: string
  createdAt: string
  updatedAt: string
}

interface Product {
  id: number
  nom: string
  description: string
  image?: string
  statut: string
  createdAt: string
  boutique?: {
    id: number
    nom: string
  }
  sousCategorie?: {
    id: number
    nom: string
  }
}

interface StockHistory {
  id: number
  articleId: number
  quantite: number
  type: string
  motif: string
  createdAt: string
}

type ArticleAttribute = { key: string; value: string }

type ArticleFormState = {
  sku: string
  prix: number
  stockActuel: number
  attributs: ArticleAttribute[]
  image?: string | null
}

// Composant Modal réutilisable
const Modal = ({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductArticlesPage({ params }: { params: Promise<{ productId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const productId = parseInt(resolvedParams.productId)
  
  const [articles, setArticles] = useState<Article[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  const [articleForm, setArticleForm] = useState<ArticleFormState>({
    sku: '',
    prix: 0,
    stockActuel: 0,
    attributs: [
      { key: '', value: '' }
    ],
    image: null
  })
  const [createImageFile, setCreateImageFile] = useState<File | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  
  const [stockForm, setStockForm] = useState({
    quantity: 0,
    motif: '',
    type: 'ADD' as 'ADD' | 'REMOVE' | 'UPDATE'
  })

  useEffect(() => {
    fetchProduct()
    fetchArticles()
  }, [productId])

  const fetchProduct = async () => {
    try {
      console.log(`📦 Product Articles Page - Fetching product ${productId}...`)
      const response = await productAPI.getProducts()
      const productData = response?.data?.data || response?.data || []
      const foundProduct = productData.find((p: Product) => p.id === productId)
      setProduct(foundProduct || null)
      console.log('✅ Product Articles Page - Product fetched:', foundProduct?.nom)
    } catch (error) {
      console.error('❌ Product Articles Page - Error fetching product:', error)
    }
  }

  const fetchArticles = async () => {
    try {
      console.log(`📦 Product Articles Page - Fetching articles for product ${productId}...`)
      const response = await articleService.getArticlesByProduct(productId)
      const articleData = response?.data?.data || response?.data || []
      setArticles(Array.isArray(articleData) ? articleData : [])
      console.log('✅ Product Articles Page - Articles fetched:', articleData.length)
    } catch (error) {
      console.error('❌ Product Articles Page - Error fetching articles:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const generateSKU = (productId: number) => {
    const random = Math.floor(Math.random() * 10000)
    return `ART-${productId}-${random}`
  }

  const getAttributesConfig = (category?: string, subCategory?: string) => {
    const subCat = subCategory?.toLowerCase() || ''
    
    if (subCat.includes("chemise") || subCat.includes("t-shirt") || 
        subCat.includes("pantalon") || subCat.includes("jean") ||
        subCat.includes("robe") || subCat.includes("jupe") ||
        subCat.includes("veste") || subCat.includes("manteau")) {
      
      return [
        { key: 'taille', label: 'Taille', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'], required: true },
        { key: 'couleur', label: 'Couleur', type: 'select', options: ['Blanc', 'Noir', 'Bleu', 'Rouge', 'Gris', 'Vert', 'Jaune', 'Rose', 'Bleu marine', 'Beige'], required: true },
        { key: 'materiau', label: 'Matériau', type: 'select', options: ['Coton', 'Polyester', 'Laine', 'Lin', 'Jean', 'Soie', 'Synthétique'], required: true },
        { key: 'marque', label: 'Marque', type: 'select', options: ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Uniqlo', 'Gap'], required: true }
      ]
    }

    return [
      { key: 'couleur', label: 'Couleur', type: 'text', placeholder: 'Couleur principale', required: true },
      { key: 'marque', label: 'Marque', type: 'text', placeholder: 'Marque du produit', required: true },
      { key: 'modele', label: 'Modèle/Référence', type: 'text', placeholder: 'Modèle ou référence', required: false }
    ]
  }

  const initializeArticleForm = useCallback((productId: number, category?: string, subCategory?: string) => {
    const suggestedSKU = generateSKU(productId)
    const attributesConfig = getAttributesConfig(category, subCategory)
    
    const initialAttributes = attributesConfig.map(attr => ({
      key: attr.key,
      value: ''
    }))

    setArticleForm({
      sku: suggestedSKU,
      prix: 0,
      stockActuel: 0,
      attributs: initialAttributes,
      image: null
    })
  }, [])

  const validateArticleData = (data: any) => {
    const required = ['produit_id', 'prix', 'sku', 'stock_actuel']
    for (const field of required) {
      if (!data[field] || data[field] === null || data[field] === undefined) {
        throw new Error(`Le champ ${field} est obligatoire`)
      }
    }

    if (typeof data.produit_id !== 'number' || data.produit_id <= 0) {
      throw new Error('produit_id doit être un nombre positif')
    }

    if (typeof data.prix !== 'number' || data.prix <= 0) {
      throw new Error('Le prix doit être un nombre positif')
    }

    if (typeof data.sku !== 'string' || data.sku.trim().length === 0) {
      throw new Error('Le SKU ne peut pas être vide')
    }

    if (typeof data.stock_actuel !== 'number' || data.stock_actuel < 0) {
      throw new Error('Le stock doit être un nombre positif ou nul')
    }

    if (!data.attributs || typeof data.attributs !== 'object') {
      throw new Error('Les attributs doivent être un objet JSON valide')
    }

    if (Object.keys(data.attributs).length === 0) {
      throw new Error('Au moins un attribut est requis')
    }

    return true
  }

  const handleCreateArticle = async () => {
    try {
      console.log('📦 Creating article for product:', productId)
      console.log('📦 Article form data:', articleForm)
      
      const attributsObj = articleForm.attributs.reduce((acc, attr) => {
        if (attr.key && attr.value) {
          acc[attr.key] = attr.value
        }
        return acc
      }, {} as Record<string, string>)
      
      const articleData = {
        produit_id: productId,
        sku: articleForm.sku,
        prix: Number(articleForm.prix) || 0,
        stock_actuel: Number(articleForm.stockActuel) || 0,
        attributs: attributsObj
      }
      
      validateArticleData(articleData)
      
      console.log('📦 Sending article data:', articleData)
      
      if (createImageFile) {
        const formData = new FormData()
        formData.append('produit_id', String(articleData.produit_id))
        formData.append('sku', articleData.sku)
        formData.append('prix', String(articleData.prix))
        formData.append('stock_actuel', String(articleData.stock_actuel))
        formData.append('attributs', JSON.stringify(articleData.attributs))
        formData.append('image', createImageFile)

        await articleService.createArticleWithImage(productId, formData)
      } else {
        await articleAPI.createArticle(articleData)
      }

      fetchArticles()
      setShowCreateModal(false)
      setCreateImageFile(null)
      setArticleForm({
        sku: '',
        prix: 0,
        stockActuel: 0,
        attributs: [
          { key: '', value: '' }
        ]
      })
      
      console.log('✅ Article created successfully')
    } catch (error) {
      console.error('❌ Product Articles Page - Error creating article:', error)
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  const handleUpdateArticle = async () => {
    if (!selectedArticle) return
    
    try {
      console.log('📦 Updating article:', selectedArticle.id)
      
      const attributsObj = articleForm.attributs.reduce((acc, attr) => {
        if (attr.key && attr.value) {
          acc[attr.key] = attr.value
        }
        return acc
      }, {} as Record<string, string>)
      
      const articleData = {
        produit_id: productId,
        sku: articleForm.sku,
        prix: Number(articleForm.prix) || 0,
        stock_actuel: Number(articleForm.stockActuel) || 0,
        attributs: attributsObj
      }
      
      console.log('📦 Sending update data:', articleData)
      
      await articleAPI.updateArticle(selectedArticle.id, articleData)

      if (editImageFile) {
        const formData = new FormData()
        formData.append('image', editImageFile)
        await articleService.updateArticleImage(selectedArticle.id, formData)
      }

      fetchArticles()
      setShowEditModal(false)
      setSelectedArticle(null)
      setEditImageFile(null)
      setArticleForm({
        sku: '',
        prix: 0,
        stockActuel: 0,
        attributs: [
          { key: '', value: '' }
        ]
      })
      
      console.log('✅ Article updated successfully')
    } catch (error) {
      console.error('❌ Product Articles Page - Error updating article:', error)
    }
  }

  const handleDeleteArticle = async (articleId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) {
      try {
        console.log('📦 Deleting article:', articleId)
        await articleAPI.deleteArticle(articleId)
        fetchArticles()
        console.log('✅ Article deleted successfully')
      } catch (error) {
        console.error('❌ Product Articles Page - Error deleting article:', error)
      }
    }
  }

  const addAttribute = useCallback(() => {
    setArticleForm(prev => ({
      ...prev,
      attributs: [...prev.attributs, { key: '', value: '' }]
    }))
  }, [])

  const removeAttribute = useCallback((index: number) => {
    setArticleForm(prev => ({
      ...prev,
      attributs: prev.attributs.filter((_, i) => i !== index)
    }))
  }, [])

  const updateAttribute = useCallback((index: number, field: 'key' | 'value', value: string) => {
    setArticleForm(prev => ({
      ...prev,
      attributs: prev.attributs.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }))
  }, [])

  const handleStockUpdate = async () => {
    if (!selectedArticle) return
    
    try {
      if (stockForm.type === 'UPDATE') {
        await articleService.updateStock(selectedArticle.id, stockForm.quantity)
      } else if (stockForm.type === 'ADD') {
        await articleService.addStock(selectedArticle.id, stockForm.quantity, stockForm.motif)
      } else if (stockForm.type === 'REMOVE') {
        await articleService.removeStock(selectedArticle.id, stockForm.quantity, stockForm.motif)
      }
      
      fetchArticles()
      setShowStockModal(false)
      setSelectedArticle(null)
      setStockForm({ quantity: 0, motif: '', type: 'ADD' })
    } catch (error) {
      console.error('❌ Product Articles Page - Error updating stock:', error)
    }
  }

  const handleViewDetails = (article: Article) => {
    setSelectedArticle(article)
    setShowDetails(true)
  }

  const handleOpenCreateModal = useCallback(() => {
    initializeArticleForm(productId, product?.sousCategorie?.nom, product?.sousCategorie?.nom)
    setCreateImageFile(null)
    setShowCreateModal(true)
  }, [productId, product, initializeArticleForm])

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article)
    
    let attributsArray = [{ key: '', value: '' }]
    if (typeof article.attributs === 'string') {
      try {
        const parsed = JSON.parse(article.attributs)
        attributsArray = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }))
        if (attributsArray.length === 0) {
          attributsArray = [{ key: '', value: '' }]
        }
      } catch {
        attributsArray = [{ key: 'value', value: article.attributs }]
      }
    }
    
    setArticleForm({
      sku: article.sku,
      prix: article.prix,
      stockActuel: article.stockActuel,
      attributs: attributsArray
    })
    setEditImageFile(null)
    setShowEditModal(true)
  }

  const handleManageStock = (article: Article) => {
    setSelectedArticle(article)
    setShowStockModal(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const parseAttributes = (attributs: string) => {
    try {
      return JSON.parse(attributs)
    } catch {
      return {}
    }
  }

  const filteredArticles = articles.filter(article =>
    article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parseAttributes(article.attributs).couleur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parseAttributes(article.attributs).taille?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage)
  const paginatedArticles = filteredArticles.slice(
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Retour
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Articles du produit
              </h1>
              <p className="text-gray-600">
                {product?.nom || 'Chargement...'} - {articles.length} article(s)
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvel Article
          </button>
        </div>

        {/* Product Info */}
        {product && (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              {product.image && (
                <img
                  src={`http://10.153.46.247:8080${product.image}`}
                  alt={product.nom}
                  className="h-16 w-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{product.nom}</h3>
                <p className="text-sm text-gray-500">{product.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">
                    Boutique: {product.boutique?.nom}
                  </span>
                  <span className="text-sm text-gray-500">
                    Catégorie: {product.sousCategorie?.nom}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Tous les stocks</option>
              <option value="out-of-stock">En rupture de stock</option>
              <option value="low-stock">Stock faible (&lt; 10)</option>
              <option value="good-stock">Bon stock (&gt;= 10)</option>
            </select>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total articles</p>
              <p className="text-2xl font-bold text-emerald-600">{articles.length}</p>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attributs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedArticles.map((article) => {
                  const attributes = parseAttributes(article.attributs)
                  const stockStatus = article.stockActuel === 0 ? 'out' : article.stockActuel < 10 ? 'low' : 'good'
                  const stockColor = stockStatus === 'out' ? 'text-red-600' : stockStatus === 'low' ? 'text-yellow-600' : 'text-green-600'
                  
                  return (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {article.image ? (
                            <img
                              src={`http://10.153.46.247:8080/uploads/${article.image}`}
                              alt={article.sku}
                              className="h-10 w-10 object-cover rounded-lg mr-3"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                              <PhotoIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Article #{article.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(article.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">{article.sku}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(attributes).map(([key, value]) => (
                            <span key={key} className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-700">
                              {key}: {value as string}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-emerald-600">
                          {formatCurrency(article.prix)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${stockColor}`}>
                          {article.stockActuel}
                        </div>
                        {article.stockActuel === 0 && (
                          <span className="text-xs text-red-600">Rupture</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(article)}
                            className="text-emerald-600 hover:text-emerald-900"
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditArticle(article)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier l'article"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleManageStock(article)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Gérer le stock"
                          >
                            <CubeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredArticles.length)}
                  </span>{' '}
                  sur <span className="font-medium">{filteredArticles.length}</span> articles
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Create Article Modal */}
        <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} title="Créer un nouvel article">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">SKU</label>
                <input
                  type="text"
                  value={articleForm.sku}
                  onChange={(e) => setArticleForm({...articleForm, sku: e.target.value})}
                  placeholder="Ex: CHM-ROUGE-M"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Prix (FCFA)</label>
                <input
                  type="number"
                  value={articleForm.prix || 0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    setArticleForm({...articleForm, prix: isNaN(value) ? 0 : value})
                  }}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock initial</label>
                <input
                  type="number"
                  value={articleForm.stockActuel || 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    setArticleForm({...articleForm, stockActuel: isNaN(value) ? 0 : value})
                  }}
                  min="0"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCreateImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {createImageFile && (
                  <p className="mt-2 text-sm text-gray-600">Fichier sélectionné : {createImageFile.name}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attributs</label>
              <div className="space-y-2">
                {articleForm.attributs.map((attr, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={attr.key}
                      onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Nom (ex: couleur, taille)"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Valeur (ex: rouge, M)"
                    />
                    <button
                      onClick={() => removeAttribute(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addAttribute}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-emerald-600 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Ajouter un attribut
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateArticle}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Article Modal */}
        <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title={`Modifier l'article #${selectedArticle?.id || ''}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={articleForm.sku}
                  onChange={(e) => setArticleForm({...articleForm, sku: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                <input
                  type="number"
                  value={articleForm.prix || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    setArticleForm({...articleForm, prix: isNaN(value) ? 0 : value})
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock actuel</label>
              <input
                type="number"
                value={articleForm.stockActuel || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  setArticleForm({...articleForm, stockActuel: isNaN(value) ? 0 : value})
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              {editImageFile ? (
                <p className="mt-2 text-sm text-gray-600">Fichier sélectionné : {editImageFile.name}</p>
              ) : selectedArticle?.image ? (
                <img
                  src={`http://10.153.46.247:8080${selectedArticle.image}`}
                  alt="Image actuelle"
                  className="mt-3 h-24 w-auto rounded-lg border border-gray-200"
                />
              ) : null}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attributs</label>
              <div className="space-y-2">
                {articleForm.attributs.map((attr, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={attr.key}
                      onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Nom (ex: couleur, taille)"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Valeur (ex: rouge, M)"
                    />
                    <button
                      onClick={() => removeAttribute(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addAttribute}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-emerald-600 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Ajouter un attribut
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateArticle}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>
        </Modal>

        {/* Stock Management Modal */}
        <Modal show={showStockModal} onClose={() => setShowStockModal(false)} title={`Gérer le stock - Article #${selectedArticle?.id || ''}`}>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500">Article</p>
              <p className="font-medium text-gray-900">{selectedArticle?.sku}</p>
              <p className="text-sm text-gray-500 mt-2">Stock actuel</p>
              <p className="text-2xl font-bold text-emerald-600">{selectedArticle?.stockActuel}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'opération</label>
              <select
                value={stockForm.type}
                onChange={(e) => setStockForm({...stockForm, type: e.target.value as 'ADD' | 'REMOVE' | 'UPDATE'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="ADD">➕ Ajouter du stock</option>
                <option value="REMOVE">➖ Retirer du stock</option>
                <option value="UPDATE">✏️ Définir le stock</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité {stockForm.type === 'UPDATE' ? 'nouvelle' : stockForm.type === 'ADD' ? 'à ajouter' : 'à retirer'}
              </label>
              <input
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({...stockForm, quantity: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                min="0"
                required
              />
            </div>
            
            {stockForm.type !== 'UPDATE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <input
                  type="text"
                  value={stockForm.motif}
                  onChange={(e) => setStockForm({...stockForm, motif: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={stockForm.type === 'ADD' ? 'Ex: Réapprovisionnement' : 'Ex: Vente client'}
                  required
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowStockModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleStockUpdate}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                {stockForm.type === 'UPDATE' ? 'Mettre à jour' : stockForm.type === 'ADD' ? 'Ajouter' : 'Retirer'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Article Details Modal */}
        <Modal show={showDetails} onClose={() => setShowDetails(false)} title={`Détails de l'article #${selectedArticle?.id || ''}`}>
          <div className="space-y-6">
            {selectedArticle?.image && (
              <div className="flex justify-center mb-6">
                <img
                  src={`http://10.153.46.247:8080${selectedArticle.image}`}
                  alt={selectedArticle.sku}
                  className="h-48 w-48 object-cover rounded-2xl shadow-lg border-4 border-gray-200"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                <p className="text-xs text-emerald-600 font-semibold mb-1">SKU</p>
                <p className="font-bold text-emerald-900 text-lg">{selectedArticle?.sku}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold mb-1">Prix</p>
                <p className="font-bold text-blue-900 text-lg">{formatCurrency(selectedArticle?.prix || 0)}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-600 font-semibold mb-1">Stock actuel</p>
                <p className="font-bold text-amber-900 text-lg">{selectedArticle?.stockActuel}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <p className="text-xs text-purple-600 font-semibold mb-1">Date de création</p>
                <p className="font-medium text-purple-900">{formatDate(selectedArticle?.createdAt || '')}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Attributs</p>
              <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-6 rounded-2xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(parseAttributes(selectedArticle?.attributs || '{}')).map(([key, value]) => (
                    <div key={key} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 capitalize">{key}:</span>
                        <span className="text-sm font-bold text-gray-900">{value as string}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  )
}