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
  EnvelopeIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

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

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Rupture', color: 'text-red-600', bg: 'bg-red-50' }
    if (stock < 10) return { label: 'Stock faible', color: 'text-orange-600', bg: 'bg-orange-50' }
    if (stock < 50) return { label: 'Stock moyen', color: 'text-blue-600', bg: 'bg-blue-50' }
    return { label: 'Stock élevé', color: 'text-emerald-600', bg: 'bg-emerald-50' }
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
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" style={{ borderColor: '#0f7b6c' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#0f7b6c] to-[#ffc300] animate-pulse"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-3">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] p-4 text-white">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.back()}
                  className="flex items-center px-2 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  <ArrowLeftIcon className="h-3 w-3 mr-1" />
                  Retour
                </button>
                <div>
                  <h1 className="text-lg font-bold mb-1">
                    {boutique?.nom || 'Boutique'}
                  </h1>
                  <p className="text-emerald-100 text-xs">
                    Gestion complète de la boutique
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center px-3 py-1.5 bg-[#ffc300] text-gray-900 rounded-lg font-semibold hover:bg-[#e5b000] transition-all transform hover:scale-105 shadow-lg text-sm"
              >
                <PencilIcon className="h-3 w-3 mr-1" />
                Modifier
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#ffc300] opacity-10 rounded-full -ml-12 -mb-12"></div>
        </div>

        {/* Boutique Info Card Premium */}
        {boutique && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-shrink-0">
                {boutique.logo ? (
                  <img
                    src={`http://10.153.54.247:8080${boutique.logo}`}
                    alt={boutique.nom}
                    className="h-20 w-20 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <BuildingStorefrontIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{boutique.nom}</h2>
                    <p className="text-sm text-gray-600">{boutique.description}</p>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${
                    boutique.statut === 'VALIDE' ? 'bg-emerald-50 text-emerald-700' :
                    boutique.statut === 'EN_ATTENTE' ? 'bg-amber-50 text-amber-700' :
                    boutique.statut === 'SUSPENDU' ? 'bg-orange-50 text-orange-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {boutique.statut === 'VALIDE' && <CheckIcon className="h-3 w-3 mr-1" />}
                    {boutique.statut === 'EN_ATTENTE' && <ClockIcon className="h-3 w-3 mr-1" />}
                    {boutique.statut}
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-3 w-3 mr-1 text-[#0f7b6c]" />
                    <span className="text-sm">{boutique.addresse}</span>
                  </div>
                  <div className="flex items-center">
                    <StarIconSolid className="h-3 w-3 mr-1 text-[#ffc300]" />
                    <span className="font-semibold text-gray-900 text-sm">{boutique.note.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1 text-xs">/ 5.0</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-3 w-3 mr-1 text-[#0f7b6c]" />
                    <span className="text-sm">Créée le {formatDate(boutique.createdAt)}</span>
                  </div>
                  {boutique.vendeur && (
                    <div className="flex items-center text-gray-600">
                      <UserIcon className="h-3 w-3 mr-1 text-[#0f7b6c]" />
                      <span className="text-sm">{boutique.vendeur.prenom} {boutique.vendeur.nom}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards Modern */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div className="group bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors mb-2">
                <ShoppingBagIcon className="h-5 w-5 text-[#0f7b6c]" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Produits</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalProducts}</p>
              <div className="mt-1 text-xs text-emerald-600 font-medium">+12%</div>
            </div>
          </div>
          <div className="group bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors mb-2">
                <CubeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Articles</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalArticles}</p>
              <div className="mt-1 text-xs text-blue-600 font-medium">+8%</div>
            </div>
          </div>
          <div className="group bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors mb-2">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Stock Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalStock}</p>
              <div className="mt-1 text-xs text-purple-600 font-medium">+5%</div>
            </div>
          </div>
          <div className="group bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors mb-2">
                <CurrencyDollarIcon className="h-5 w-5 text-[#0f7b6c]" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Prix Moyen</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.averagePrice)}</p>
              <div className="mt-1 text-xs text-emerald-600 font-medium">+3%</div>
            </div>
          </div>
          <div className="group bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rupture Stock</p>
              <p className="text-xl font-bold text-gray-900">{stats.outOfStockCount}</p>
              <div className="mt-1 text-xs text-red-600 font-medium">-2%</div>
            </div>
          </div>
          <div className="group bg-gradient-to-r from-[#ffc300]/10 to-[#ffc300]/5 rounded-lg border border-[#ffc300]/20 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-[#ffc300]/20 rounded-lg mb-2">
                <FireIcon className="h-5 w-5 text-[#d4a000]" />
              </div>
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Valeur Stock</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              <div className="mt-1 text-xs text-[#d4a000] font-medium">+15%</div>
            </div>
          </div>
        </div>

        {/* Tabs Modern */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="border-b border-gray-100">
            <nav className="flex px-3 gap-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 text-xs font-medium transition-colors relative ${
                  activeTab === 'overview'
                    ? 'text-[#0f7b6c]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Vue d'ensemble
                {activeTab === 'overview' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f7b6c] rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 text-xs font-medium transition-colors relative ${
                  activeTab === 'products'
                    ? 'text-[#0f7b6c]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Produits ({stats.totalProducts})
                {activeTab === 'products' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f7b6c] rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-2 text-xs font-medium transition-colors relative ${
                  activeTab === 'articles'
                    ? 'text-[#0f7b6c]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Articles ({stats.totalArticles})
                {activeTab === 'articles' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f7b6c] rounded-full"></div>
                )}
              </button>
            </nav>
          </div>

          <div className="p-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Recent Products */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">Produits récents</h3>
                      <SparklesIcon className="h-3 w-3 text-[#ffc300]" />
                    </div>
                    <div className="space-y-3">
                      {products.length > 0 ? (
                        products.slice(0, 5).map((product, index) => (
                          <div key={product.id} className="group flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center">
                              <div className="relative">
                                {product.image ? (
                                  <img src={`http://10.153.54.247:8080${product.image}`} alt={product.nom} className="h-8 w-8 object-cover rounded-md" />
                                ) : (
                                  <div className="h-8 w-8 bg-gray-200 rounded-md flex items-center justify-center">
                                    <PhotoIcon className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute -top-1 -left-1 w-4 h-4 bg-[#0f7b6c] text-white text-xs rounded-full flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                              </div>
                              <div className="ml-2">
                                <p className="text-xs font-medium text-gray-900 truncate max-w-32">{product.nom}</p>
                                <p className="text-xs text-gray-500">{product.sousCategorie?.categorie?.nom}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => router.push(`/products/${product.id}/articles`)}
                                className="p-1 text-[#0f7b6c] hover:bg-[#0f7b6c]/10 rounded-md transition-colors"
                              >
                                <EyeIcon className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => setSelectedProduct(product)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <ShoppingBagIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Aucun produit trouvé</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Low Stock Articles */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">Alertes stock</h3>
                      <TruckIcon className="h-3 w-3 text-[#0f7b6c]" />
                    </div>
                    <div className="space-y-3">
                      {articles.filter(a => a.stockActuel < 10).length > 0 ? (
                        articles
                          .filter(article => article.stockActuel < 10)
                          .slice(0, 5)
                          .map((article) => {
                            const attributes = parseAttributes(article.attributs)
                            const stockStatus = getStockStatus(article.stockActuel)
                            return (
                              <div key={article.id} className={`flex items-center justify-between p-3 ${stockStatus.bg} rounded-xl`}>
                                <div>
                                  <p className="font-medium text-gray-900">{article.sku}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {attributes.couleur && `${attributes.couleur}`}
                                    {attributes.taille && ` - ${attributes.taille}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-bold ${stockStatus.color}`}>{article.stockActuel} unités</p>
                                  <p className="text-xs text-gray-500">{stockStatus.label}</p>
                                </div>
                              </div>
                            )
                          })
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheckIcon className="h-10 w-10 text-gray-300" />
                          </div>
                          <p className="text-gray-500">Aucune alerte stock</p>
                          <p className="text-sm text-gray-400 mt-1">Tous les niveaux de stock sont bons</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="relative w-full sm:w-80">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={() => router.push('/products')}
                    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nouveau Produit
                  </button>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {product.image ? (
                            <img src={`http://10.153.54.247:8080${product.image}`} alt={product.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <PhotoIcon className="h-12 w-12 text-gray-400" />
                              <p className="text-xs text-gray-400 mt-2">Pas d'image</p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 truncate">{product.nom}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <CubeIcon className="h-4 w-4 mr-1 text-[#0f7b6c]" />
                              {articles.filter(a => a.produitId === product.id).length} articles
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedProduct(product)
                                  setShowDetails(true)
                                }}
                                className="p-1.5 text-[#0f7b6c] hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/products/${product.id}/articles`)}
                                className="p-1.5 text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <CubeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBagIcon className="h-12 w-12 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 'Aucun produit ne correspond à votre recherche' : 'Cette boutique n\'a pas encore de produits'}
                    </p>
                    <button
                      onClick={() => router.push('/products')}
                      className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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
              <div className="space-y-6">
                <div className="relative w-full sm:w-80">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent transition-all"
                  />
                </div>

                {filteredArticles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Article</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attributs</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredArticles.map((article) => {
                          const attributes = parseAttributes(article.attributs)
                          const stockStatus = getStockStatus(article.stockActuel)
                          
                          return (
                            <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {article.image ? (
                                    <img src={`http://10.153.54.247:8080${article.image}`} alt={article.sku} className="h-10 w-10 object-cover rounded-lg mr-3" />
                                  ) : (
                                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                      <PhotoIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      Article #{article.id}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {products.find(p => p.id === article.produitId)?.nom}
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
                                    <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                      {key}: {value as string}
                                    </span>
                                  ))}
                                </div>
                               </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold text-[#0f7b6c]">{formatCurrency(article.prix)}</span>
                               </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className={`text-sm font-bold ${stockStatus.color}`}>{article.stockActuel}</span>
                                  <span className="text-xs text-gray-500">{stockStatus.label}</span>
                                </div>
                               </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => router.push(`/products/${article.produitId}/articles`)}
                                    className="p-1.5 text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Gérer les articles"
                                  >
                                    <CubeIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteArticle(article.id)}
                                    className="p-1.5 text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CubeIcon className="h-12 w-12 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article trouvé</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 'Aucun article ne correspond à votre recherche' : 'Aucun article trouvé pour les produits de cette boutique'}
                    </p>
                    <div className="inline-flex flex-col items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-xl p-4">
                      <p>• Créez d'abord des produits pour cette boutique</p>
                      <p>• Ajoutez ensuite des articles à chaque produit</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Boutique Modal Modernisé */}
        {showEditModal && boutique && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Modifier la boutique</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={editForm.nom}
                    onChange={(e) => setEditForm({...editForm, nom: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={editForm.addresse}
                    onChange={(e) => setEditForm({...editForm, addresse: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={editForm.statut}
                    onChange={(e) => setEditForm({...editForm, statut: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent"
                  >
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="VALIDE">Validé</option>
                    <option value="REFUSE">Refusé</option>
                    <option value="SUSPENDU">Suspendu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note (0-5)</label>
                  <input
                    type="number"
                    value={editForm.note}
                    onChange={(e) => setEditForm({...editForm, note: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateBoutique}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Details Modal Modernisé */}
        {showDetails && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Détails du produit</h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                    {selectedProduct.image ? (
                      <img src={`http://10.153.54.247:8080${selectedProduct.image}`} alt={selectedProduct.nom} className="w-full h-full object-cover" />
                    ) : (
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{selectedProduct.nom}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Catégorie</p>
                      <p className="font-medium text-gray-900 mt-1">{selectedProduct.sousCategorie?.categorie?.nom || 'Non défini'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Sous-catégorie</p>
                      <p className="font-medium text-gray-900 mt-1">{selectedProduct.sousCategorie?.nom || 'Non défini'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Statut</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium mt-1 ${getStatusColor(selectedProduct.statut)}`}>
                        {selectedProduct.statut}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Articles</p>
                      <p className="font-medium text-gray-900 mt-1">{articles.filter(a => a.produitId === selectedProduct.id).length}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      router.push(`/products/${selectedProduct.id}/articles`)
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-xl hover:shadow-lg transition-all font-medium"
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