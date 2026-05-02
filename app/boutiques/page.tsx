'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { boutiqueService } from '@/services'
import { formatDate, getStatusColor } from '@/lib/utils'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  BuildingStorefrontIcon
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
  }
}

export default function BoutiquesPage() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBoutique, setSelectedBoutique] = useState<Boutique | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    nom: '',
    description: '',
    addresse: '',
    statut: '',
    note: 0
  })

  useEffect(() => {
    fetchBoutiques()
  }, [])

  const fetchBoutiques = async () => {
    try {
      const response = await boutiqueService.getBoutiques()
      console.log('📡 API Response - getBoutiques:', response)
      console.log('📊 Response data:', response?.data)
      const boutiqueData = response?.data?.data || response?.data
      console.log('🏪 Boutiques Data type:', typeof boutiqueData)
      console.log('🏪 Boutiques Data is array:', Array.isArray(boutiqueData))
      console.log('🏪 Boutiques Data length:', boutiqueData?.length)
      console.log('🏪 First boutique sample:', boutiqueData?.[0])
      setBoutiques(Array.isArray(boutiqueData) ? boutiqueData : [])
    } catch (error) {
      console.error('❌ Error fetching boutiques:', error)
      console.error('❌ Error details:', (error as any).response?.data || (error as any).message)
      setBoutiques([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim() && !statusFilter) {
      fetchBoutiques()
      return
    }

    try {
      let response
      if (statusFilter) {
        response = await boutiqueService.getBoutiquesByStatus(statusFilter)
        console.log('📡 API Response - getBoutiquesByStatus:', response)
      } else if (searchTerm) {
        response = await boutiqueService.searchBoutiques(searchTerm)
        console.log('📡 API Response - searchBoutiques:', response)
      } else {
        response = await boutiqueService.getBoutiques()
        console.log('📡 API Response - getBoutiques:', response)
      }
      console.log('🔍 Search Results Data:', response.data)
      const searchResults = response?.data?.data || response?.data
      console.log('🔍 Search Results type:', typeof searchResults)
      console.log('🔍 Search Results is array:', Array.isArray(searchResults))
      console.log('🔍 Search Results length:', searchResults?.length)
      setBoutiques(Array.isArray(searchResults) ? searchResults : [])
    } catch (error) {
      console.error('❌ Error searching boutiques:', error)
      console.error('❌ Error details:', (error as any).response?.data || (error as any).message)
    }
  }

  const handleStatusChange = async (boutiqueId: number, newStatus: string) => {
    try {
      const response = await boutiqueService.updateBoutiqueStatus(boutiqueId, newStatus)
      console.log('API Response - updateBoutiqueStatus:', response)
      fetchBoutiques()
    } catch (error) {
      console.error('Error updating boutique status:', error)
    }
  }

  const handleNoteChange = async (boutiqueId: number, newNote: number) => {
    try {
      const response = await boutiqueService.updateBoutiqueNote(boutiqueId, newNote)
      console.log('API Response - updateBoutiqueNote:', response)
      fetchBoutiques()
    } catch (error) {
      console.error('Error updating boutique note:', error)
    }
  }

  const handleEdit = (boutique: Boutique) => {
    setSelectedBoutique(boutique)
    setEditForm({
      nom: boutique.nom,
      description: boutique.description,
      addresse: boutique.addresse,
      statut: boutique.statut,
      note: boutique.note
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedBoutique) return

    try {
      // Update basic info
      const formData = new URLSearchParams()
      formData.append('nom', editForm.nom)
      formData.append('description', editForm.description)
      formData.append('addresse', editForm.addresse)
      
      const infoResponse = await boutiqueService.updateBoutiqueInfo(selectedBoutique.id, formData)
      console.log('API Response - updateBoutiqueInfo:', infoResponse)
      
      // Update status if changed
      if (editForm.statut !== selectedBoutique.statut) {
        const statusResponse = await boutiqueService.updateBoutiqueStatus(selectedBoutique.id, editForm.statut)
        console.log('API Response - updateBoutiqueStatus:', statusResponse)
      }
      
      // Update note if changed
      if (editForm.note !== selectedBoutique.note) {
        const noteResponse = await boutiqueService.updateBoutiqueNote(selectedBoutique.id, editForm.note)
        console.log('API Response - updateBoutiqueNote:', noteResponse)
      }
      
      fetchBoutiques()
      setShowEditModal(false)
      setSelectedBoutique(null)
    } catch (error) {
      console.error('Error updating boutique:', error)
    }
  }

  const filteredBoutiques = (Array.isArray(boutiques) ? boutiques : []).filter(boutique =>
    boutique.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boutique.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boutique.addresse.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredBoutiques.length / itemsPerPage)
  const paginatedBoutiques = filteredBoutiques.slice(
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Boutiques</h1>
            <p className="text-gray-600">Gérez toutes les boutiques et leurs statuts</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter une boutique
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher par nom, description ou adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDE">Validé</option>
              <option value="REFUSE">Refusé</option>
              <option value="SUSPENDU">Suspendu</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Boutiques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBoutiques.map((boutique) => (
            <div key={boutique.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                {boutique.logo ? (
                  <img
                    src={`http://192.168.1.8:8080${boutique.logo}`}
                    alt={boutique.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(boutique.statut)}`}>
                    {boutique.statut}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{boutique.nom}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{boutique.description}</p>
                <p className="text-sm text-gray-500 mb-3">
                  <svg className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {boutique.addresse}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">{boutique.note.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(boutique.createdAt)}
                  </span>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBoutique(boutique)
                        setShowDetails(true)
                      }}
                      className="flex-1 flex items-center justify-center px-2 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Voir
                    </button>
                    <button
                      onClick={() => handleEdit(boutique)}
                      className="flex-1 flex items-center justify-center px-2 py-1 text-sm bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Modifier
                    </button>
                  </div>
                  <button
                    onClick={() => window.location.href = `/boutiques/${boutique.id}`}
                    className="w-full flex items-center justify-center px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
                    Gérer la boutique
                  </button>
                </div>
                
                {/* Quick Status Actions */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex space-x-1">
                    {boutique.statut === 'EN_ATTENTE' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(boutique.id, 'VALIDE')}
                          className="flex-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => handleStatusChange(boutique.id, 'REFUSE')}
                          className="flex-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    {boutique.statut === 'VALIDE' && (
                      <button
                        onClick={() => handleStatusChange(boutique.id, 'SUSPENDU')}
                        className="flex-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                      >
                        Suspendre
                      </button>
                    )}
                    {boutique.statut === 'SUSPENDU' && (
                      <button
                        onClick={() => handleStatusChange(boutique.id, 'VALIDE')}
                        className="flex-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Réactiver
                      </button>
                    )}
                  </div>
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
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredBoutiques.length)}</span> sur{' '}
                  <span className="font-medium">{filteredBoutiques.length}</span> boutiques
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

        {/* Boutique Details Modal */}
        {showDetails && selectedBoutique && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de la boutique</h3>
                <div className="space-y-3">
                  <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    {selectedBoutique.logo ? (
                      <img
                        src={`http://192.168.1.8:8080${selectedBoutique.logo}`}
                        alt={selectedBoutique.nom}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Nom:</span> {selectedBoutique.nom}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span> {selectedBoutique.description}
                  </div>
                  <div>
                    <span className="font-medium">Adresse:</span> {selectedBoutique.addresse}
                  </div>
                  <div>
                    <span className="font-medium">Statut:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBoutique.statut)}`}>
                      {selectedBoutique.statut}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Note:</span> 
                    <div className="flex items-center mt-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1">{selectedBoutique.note.toFixed(1)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Création:</span> {formatDate(selectedBoutique.createdAt)}
                  </div>
                  {selectedBoutique.vendeur && (
                    <div>
                      <span className="font-medium">Vendeur:</span> {selectedBoutique.vendeur.email}
                    </div>
                  )}
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

        {/* Edit Modal */}
        {showEditModal && selectedBoutique && (
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={editForm.addresse}
                      onChange={(e) => setEditForm({...editForm, addresse: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={editForm.statut}
                      onChange={(e) => setEditForm({...editForm, statut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
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
                      min="0"
                      max="5"
                      step="0.1"
                      value={editForm.note}
                      onChange={(e) => setEditForm({...editForm, note: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedBoutique(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Enregistrer
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
