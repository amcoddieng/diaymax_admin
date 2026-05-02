'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import AdminLayout from '@/components/layout/AdminLayout'
import { orderService } from '@/services/orderService'

interface OrderDetail {
  article: {
    id: number
    nom: string
    prix: number
  }
  quantite: number
  prixUnitaire: number
  sousTotal: number
}

interface Order {
  id: number
  client: {
    id: number
    nom: string
    prenom: string
  }
  statut: string
  statutPaiement: string
  total: number
  date: string
  details?: OrderDetail[]
}

const ORDER_STATUSES = [
  { value: 'EN_ATTENTE', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMEE', label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  { value: 'EN_PREPARATION', label: 'En préparation', color: 'bg-purple-100 text-purple-800' },
  { value: 'ENVOYEE', label: 'Envoyée', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'LIVREE', label: 'Livrée', color: 'bg-green-100 text-green-800' },
  { value: 'ANNULEE', label: 'Annulée', color: 'bg-red-100 text-red-800' }
]

const PAYMENT_STATUSES = [
  { value: 'EN_ATTENTE', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PAYEE', label: 'Payée', color: 'bg-green-100 text-green-800' },
  { value: 'REMBOURSEE', label: 'Remboursée', color: 'bg-blue-100 text-blue-800' },
  { value: 'ECHOUE', label: 'Échouée', color: 'bg-red-100 text-red-800' }
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchOrders()
    fetchTotalRevenue()
  }, [])

  const fetchOrders = async () => {
    try {
      console.log('📦 Orders Page - Fetching orders...')
      const response = await orderService.getOrders()
      const orderData = response?.data?.data || response?.data || []
      setOrders(Array.isArray(orderData) ? orderData : [])
      console.log('✅ Orders Page - Orders fetched:', orderData.length)
    } catch (error) {
      console.error('❌ Orders Page - Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTotalRevenue = async () => {
    try {
      const response = await orderService.getTotalRevenue()
      setTotalRevenue(response?.data || 0)
    } catch (error) {
      console.error('❌ Orders Page - Error fetching revenue:', error)
      setTotalRevenue(0)
    }
  }

  const handleSearch = async () => {
    try {
      let response
      
      if (statusFilter) {
        response = await orderService.getOrdersByStatus(statusFilter)
      } else if (paymentFilter) {
        response = await orderService.getOrdersByPaymentStatus(paymentFilter)
      } else {
        response = await orderService.getOrders()
      }
      
      const orderData = response?.data?.data || response?.data || []
      setOrders(Array.isArray(orderData) ? orderData : [])
    } catch (error) {
      console.error('❌ Orders Page - Error searching orders:', error)
    }
  }

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      fetchOrders()
      setShowStatusModal(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('❌ Orders Page - Error updating status:', error)
    }
  }

  const handleUpdatePaymentStatus = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updatePaymentStatus(orderId, newStatus)
      fetchOrders()
      setShowPaymentModal(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('❌ Orders Page - Error updating payment status:', error)
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      try {
        await orderService.cancelOrder(orderId)
        fetchOrders()
      } catch (error) {
        console.error('❌ Orders Page - Error cancelling order:', error)
      }
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
      try {
        await orderService.deleteOrder(orderId)
        fetchOrders()
      } catch (error) {
        console.error('❌ Orders Page - Error deleting order:', error)
      }
    }
  }

  const handleViewDetails = async (order: Order) => {
    try {
      const response = await orderService.getOrderById(order.id)
      const orderDetails = response?.data
      setSelectedOrder(orderDetails)
      setShowDetails(true)
    } catch (error) {
      console.error('❌ Orders Page - Error fetching order details:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status)
    return statusConfig?.color || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status: string) => {
    const statusConfig = PAYMENT_STATUSES.find(s => s.value === status)
    return statusConfig?.color || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status)
    return statusConfig?.label || status
  }

  const getPaymentStatusLabel = (status: string) => {
    const statusConfig = PAYMENT_STATUSES.find(s => s.value === status)
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

  const filteredOrders = orders.filter(order =>
    order.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.client?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  )

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h1>
            <p className="text-gray-600">Gérez toutes les commandes des clients</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Chiffre d'affaires total</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une commande..."
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
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Tous les paiements</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
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

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commande
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
                    Paiement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShoppingBagIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.client?.prenom} {order.client?.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {order.client?.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-emerald-600">
                        {formatCurrency(order.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.statut)}`}>
                        {getStatusLabel(order.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.statutPaiement)}`}>
                        {getPaymentStatusLabel(order.statutPaiement)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-emerald-600 hover:text-emerald-900"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowStatusModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier le statut"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowPaymentModal(true)
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="Modifier le paiement"
                        >
                          <CurrencyDollarIcon className="h-4 w-4" />
                        </button>
                        {order.statut !== 'ANNULEE' && order.statut !== 'LIVREE' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Annuler la commande"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
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
                    {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
                  </span>{' '}
                  sur <span className="font-medium">{filteredOrders.length}</span> commandes
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

        {/* Order Details Modal */}
        {showDetails && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Détails de la Commande #{selectedOrder.id}</h3>
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
                      <p className="font-medium">{selectedOrder.client?.prenom} {selectedOrder.client?.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(selectedOrder.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.statut)}`}>
                        {getStatusLabel(selectedOrder.statut)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Paiement</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.statutPaiement)}`}>
                        {getPaymentStatusLabel(selectedOrder.statutPaiement)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Articles commandés</p>
                    <div className="space-y-2">
                      {selectedOrder.details?.map((detail, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{detail.article.nom}</p>
                            <p className="text-sm text-gray-500">Quantité: {detail.quantite} × {formatCurrency(detail.prixUnitaire)}</p>
                          </div>
                          <p className="font-bold">{formatCurrency(detail.sousTotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold">Total</p>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedOrder.total)}</p>
                    </div>
                  </div>
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

        {/* Status Update Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Modifier le statut de la commande #{selectedOrder.id}
                </h3>
                
                <div className="space-y-3">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status.value)}
                      className={`w-full text-left px-3 py-2 rounded-md border ${
                        selectedOrder.statut === status.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${status.color}`}>
                        {status.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Update Modal */}
        {showPaymentModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Modifier le statut de paiement de la commande #{selectedOrder.id}
                </h3>
                
                <div className="space-y-3">
                  {PAYMENT_STATUSES.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleUpdatePaymentStatus(selectedOrder.id, status.value)}
                      className={`w-full text-left px-3 py-2 rounded-md border ${
                        selectedOrder.statutPaiement === status.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${status.color}`}>
                        {status.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
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
