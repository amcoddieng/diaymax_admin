'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import { boutiqueService } from '@/services'
import { productAPI } from '@/lib/api'
import { articleService } from '@/services/articleService'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ArrowLeftIcon,
  PhotoIcon,
  CubeIcon,
  ShoppingBagIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

interface Boutique {
  id: number
  nom: string
  description: string
  addresse: string
  logo?: string
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'SUSPENDU'
  note: number
  createdAt: string
  vendeur?: {
    id: number
    email: string
    nom?: string
    prenom?: string
    telephone?: string
  }
}

interface Product {
  id: number
  nom: string
  description: string
  image?: string
  statut: string
  prix?: number
  createdAt: string
  sousCategorie?: {
    id: number
    nom: string
    categorie?: {
      nom: string
    }
  }
}

interface Article {
  id: number
  produitId: number
  sku: string
  prix: number
  stockActuel: number
  attributs: string
  image?: string
  createdAt: string
}

interface BoutiqueStats {
  totalProducts: number
  totalArticles: number
  totalStock: number
  averagePrice: number
  outOfStockCount: number
  totalValue: number
}

export default function BoutiqueDetailPage({ params }: { params: Promise<{ boutiqueId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const boutiqueId = parseInt(resolvedParams.boutiqueId)
  
  const [boutique, setBoutique] = useState<Boutique | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [stats, setStats] = useState<BoutiqueStats>({
    totalProducts: 0,
    totalArticles: 0,
    totalStock: 0,
    averagePrice: 0,
    outOfStockCount: 0,
    totalValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'articles'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  
  const [editForm, setEditForm] = useState({
    nom: '',
    description: '',
    addresse: '',
    statut: '',
    note: 0
  })

  useEffect(() => {
    fetchBoutique()
    fetchProducts()
  }, [boutiqueId])

  useEffect(() => {
    if (products.length > 0 && !articlesLoading) {
      fetchArticles()
    }
  }, [products, articlesLoading])

  useEffect(() => {
    calculateStats()
  }, [products, articles])

  const fetchBoutique = async () => {
    try {
      console.log(`🏪 Boutique Detail Page - Fetching boutique ${boutiqueId}...`)
      const response = await boutiqueService.getBoutiques()
      const boutiqueData = response?.data?.data || response?.data || []
      const foundBoutique = boutiqueData.find((b: Boutique) => b.id === boutiqueId)
      setBoutique(foundBoutique || null)
      
      if (foundBoutique) {
        setEditForm({
          nom: foundBoutique.nom,
          description: foundBoutique.description,
          addresse: foundBoutique.addresse,
          statut: foundBoutique.statut,
          note: foundBoutique.note
        })
      }
      
      console.log('✅ Boutique Detail Page - Boutique fetched:', foundBoutique?.nom)
    } catch (error) {
      console.error('❌ Boutique Detail Page - Error fetching boutique:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      console.log(`📦 Boutique Detail Page - Fetching products for boutique ${boutiqueId}...`)
      const response = await productAPI.getProducts()
      const productData = response?.data?.data || response?.data || []
      console.log('📊 Boutique Detail Page - Total products available:', productData.length)
      console.log('📊 Boutique Detail Page - Sample product structure:', productData[0])
      
      const boutiqueProducts = productData.filter((p: any) => {
        console.log(`🔍 Checking product ${p.id}:`, {
          name: p.nom,
          boutiqueId: p.boutiqueId,
          matches: p.boutiqueId === boutiqueId
        })
        return p.boutiqueId === boutiqueId
      })
      
      console.log('✅ Boutique Detail Page - Products for boutique:', boutiqueProducts.length)
      console.log('📊 Boutique Detail Page - Boutique products:', boutiqueProducts.map((p: any) => ({ id: p.id, name: p.nom })))
      setProducts(Array.isArray(boutiqueProducts) ? boutiqueProducts : [])
    } catch (error) {
      console.error('❌ Boutique Detail Page - Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = async () => {
    if (articlesLoading) return
    
    setArticlesLoading(true)
    try {
      console.log(`📦 Boutique Detail Page - Fetching articles for boutique ${boutiqueId}...`)
      console.log('📊 Boutique Detail Page - Products to fetch articles for:', products.length)
      
      const allArticles: Article[] = []
      
      // Fetch articles for each product of this boutique
      for (const product of products) {
        try {
          console.log(`🔍 Fetching articles for product ${product.id} (${product.nom})...`)
          const response = await articleService.getArticlesByProduct(product.id)
          const productArticles = response?.data?.data || response?.data || []
          console.log(`📊 Product ${product.id} articles:`, productArticles.length)
          
          if (Array.isArray(productArticles) && productArticles.length > 0) {
            allArticles.push(...productArticles)
            console.log(`✅ Added ${productArticles.length} articles for product ${product.id}`)
          }
        } catch (error) {
          console.error(`❌ Error fetching articles for product ${product.id}:`, error)
        }
      }
      
      setArticles(allArticles)
      console.log('✅ Boutique Detail Page - Total articles fetched:', allArticles.length)
      console.log('📊 Boutique Detail Page - Article sample:', allArticles[0])
    } catch (error) {
      console.error('❌ Boutique Detail Page - Error fetching articles:', error)
      setArticles([])
    } finally {
      setArticlesLoading(false)
    }
  }

  const calculateStats = () => {
    const totalProducts = products.length
    const totalArticles = articles.length
    const totalStock = articles.reduce((sum, article) => sum + article.stockActuel, 0)
    const averagePrice = articles.length > 0 
      ? articles.reduce((sum, article) => sum + article.prix, 0) / articles.length 
      : 0
    const outOfStockCount = articles.filter(article => article.stockActuel === 0).length
    const totalValue = articles.reduce((sum, article) => sum + (article.prix * article.stockActuel), 0)

    setStats({
      totalProducts,
      totalArticles,
      totalStock,
      averagePrice,
      outOfStockCount,
      totalValue
    })
  }

  const handleUpdateBoutique = async () => {
    try {
      await boutiqueService.updateBoutique(boutiqueId, editForm)
      fetchBoutique()
      setShowEditModal(false)
    } catch (error) {
      console.error('❌ Boutique Detail Page - Error updating boutique:', error)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await productAPI.deleteProduct(productId)
        fetchProducts()
        fetchArticles()
      } catch (error) {
        console.error('❌ Boutique Detail Page - Error deleting product:', error)
      }
    }
  }

  const handleDeleteArticle = async (articleId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await articleService.deleteArticle(articleId)
        fetchArticles()
      } catch (error) {
        console.error('❌ Boutique Detail Page - Error deleting article:', error)
      }
    }
  }

  const parseAttributes = (attributs: string) => {
    try {
      return JSON.parse(attributs)
    } catch {
      return {}
    }
  }

  const filteredProducts = products.filter(product =>
    product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredArticles = articles.filter(article =>
    article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parseAttributes(article.attributs).couleur?.toLowerCase().includes(searchTerm.toLowerCase())
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
                {boutique?.nom || 'Boutique'}
              </h1>
              <p className="text-gray-600">
                Gestion complète de la boutique
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Modifier
            </button>
          </div>
        </div>

        {/* Boutique Info Card */}
        {boutique && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                {boutique.logo ? (
                  <img
                    src={boutique.logo}
                    alt={boutique.nom}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <BuildingStorefrontIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{boutique.nom}</h2>
                    <p className="text-gray-600 mt-1">{boutique.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(boutique.statut)}`}>
                    {boutique.statut}
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    {boutique.addresse}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <StarIcon className="h-5 w-5 mr-2 text-yellow-400" />
                    {boutique.note.toFixed(1)} / 5.0
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Créée le {formatDate(boutique.createdAt)}
                  </div>
                  {boutique.vendeur && (
                    <div className="flex items-center text-gray-600">
                      <UserIcon className="h-5 w-5 mr-2" />
                      {boutique.vendeur.prenom} {boutique.vendeur.nom}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <ShoppingBagIcon className="h-8 w-8 text-emerald-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Produits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CubeIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Articles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalArticles}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Stock Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Prix Moyen</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averagePrice)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Rupture Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outOfStockCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-emerald-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Valeur Stock</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Produits ({stats.totalProducts})
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-2 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'articles'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Articles ({stats.totalArticles})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Products */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Produits récents</h3>
                    <div className="space-y-3">
                      {products.length > 0 ? (
                        products.slice(0, 5).map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              {product.image ? (
                                <img src={product.image} alt={product.nom} className="h-10 w-10 object-cover rounded mr-3" />
                              ) : (
                                <div className="h-10 w-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                                  <PhotoIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{product.nom}</p>
                                <p className="text-sm text-gray-500">{product.sousCategorie?.categorie?.nom}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedProduct(product)
                                setShowDetails(true)
                              }}
                              className="text-emerald-600 hover:text-emerald-900"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <ShoppingBagIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>Aucun produit trouvé pour cette boutique</p>
                          <p className="text-sm mt-1">Les produits apparaîtront ici une fois créés</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Low Stock Articles */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Articles en stock faible</h3>
                    <div className="space-y-3">
                      {articles.length > 0 ? (
                        articles
                          .filter(article => article.stockActuel < 10 && article.stockActuel > 0)
                          .slice(0, 5)
                          .map((article) => {
                            const attributes = parseAttributes(article.attributs)
                            return (
                              <div key={article.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">{article.sku}</p>
                                  <p className="text-sm text-gray-500">
                                    {attributes.couleur && `${attributes.couleur} - `}
                                    {attributes.taille && `${attributes.taille}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-yellow-600">{article.stockActuel}</p>
                                  <p className="text-xs text-gray-500">en stock</p>
                                </div>
                              </div>
                            )
                          })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CubeIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>Aucun article trouvé</p>
                          <p className="text-sm mt-1">Les articles apparaîtront ici une fois créés</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => window.location.href = '/products'}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nouveau Produit
                  </button>
                </div>

                {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.nom} className="h-full w-full object-cover rounded-t-lg" />
                        ) : (
                          <PhotoIcon className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 truncate">{product.nom}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <CubeIcon className="h-4 w-4 mr-1" />
                            {articles.filter(a => a.produitId === product.id).length} articles
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(product)
                                setShowDetails(true)
                              }}
                              className="text-emerald-600 hover:text-emerald-900"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => window.location.href = `/products/${product.id}/articles`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <CubeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingBagIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 'Aucun produit ne correspond à votre recherche' : 'Cette boutique n\'a pas encore de produits'}
                    </p>
                    <button
                      onClick={() => window.location.href = '/products'}
                      className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Créer le premier produit
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un article..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {filteredArticles.length > 0 ? (
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
                      {filteredArticles.map((article) => {
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
                                    {products.find(p => p.id === article.produitId)?.nom}
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
                                  onClick={() => {
                                    setSelectedArticle(article)
                                    window.location.href = `/products/${article.produitId}/articles`
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Gérer les articles du produit"
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
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CubeIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article trouvé</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 'Aucun article ne correspond à votre recherche' : 'Aucun article trouvé pour les produits de cette boutique'}
                    </p>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>• Créez d'abord des produits pour cette boutique</p>
                      <p>• Ajoutez ensuite des articles à chaque produit</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Boutique Modal */}
        {showEditModal && boutique && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier la boutique</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={editForm.nom}
                      onChange={(e) => setEditForm({...editForm, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={editForm.addresse}
                      onChange={(e) => setEditForm({...editForm, addresse: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={editForm.statut}
                      onChange={(e) => setEditForm({...editForm, statut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="VALIDE">Validé</option>
                      <option value="REFUSE">Refusé</option>
                      <option value="SUSPENDU">Suspendu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                    <input
                      type="number"
                      value={editForm.note}
                      onChange={(e) => setEditForm({...editForm, note: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      min="0"
                      max="5"
                      step="0.1"
                      required
                    />
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
                    onClick={handleUpdateBoutique}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        {showDetails && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Détails du produit</h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <ExclamationTriangleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    {selectedProduct.image ? (
                      <img src={selectedProduct.image} alt={selectedProduct.nom} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedProduct.nom}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Catégorie</p>
                      <p className="font-medium">{selectedProduct.sousCategorie?.categorie?.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sous-catégorie</p>
                      <p className="font-medium">{selectedProduct.sousCategorie?.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProduct.statut)}`}>
                        {selectedProduct.statut}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Articles</p>
                      <p className="font-medium">{articles.filter(a => a.produitId === selectedProduct.id).length}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      window.location.href = `/products/${selectedProduct.id}/articles`
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Voir les articles
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
