'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import { boutiqueService, documentService } from '@/services'
import { productAPI, categoryAPI, subCategoryAPI, articleAPI } from '@/lib/api'
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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'articles' | 'documents'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showAddArticleModal, setShowAddArticleModal] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [selectedProductForArticle, setSelectedProductForArticle] = useState<Product | null>(null)
  
  // Documents states
  const [documents, setDocuments] = useState<any[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [showDocumentPreview, setShowDocumentPreview] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<any>(null)
  
  // documentForm removed: documents are not editable from UI

  const [newDocumentForm, setNewDocumentForm] = useState({
    type: 'CARTE_IDENTITE' as const
  })
  
  const [editForm, setEditForm] = useState({
    nom: '',
    description: '',
    addresse: '',
    statut: '',
    note: 0
  })

  const [productForm, setProductForm] = useState({
    nom: '',
    description: '',
    prix: '',
    categorieId: '',
    sousCategorieId: '',
    boutiqueId: boutiqueId,
    statut: 'ACTIF'
  })

  const [articleForm, setArticleForm] = useState({
    produitId: 0,
    sku: '',
    prix: '',
    stockActuel: '',
    attributs: [
      { key: 'couleur', value: '' },
      { key: 'taille', value: '' }
    ]
  })

  useEffect(() => {
    fetchBoutique()
    fetchProducts()
    fetchCategories()
    fetchDocuments()
  }, [boutiqueId])

  useEffect(() => {
    if (products.length > 0 && !articlesLoading) {
      fetchArticles()
    }
  }, [products])

  useEffect(() => {
    calculateStats()
  }, [products, articles])

  // Reset sub-category when category changes
  useEffect(() => {
    if (productForm.categorieId) {
      setProductForm(prev => ({ ...prev, sousCategorieId: '' }))
    }
  }, [productForm.categorieId])

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
      
      const boutiqueProducts = productData.filter((p: any) => p.boutiqueId === boutiqueId)
      
      console.log('✅ Boutique Detail Page - Products for boutique:', boutiqueProducts.length)
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
      
      const allArticles: Article[] = []
      
      for (const product of products) {
        try {
          const response = await articleService.getArticlesByProduct(product.id)
          const productArticles = response?.data?.data || response?.data || []
          
          if (Array.isArray(productArticles) && productArticles.length > 0) {
            allArticles.push(...productArticles)
          }
        } catch (error) {
          console.error(`❌ Error fetching articles for product ${product.id}:`, error)
        }
      }
      
      setArticles(allArticles)
      console.log('✅ Boutique Detail Page - Total articles fetched:', allArticles.length)
    } catch (error) {
      console.error('❌ Boutique Detail Page - Error fetching articles:', error)
      setArticles([])
    } finally {
      setArticlesLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories()
      const categoriesData = response?.data?.data || response?.data || []
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      
      const subResponse = await subCategoryAPI.getSubCategoriesWithCategory()
      const subCategoriesData = subResponse?.data?.data || subResponse?.data || []
      setSubCategories(Array.isArray(subCategoriesData) ? subCategoriesData : [])
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
      setCategories([])
      setSubCategories([])
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await boutiqueService.getBoutiqueDocuments(boutiqueId)
      const documentData = response?.data?.data || response?.data || []
      setDocuments(Array.isArray(documentData) ? documentData : [])
    } catch (error) {
      console.error('❌ Error fetching documents:', error)
      setDocuments([])
    }
  }

  const handleCreateDocument = async () => {
    try {
      const personneId = boutique?.vendeur?.id || (boutique as any)?.personneId || (boutique as any)?.personne?.id || (boutique as any)?.vendeurId
      if (!documentFile || !personneId) {
        alert('Personne introuvable ou aucun fichier sélectionné')
        return
      }

      await documentService.createDocumentWithFile(
        personneId,
        newDocumentForm.type,
        documentFile
      )
      
      fetchDocuments()
      setShowAddDocumentModal(false)
      setNewDocumentForm({
        type: 'CARTE_IDENTITE'
      })
      setDocumentFile(null)
    } catch (error) {
      console.error('❌ Error creating document:', error)
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  // Editing disabled: handleUpdateDocument removed

  const handleValidateDocument = async (documentId: number) => {
    try {
      await documentService.validateDocument(documentId)
      fetchDocuments()
    } catch (error) {
      console.error('❌ Error validating document:', error)
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        await documentService.deleteDocument(documentId)
        fetchDocuments()
      } catch (error) {
        console.error('❌ Error deleting document:', error)
        alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
    }
  }

  // openEditDocumentModal removed — editing disabled

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

  const handleCreateProduct = async () => {
    try {
      const formData = new FormData()
      formData.append('nom', productForm.nom)
      formData.append('description', productForm.description)
      formData.append('prix', (parseFloat(productForm.prix) || 0).toString())
      formData.append('categorieId', productForm.categorieId)
      formData.append('sousCategorieId', productForm.sousCategorieId)
      formData.append('boutiqueId', boutiqueId.toString())
      formData.append('statut', productForm.statut)
      
      await productAPI.createProduct(formData)
      await fetchProducts()
      setShowAddProductModal(false)
      
      setProductForm({
        nom: '',
        description: '',
        prix: '',
        categorieId: '',
        sousCategorieId: '',
        boutiqueId: boutiqueId,
        statut: 'ACTIF'
      })
    } catch (error) {
      console.error('❌ Boutique Detail Page - Error creating product:', error)
    }
  }

  const handleCreateArticle = async () => {
    try {
      const finalProduitId = articleForm.produitId || selectedProductForArticle?.id
      
      if (!finalProduitId) {
        console.error('❌ No produitId available for article creation')
        return
      }
      
      // Convertir les attributs en objet (PAS en string JSON)
      const attributsObj = articleForm.attributs.reduce((acc, attr) => {
        if (attr.key && attr.value) {
          acc[attr.key] = attr.value
        }
        return acc
      }, {} as Record<string, string>)

      const articleData = {
        produit_id: finalProduitId,
        sku: articleForm.sku,
        prix: parseFloat(articleForm.prix) || 0,
        stock_actuel: parseInt(articleForm.stockActuel) || 0,
        attributs: attributsObj // ← Envoyer l'objet directement, PAS une chaîne JSON
      }
      
      console.log('📦 Sending article data:', articleData)
      
      await articleAPI.createArticle(articleData)
      await fetchArticles()
      setShowAddArticleModal(false)
      
      setArticleForm({
        produitId: 0,
        sku: '',
        prix: '',
        stockActuel: '',
        attributs: [
          { key: 'couleur', value: '' },
          { key: 'taille', value: '' }
        ]
      })
      setSelectedProductForArticle(null)
    } catch (error) {
      console.error('❌ Boutique Detail Page - Error creating article:', error)
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
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

  const getFilteredSubCategories = () => {
    if (!productForm.categorieId) return []
    return subCategories.filter(subCat => {
      const categoryId = subCat.categorieId || subCat.categorie?.id
      return categoryId === parseInt(productForm.categorieId)
    })
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

  if (!boutique) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Boutique non trouvée</h2>
          <p className="text-gray-500 mt-2">La boutique que vous recherchez n'existe pas.</p>
          <button
            onClick={() => router.push('/boutiques')}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retour à la liste
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f7b6c] via-[#0a5c50] to-[#064e3a] p-6 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.back()}
                  className="group flex items-center px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Retour</span>
                </button>
                <div>
                  <h1 className="text-2xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
                    {boutique?.nom || 'Boutique'}
                  </h1>
                  <p className="text-emerald-100 text-sm flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    Gestion complète de la boutique
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="group flex items-center px-6 py-3 bg-gradient-to-r from-[#ffc300] to-[#e5b000] text-gray-900 rounded-xl font-semibold hover:from-[#e5b000] hover:to-[#d4a000] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <PencilIcon className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                Modifier la boutique
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#ffc300] opacity-15 rounded-full -ml-16 -mb-16 blur-lg"></div>
        </div>

        {/* Boutique Info Card */}
        {boutique && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-shrink-0">
                {boutique.logo ? (
                  <img
                    src={`http://10.153.46.247:8080${boutique.logo}`}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Stats cards remain the same */}
          <div className="group bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors mb-2">
                <ShoppingBagIcon className="h-5 w-5 text-[#0f7b6c]" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Produits</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="group bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors mb-2">
                <CubeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Articles</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalArticles}</p>
            </div>
          </div>
          <div className="group bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors mb-2">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Stock Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalStock}</p>
            </div>
          </div>
          <div className="group bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors mb-2">
                <CurrencyDollarIcon className="h-5 w-5 text-[#0f7b6c]" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Prix Moyen</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.averagePrice)}</p>
            </div>
          </div>
          <div className="group bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rupture Stock</p>
              <p className="text-xl font-bold text-gray-900">{stats.outOfStockCount}</p>
            </div>
          </div>
          <div className="group bg-gradient-to-r from-[#ffc300]/10 to-[#ffc300]/5 rounded-lg border border-[#ffc300]/20 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-[#ffc300]/20 rounded-lg mb-2">
                <FireIcon className="h-5 w-5 text-[#d4a000]" />
              </div>
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Valeur Stock</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
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
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-2 text-xs font-medium transition-colors relative ${
                  activeTab === 'documents'
                    ? 'text-[#0f7b6c]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Documents ({documents.length})
                {activeTab === 'documents' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f7b6c] rounded-full"></div>
                )}
              </button>
            </nav>
          </div>

          <div className="p-3">
            {/* Overview Tab Content */}
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
                                  <img src={`http://10.153.46.247:8080${product.image}`} alt={product.nom} className="h-8 w-8 object-cover rounded-md" />
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

            {/* Products Tab Content */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="relative w-full sm:w-80">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="flex items-center px-3 py-2 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nouveau Produit
                  </button>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="group bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {product.image ? (
                            <img src={`http://10.153.46.247:8080${product.image}`} alt={product.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <PhotoIcon className="h-6 w-6 text-gray-400" />
                              <p className="text-xs text-gray-400 mt-1">Pas d'image</p>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{product.nom}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <CubeIcon className="h-3 w-3 mr-1 text-[#0f7b6c]" />
                              {articles.filter(a => a.produitId === product.id).length} articles
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedProduct(product)
                                  setShowDetails(true)
                                }}
                                className="p-1 text-[#0f7b6c] hover:bg-gray-100 rounded transition-colors"
                                title="Voir détails"
                              >
                                <EyeIcon className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProductForArticle(product)
                                  setArticleForm({
                                    ...articleForm,
                                    produitId: product.id,
                                    sku: `${product.nom.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`
                                  })
                                  setShowAddArticleModal(true)
                                }}
                                className="p-1 text-emerald-600 hover:bg-gray-100 rounded transition-colors"
                                title="Ajouter un article"
                              >
                                <PlusIcon className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => router.push(`/products/${product.id}/articles`)}
                                className="p-1 text-blue-600 hover:bg-gray-100 rounded transition-colors"
                                title="Gérer les articles"
                              >
                                <CubeIcon className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1 text-red-600 hover:bg-gray-100 rounded transition-colors"
                                title="Supprimer"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBagIcon className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 'Aucun produit ne correspond à votre recherche' : 'Cette boutique n\'a pas encore de produits'}
                    </p>
                    <button
                      onClick={() => setShowAddProductModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Créer le premier produit
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Articles Tab Content */}
            {activeTab === 'articles' && (
              <div className="space-y-6">
                <div className="relative w-full sm:w-80">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent text-sm"
                  />
                </div>

                {filteredArticles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Article</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attributs</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredArticles.map((article) => {
                          const attributes = parseAttributes(article.attributs)
                          const stockStatus = getStockStatus(article.stockActuel)
                          
                          return (
                            <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  {article.image ? (
                                    <img src={`http://10.153.46.247:8080${article.image}`} alt={article.sku} className="h-8 w-8 object-cover rounded-lg mr-2" />
                                  ) : (
                                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center mr-2">
                                      <PhotoIcon className="h-4 w-4 text-gray-400" />
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
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className="text-sm font-mono text-gray-900">{article.sku}</span>
                               </td>
                              <td className="px-3 py-2">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(attributes).map(([key, value]) => (
                                    <span key={key} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                      {key}: {value as string}
                                    </span>
                                  ))}
                                </div>
                               </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className="text-sm font-bold text-[#0f7b6c]">{formatCurrency(article.prix)}</span>
                               </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className={`text-sm font-bold ${stockStatus.color}`}>{article.stockActuel}</span>
                                  <span className="text-xs text-gray-500">{stockStatus.label}</span>
                                </div>
                               </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => router.push(`/products/${article.produitId}/articles`)}
                                    className="p-1 text-blue-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Gérer les articles"
                                  >
                                    <CubeIcon className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteArticle(article.id)}
                                    className="p-1 text-red-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Supprimer"
                                  >
                                    <TrashIcon className="h-3 w-3" />
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
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CubeIcon className="h-10 w-10 text-gray-300" />
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

            {/* Documents Tab Content */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="relative w-full sm:w-80">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un document..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddDocumentModal(true)}
                    className="flex items-center px-3 py-2 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nouveau Document
                  </button>
                </div>

                {documents.filter((doc) => {
                  const term = searchTerm.toLowerCase()
                  return (
                    String(doc.nom ?? '').toLowerCase().includes(term) ||
                    String(doc.type ?? '').toLowerCase().includes(term)
                  )
                }).length > 0 ? (
                  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {documents
                            .filter((doc) => {
                              const term = searchTerm.toLowerCase()
                              return (
                                String(doc.nom ?? '').toLowerCase().includes(term) ||
                                String(doc.type ?? '').toLowerCase().includes(term) ||
                                String(doc.description ?? '').toLowerCase().includes(term)
                              )
                            })
                            .map((document) => (
                              <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2">
                                  <div className="flex items-center">
                                    <div
                                      className="h-9 w-9 rounded-lg overflow-hidden mr-2 border border-gray-200 cursor-pointer hover:ring-2 hover:ring-[#0f7b6c]/40"
                                      onClick={() => {
                                        setPreviewDocument(document)
                                        setShowDocumentPreview(true)
                                      }}
                                    >
                                      {document.url ? (
                                        <img
                                          src={`http://10.153.46.247:8080${document.url}`}
                                          alt={document.nom}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full bg-[#0f7b6c]/10 flex items-center justify-center">
                                          <svg className="h-3 w-3 text-[#0f7b6c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{document.nom}</p>
                                      <p className="text-xs text-gray-500">ID: {document.id}</p>
                                    </div>
                                  </div>
                                 </td>
                                <td className="px-3 py-2">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    {document.type}
                                  </span>
                                 </td>
                                <td className="px-3 py-2">
                                  <p className="text-xs text-gray-600 line-clamp-2">{document.description}</p>
                                 </td>
                                <td className="px-3 py-2">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                    document.validated 
                                      ? 'bg-emerald-50 text-emerald-700' 
                                      : 'bg-amber-50 text-amber-700'
                                  }`}>
                                    {document.validated ? 'Validé' : 'En attente'}
                                  </span>
                                 </td>
                                <td className="px-3 py-2">
                                  <p className="text-xs text-gray-600">{formatDate(document.createdAt)}</p>
                                 </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center justify-end space-x-1">
                                    {!document.validated && (
                                      <button
                                        onClick={() => handleValidateDocument(document.id)}
                                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                        title="Valider"
                                      >
                                        <CheckIcon className="h-3 w-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteDocument(document.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Supprimer"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                 </td>
                               </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 'Essayez une autre recherche' : 'Commencez par ajouter un document'}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setShowAddDocumentModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Ajouter un document
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals remain the same but shortened for brevity */}
      {/* Edit Boutique Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Modifier la boutique</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input type="text" value={editForm.nom} onChange={(e) => setEditForm({...editForm, nom: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input type="text" value={editForm.addresse} onChange={(e) => setEditForm({...editForm, addresse: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select value={editForm.statut} onChange={(e) => setEditForm({...editForm, statut: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent">
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="VALIDE">Validé</option>
                  <option value="REFUSE">Refusé</option>
                  <option value="SUSPENDU">Suspendu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note (0-5)</label>
                <input type="number" value={editForm.note} onChange={(e) => setEditForm({...editForm, note: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent" min="0" max="5" step="0.1" />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">Annuler</button>
              <button onClick={handleUpdateBoutique} className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-xl hover:shadow-lg">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Ajouter un produit</h3>
              <button onClick={() => setShowAddProductModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input type="text" value={productForm.nom} onChange={(e) => setProductForm({...productForm, nom: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix</label>
                <input type="number" value={productForm.prix} onChange={(e) => setProductForm({...productForm, prix: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <select value={productForm.categorieId} onChange={(e) => setProductForm({...productForm, categorieId: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl">
                  <option value="">Sélectionner</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sous-catégorie</label>
                <select value={productForm.sousCategorieId} onChange={(e) => setProductForm({...productForm, sousCategorieId: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl" disabled={!productForm.categorieId}>
                  <option value="">Sélectionner</option>
                  {getFilteredSubCategories().map(sub => <option key={sub.id} value={sub.id}>{sub.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
              <button onClick={() => setShowAddProductModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl">Annuler</button>
              <button onClick={handleCreateProduct} className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-xl">Créer</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Article Modal */}
      {showAddArticleModal && selectedProductForArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Ajouter un article</h3>
              <button onClick={() => setShowAddArticleModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                <input type="text" value={articleForm.sku} onChange={(e) => setArticleForm({...articleForm, sku: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix</label>
                <input type="number" value={articleForm.prix} onChange={(e) => setArticleForm({...articleForm, prix: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                <input type="number" value={articleForm.stockActuel} onChange={(e) => setArticleForm({...articleForm, stockActuel: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attributs</label>
                {articleForm.attributs.map((attr, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={attr.key} onChange={(e) => updateAttribute(idx, 'key', e.target.value)} placeholder="Nom" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
                    <input type="text" value={attr.value} onChange={(e) => updateAttribute(idx, 'value', e.target.value)} placeholder="Valeur" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
                    <button onClick={() => removeAttribute(idx)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={addAttribute} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-emerald-600">+ Ajouter</button>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
              <button onClick={() => setShowAddArticleModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl">Annuler</button>
              <button onClick={handleCreateArticle} className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl">Créer</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {showDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedProduct.nom}</h3>
                <button onClick={() => setShowDetails(false)} className="p-1 hover:bg-gray-100 rounded-lg"><XMarkIcon className="h-5 w-5" /></button>
              </div>
              <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDetails(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-xl">Fermer</button>
                <button onClick={() => { setShowDetails(false); router.push(`/products/${selectedProduct.id}/articles`); }} className="flex-1 px-4 py-2 bg-[#0f7b6c] text-white rounded-xl">Voir articles</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocumentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Ajouter un document</h3>
                <button onClick={() => setShowAddDocumentModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><XMarkIcon className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de document</label>
                  <select
                    value={newDocumentForm.type}
                    onChange={(e) => setNewDocumentForm({...newDocumentForm, type: e.target.value as any})}
                    className="w-full px-4 py-2 border rounded-xl"
                  >
                    <option value="CARTE_IDENTITE">Carte d'identité</option>
                    <option value="NINEA">NINEA</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="RCCM">RCCM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
                  <input
                    type="file"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border rounded-xl"
                  />
                  {documentFile && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">{documentFile.name}</p>
                      {documentFile.type.startsWith('image') && (
                        <img
                          src={URL.createObjectURL(documentFile)}
                          alt="Aperçu du document"
                          className="mt-2 max-h-48 w-full object-contain rounded-xl border border-gray-200"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddDocumentModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-xl">Annuler</button>
                <button onClick={handleCreateDocument} className="flex-1 px-4 py-2 bg-[#0f7b6c] text-white rounded-xl">Ajouter</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editing removed: edit modal intentionally omitted */}

      {/* Document Preview Modal */}
      {showDocumentPreview && previewDocument && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 p-4 flex justify-between items-center border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewDocument.nom || 'Aperçu du document'}</h3>
                <p className="text-xs text-gray-500">Type: {previewDocument.type}</p>
              </div>
              <button onClick={() => { setShowDocumentPreview(false); setPreviewDocument(null); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center">
              {previewDocument.url ? (
                <img
                  src={`http://10.153.46.247:8080${previewDocument.url}`}
                  alt={previewDocument.nom}
                  className="max-h-[80vh] w-full object-contain"
                />
              ) : (
                <div className="p-6 text-center text-gray-500">Aucun fichier disponible</div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}