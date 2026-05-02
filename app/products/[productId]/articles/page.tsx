'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import { articleService } from '@/services/articleService'
import { productAPI } from '@/lib/api'
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
  ExclamationTriangleIcon
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
  
  const [articleForm, setArticleForm] = useState({
    sku: '',
    prix: 0,
    stockActuel: 0,
    attributs: '',
    image: ''
  })
  
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

  const handleCreateArticle = async () => {
    try {
      await articleService.createArticle({
        ...articleForm,
        produitId: productId
      })
      fetchArticles()
      setShowCreateModal(false)
      setArticleForm({
        sku: '',
        prix: 0,
        stockActuel: 0,
        attributs: '',
        image: ''
      })
    } catch (error) {
      console.error('❌ Product Articles Page - Error creating article:', error)
    }
  }

  const handleUpdateArticle = async () => {
    if (!selectedArticle) return
    
    try {
      await articleService.updateArticle(selectedArticle.id, {
        ...articleForm,
        produitId: productId
      })
      fetchArticles()
      setShowEditModal(false)
      setSelectedArticle(null)
      setArticleForm({
        sku: '',
        prix: 0,
        stockActuel: 0,
        attributs: '',
        image: ''
      })
    } catch (error) {
      console.error('❌ Product Articles Page - Error updating article:', error)
    }
  }

  const handleDeleteArticle = async (articleId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) {
      try {
        await articleService.deleteArticle(articleId)
        fetchArticles()
      } catch (error) {
        console.error('❌ Product Articles Page - Error deleting article:', error)
      }
    }
  }

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

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article)
    setArticleForm({
      sku: article.sku,
      prix: article.prix,
      stockActuel: article.stockActuel,
      attributs: article.attributs,
      image: article.image || ''
    })
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
            onClick={() => setShowCreateModal(true)}
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
                  src={product.image}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attributs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
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
                              src={article.image}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Object.entries(attributes).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <span className="text-gray-500 capitalize">{key}:</span>
                              <span className="font-medium">{value as string}</span>
                            </div>
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
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Créer un nouvel article</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                      <input
                        type="text"
                        value={articleForm.sku}
                        onChange={(e) => setArticleForm({...articleForm, sku: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Ex: CHM-ROUGE-M"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                      <input
                        type="number"
                        value={articleForm.prix}
                        onChange={(e) => setArticleForm({...articleForm, prix: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
                      <input
                        type="number"
                        value={articleForm.stockActuel}
                        onChange={(e) => setArticleForm({...articleForm, stockActuel: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="text"
                        value={articleForm.image}
                        onChange={(e) => setArticleForm({...articleForm, image: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="URL de l'image (optionnel)"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attributs (JSON)</label>
                    <textarea
                      value={articleForm.attributs}
                      onChange={(e) => setArticleForm({...articleForm, attributs: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      rows={3}
                      placeholder='{"couleur": "rouge", "taille": "M", "matiere": "coton"}'
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format JSON pour les attributs (couleur, taille, matière, etc.)
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateArticle}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Article Modal */}
        {showEditModal && selectedArticle && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier l'article #{selectedArticle.id}</h3>
                
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
                        value={articleForm.prix}
                        onChange={(e) => setArticleForm({...articleForm, prix: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock actuel</label>
                      <input
                        type="number"
                        value={articleForm.stockActuel}
                        onChange={(e) => setArticleForm({...articleForm, stockActuel: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="text"
                        value={articleForm.image}
                        onChange={(e) => setArticleForm({...articleForm, image: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="URL de l'image (optionnel)"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attributs (JSON)</label>
                    <textarea
                      value={articleForm.attributs}
                      onChange={(e) => setArticleForm({...articleForm, attributs: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      rows={3}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format JSON pour les attributs (couleur, taille, matière, etc.)
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateArticle}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Management Modal */}
        {showStockModal && selectedArticle && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Gérer le stock - Article #{selectedArticle.id}
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Article</p>
                    <p className="font-medium">{selectedArticle.sku}</p>
                    <p className="text-sm text-gray-500 mt-2">Stock actuel</p>
                    <p className="text-lg font-bold text-emerald-600">{selectedArticle.stockActuel}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type d'opération</label>
                    <select
                      value={stockForm.type}
                      onChange={(e) => setStockForm({...stockForm, type: e.target.value as 'ADD' | 'REMOVE' | 'UPDATE'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="ADD">Ajouter du stock</option>
                      <option value="REMOVE">Retirer du stock</option>
                      <option value="UPDATE">Définir le stock</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantité {stockForm.type === 'UPDATE' ? 'nouvelle' : stockForm.type === 'ADD' ? 'à ajouter' : 'à retirer'}
                    </label>
                    <input
                      type="number"
                      value={stockForm.quantity}
                      onChange={(e) => setStockForm({...stockForm, quantity: parseInt(e.target.value)})}
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
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowStockModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleStockUpdate}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    {stockForm.type === 'UPDATE' ? 'Mettre à jour' : stockForm.type === 'ADD' ? 'Ajouter' : 'Retirer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Details Modal */}
        {showDetails && selectedArticle && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Détails de l'article #{selectedArticle.id}</h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <ExclamationTriangleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">SKU</p>
                      <p className="font-medium">{selectedArticle.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Prix</p>
                      <p className="font-bold text-emerald-600">{formatCurrency(selectedArticle.prix)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stock actuel</p>
                      <p className="font-bold">{selectedArticle.stockActuel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date de création</p>
                      <p className="font-medium">{formatDate(selectedArticle.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Attributs</p>
                    <div className="bg-gray-50 p-3 rounded">
                      {Object.entries(parseAttributes(selectedArticle.attributs)).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="text-gray-600 capitalize">{key}:</span>
                          <span className="font-medium">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedArticle.image && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Image</p>
                      <img
                        src={selectedArticle.image}
                        alt={selectedArticle.sku}
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
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
      </div>
    </AdminLayout>
  )
}
