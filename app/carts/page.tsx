'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import AdminLayout from '@/components/layout/AdminLayout'
import { cartService } from '@/services/cartService'
import { userService } from '@/services/userService'

interface CartItem {
  id: number
  article: {
    id: number
    nom: string
    prix: number
  }
  quantite: number
  prixUnitaire: number
  sousTotal: number
}

interface Cart {
  id: number
  client: {
    id: number
    nom: string
    prenom: string
  }
  status: string
  total: number
  date: string
  items?: CartItem[]
}

interface User {
  id: number
  nom: string
  prenom: string
  email: string
}

const CART_STATUSES = [
  { value: 'EN_ATTENTE', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'VALIDE', label: 'Validé', color: 'bg-green-100 text-green-800' },
  { value: 'ANNULE', label: 'Annulé', color: 'bg-red-100 text-red-800' }
]

export default function CartsPage() {
  const [carts, setCarts] = useState<Cart[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showValidateModal, setShowValidateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [cartForm, setCartForm] = useState({ clientId: 0 })
  const [itemForm, setItemForm] = useState({ articleId: 0, quantite: 1 })

  useEffect(() => {
    fetchCarts()
    fetchUsers()
  }, [])

  const fetchCarts = async () => {
    try {
      console.log('🛒 Carts Page - Fetching carts...')
      
      // According to the API documentation, there's no endpoint to get all carts
      // We need to fetch carts by client or use a different approach
      // For now, let's start with an empty array and let users search by client
      setCarts([])
      console.log('✅ Carts Page - Carts initialized (use search to find carts)')
    } catch (error) {
      console.error('❌ Carts Page - Error fetching carts:', error)
      setCarts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await userService.getPersons()
      const userData = response?.data?.data || response?.data || []
      setUsers(Array.isArray(userData) ? userData : [])
    } catch (error) {
      console.error('❌ Carts Page - Error fetching users:', error)
      setUsers([])
    }
  }

  const handleSearch = async () => {
    try {
      console.log('🔍 Carts Page - Searching carts...')
      
      if (clientFilter) {
        console.log(`🛒 Carts Page - Fetching carts for client ${clientFilter}...`)
        const response = await cartService.getCartsByClient(parseInt(clientFilter))
        const cartData = response?.data || []
        setCarts(Array.isArray(cartData) ? cartData : [])
        console.log('✅ Carts Page - Carts found:', cartData.length)
      } else {
        console.log('⚠️ Carts Page - Please select a client to search carts')
        setCarts([])
      }
    } catch (error) {
      console.error('❌ Carts Page - Error searching carts:', error)
      setCarts([])
    }
  }

  const handleCreateCart = async () => {
    try {
      await cartService.createCart(cartForm.clientId)
      fetchCarts()
      setShowCreateModal(false)
      setCartForm({ clientId: 0 })
    } catch (error) {
      console.error('❌ Carts Page - Error creating cart:', error)
    }
  }

  const handleAddItem = async () => {
    if (!selectedCart || !itemForm.articleId) return
    
    try {
      await cartService.addItemToCart(selectedCart.id, itemForm.articleId, itemForm.quantite)
      fetchCarts()
      setShowAddItemModal(false)
      setItemForm({ articleId: 0, quantite: 1 })
    } catch (error) {
      console.error('❌ Carts Page - Error adding item:', error)
    }
  }

  const handleUpdateItemQuantity = async (itemId: number, newQuantity: number) => {
    if (!selectedCart) return
    
    try {
      await cartService.updateCartItem(itemId, newQuantity)
      fetchCarts()
    } catch (error) {
      console.error('❌ Carts Page - Error updating item quantity:', error)
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    if (!selectedCart) return
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article du panier ?')) {
      try {
        await cartService.deleteCartItem(itemId)
        fetchCarts()
      } catch (error) {
        console.error('❌ Carts Page - Error removing item:', error)
      }
    }
  }

  const handleValidateCart = async () => {
    if (!selectedCart) return
    
    try {
      await cartService.validateCart(selectedCart.id)
      fetchCarts()
      setShowValidateModal(false)
      setSelectedCart(null)
    } catch (error) {
      console.error('❌ Carts Page - Error validating cart:', error)
    }
  }

  const handleDeleteCart = async (cartId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce panier ? Cette action est irréversible.')) {
      try {
        await cartService.deleteCart(cartId)
        fetchCarts()
      } catch (error) {
        console.error('❌ Carts Page - Error deleting cart:', error)
      }
    }
  }

  const handleViewDetails = async (cart: Cart) => {
    try {
      const response = await cartService.getCartItems(cart.id)
      const cartWithItems = { ...cart, items: response?.data || [] }
      setSelectedCart(cartWithItems)
      setShowDetails(true)
    } catch (error) {
      console.error('❌ Carts Page - Error fetching cart details:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const statusConfig = CART_STATUSES.find(s => s.value === status)
    return statusConfig?.color || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const statusConfig = CART_STATUSES.find(s => s.value === status)
    return statusConfig?.label || status
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

  const filteredCarts = carts.filter(cart =>
    cart.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cart.client?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cart.id.toString().includes(searchTerm)
  )

  const totalPages = Math.ceil(filteredCarts.length / itemsPerPage)
  const paginatedCarts = filteredCarts.slice(
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Paniers</h1>
            <p className="text-gray-600">Gérez tous les paniers des clients</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau Panier
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Comment utiliser cette page</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Sélectionnez un client dans le filtre pour voir ses paniers</li>
                  <li>Créez un nouveau panier pour un client spécifique</li>
                  <li>Ajoutez des articles aux paniers existants</li>
                  <li>Validez les paniers pour les transformer en commandes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un panier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Tous les statuts</option>
              {CART_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Tous les clients</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.prenom} {user.nom}
                </option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtrer
            </button>
          </div>
        </div>

        {/* Carts Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Panier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCarts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShoppingCartIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">#{cart.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cart.client?.prenom} {cart.client?.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {cart.client?.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(cart.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-emerald-600">
                        {formatCurrency(cart.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(cart.status)}`}>
                        {getStatusLabel(cart.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(cart)}
                          className="text-emerald-600 hover:text-emerald-900"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCart(cart)
                            setShowAddItemModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ajouter un article"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        {cart.status === 'EN_ATTENTE' && (
                          <button
                            onClick={() => {
                              setSelectedCart(cart)
                              setShowValidateModal(true)
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Valider le panier"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCart(cart.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                    {Math.min(currentPage * itemsPerPage, filteredCarts.length)}
                  </span>{' '}
                  sur <span className="font-medium">{filteredCarts.length}</span> paniers
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

        {/* Create Cart Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Créer un nouveau panier</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <select
                      value={cartForm.clientId}
                      onChange={(e) => setCartForm({...cartForm, clientId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="">Sélectionner un client</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.prenom} {user.nom} - {user.email}
                        </option>
                      ))}
                    </select>
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
                    onClick={handleCreateCart}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Details Modal */}
        {showDetails && selectedCart && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Détails du Panier #{selectedCart.id}</h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">{selectedCart.client?.prenom} {selectedCart.client?.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(selectedCart.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCart.status)}`}>
                        {getStatusLabel(selectedCart.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-emerald-600">{formatCurrency(selectedCart.total)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-500">Articles dans le panier</p>
                      <button
                        onClick={() => {
                          setShowAddItemModal(true)
                          setShowDetails(false)
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        <PlusIcon className="h-4 w-4 inline mr-1" />
                        Ajouter un article
                      </button>
                    </div>
                    <div className="space-y-2">
                      {selectedCart.items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="font-medium">{item.article.nom}</p>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(item.prixUnitaire)} × {item.quantite}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleUpdateItemQuantity(item.id, Math.max(1, item.quantite - 1))}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                -
                              </button>
                              <span className="text-sm font-medium w-8 text-center">{item.quantite}</span>
                              <button
                                onClick={() => handleUpdateItemQuantity(item.id, item.quantite + 1)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                +
                              </button>
                            </div>
                            <p className="font-bold">{formatCurrency(item.sousTotal)}</p>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold">Total</p>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedCart.total)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  {selectedCart.status === 'EN_ATTENTE' && (
                    <button
                      onClick={() => {
                        setShowValidateModal(true)
                        setShowDetails(false)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Valider le panier
                    </button>
                  )}
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

        {/* Add Item Modal */}
        {showAddItemModal && selectedCart && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Ajouter un article au panier #{selectedCart.id}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Article</label>
                    <input
                      type="number"
                      value={itemForm.articleId}
                      onChange={(e) => setItemForm({...itemForm, articleId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Entrez l'ID de l'article"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                    <input
                      type="number"
                      value={itemForm.quantite}
                      onChange={(e) => setItemForm({...itemForm, quantite: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddItemModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validate Cart Modal */}
        {showValidateModal && selectedCart && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Valider le panier #{selectedCart.id}
                </h3>
                
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Êtes-vous sûr de vouloir valider ce panier ? Cette action transformera le panier en commande.
                  </p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium">{selectedCart.client?.prenom} {selectedCart.client?.nom}</p>
                    <p className="text-sm text-gray-500 mt-2">Total</p>
                    <p className="font-bold text-emerald-600">{formatCurrency(selectedCart.total)}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowValidateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleValidateCart}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Valider
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
