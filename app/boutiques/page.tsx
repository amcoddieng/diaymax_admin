'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  BuildingStorefrontIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon
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
  }
}

export default function BoutiquesPage() {
  const router = useRouter()
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
      console.log(`🔄 Updating boutique ${boutiqueId} status to: ${newStatus}`)
      const response = await boutiqueService.updateBoutiqueStatus(boutiqueId, newStatus)
      console.log('✅ API Response - updateBoutiqueStatus:', response)
      fetchBoutiques()
    } catch (error) {
      console.error('❌ Error updating boutique status:', error)
      console.error('❌ Error details:', (error as any).response?.data || (error as any).message)
      console.error('❌ Status code:', (error as any).response?.status)
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
      const formData = new URLSearchParams()
      formData.append('nom', editForm.nom)
      formData.append('description', editForm.description)
      formData.append('addresse', editForm.addresse)
      
      const infoResponse = await boutiqueService.updateBoutiqueInfo(selectedBoutique.id, formData)
      console.log('API Response - updateBoutiqueInfo:', infoResponse)
      
      if (editForm.statut !== selectedBoutique.statut) {
        const statusResponse = await boutiqueService.updateBoutiqueStatus(selectedBoutique.id, editForm.statut)
        console.log('API Response - updateBoutiqueStatus:', statusResponse)
      }
      
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

  const filteredBoutiques = (Array.isArray(boutiques) ? boutiques : []).filter(boutique => {
    const matchesSearch = 
      boutique.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boutique.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boutique.addresse.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || boutique.statut === statusFilter
    
    return matchesSearch && matchesStatus
  })

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

  const getStatusStyle = (statut: string) => {
    const styles = {
      EN_ATTENTE: 'bg-amber-50 text-amber-700 border-amber-200',
      VALIDE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      REFUSE: 'bg-red-50 text-red-700 border-red-200',
      SUSPENDU: 'bg-orange-50 text-orange-700 border-orange-200'
    }
    return styles[statut as keyof typeof styles] || styles.EN_ATTENTE
  }

  const getStatusIcon = (statut: string) => {
    switch(statut) {
      case 'EN_ATTENTE': return <ClockIcon className="h-3 w-3 mr-1" />
      case 'VALIDE': return <CheckIcon className="h-3 w-3 mr-1" />
      case 'REFUSE': return <XMarkIcon className="h-3 w-3 mr-1" />
      default: return null
    }
  }

  return (
    <AdminLayout>
      <div className="p-2 space-y-2">
        {/* Header avec design moderne */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] p-4 text-white">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-base font-bold mb-1">Gestion des Boutiques</h1>
                <p className="text-emerald-100 text-xs">Gérez toutes les boutiques et leurs statuts</p>
              </div>
              <button className="flex items-center px-3 py-2 bg-[#ffc300] text-gray-900 rounded-lg font-semibold hover:bg-[#e5b000] transition-all transform hover:scale-105 shadow-lg">
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouvelle boutique
              </button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#ffc300] opacity-10 rounded-full -ml-24 -mb-24"></div>
        </div>

        {/* Search and Filters modernisés */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher une boutique..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent text-sm"
              />
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent text-sm bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDE">Validé</option>
              <option value="REFUSE">Refusé</option>
              <option value="SUSPENDU">Suspendu</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-3 py-1.5 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-lg hover:shadow-md transition-all text-sm"
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-2">
            <p className="text-emerald-600 text-xs font-medium">Total boutiques</p>
            <p className="text-lg font-bold text-emerald-900">{boutiques.length}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2">
            <p className="text-amber-600 text-xs font-medium">En attente</p>
            <p className="text-lg font-bold text-amber-900">{boutiques.filter(b => b.statut === 'EN_ATTENTE').length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-2">
            <p className="text-emerald-600 text-xs font-medium">Validées</p>
            <p className="text-lg font-bold text-emerald-900">{boutiques.filter(b => b.statut === 'VALIDE').length}</p>
          </div>
          <div className="bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] p-2 rounded-lg">
            <p className="text-[#d4a000] text-xs font-medium">Note moyenne</p>
            <p className="text-lg font-bold text-gray-900">
              {(boutiques.reduce((acc, b) => acc + b.note, 0) / boutiques.length || 0).toFixed(1)}
              <span className="text-xs ml-1">⭐</span>
            </p>
          </div>
        </div>

        {/* Boutiques Grid modernisé */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {paginatedBoutiques.map((boutique) => (
            <div key={boutique.id} className="group bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Image section avec overlay gradient */}
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {boutique.logo ? (
                  <>
                    <img
                      src={`http://10.153.54.247:8080${boutique.logo}`}
                      alt={boutique.nom}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <BuildingStorefrontIcon className="h-12 w-12 text-gray-300 mx-auto mb-1" />
                      <p className="text-gray-400 text-xs">Pas de logo</p>
                    </div>
                  </div>
                )}
                
                {/* Badge statut moderne */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-lg border backdrop-blur-sm ${getStatusStyle(boutique.statut)}`}>
                    {getStatusIcon(boutique.statut)}
                    {boutique.statut === 'EN_ATTENTE' && 'En attente'}
                    {boutique.statut === 'VALIDE' && 'Validé'}
                    {boutique.statut === 'REFUSE' && 'Refusé'}
                    {boutique.statut === 'SUSPENDU' && 'Suspendu'}
                  </span>
                </div>

                {/* Note badge */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                  <div className="flex items-center text-xs text-gray-600 mb-1">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    <span className="truncate">{boutique.addresse || 'Non spécifiée'}</span>
                  </div>
                </div>
              </div>
              
              {/* Content section */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{boutique.nom}</h3>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{boutique.description || 'Aucune description'}</p>
                
                {/* Adresse */}
                <div className="flex items-start mb-4">
                  <svg className="h-3 w-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-500 text-xs line-clamp-2">{boutique.addresse}</p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => router.push(`/boutiques/${boutique.id}`)}
                    className="w-full flex items-center justify-center px-2 py-1 text-xs bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-md hover:shadow-md transition-all"
                  >
                    <BuildingStorefrontIcon className="h-3 w-3 mr-1" />
                    Gérer la boutique
                  </button>
                </div>
                {/* Actions rapides statut */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex gap-1">
                    {boutique.statut === 'EN_ATTENTE' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(boutique.id, 'VALIDE')}
                          className="flex-1 text-xs px-1.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                        >
                          ✓ Valider
                        </button>
                        <button
                          onClick={() => handleStatusChange(boutique.id, 'REFUSE')}
                          className="flex-1 text-xs px-1.5 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                        >
                          ✗ Refuser
                        </button>
                      </>
                    )}
                    {boutique.statut === 'VALIDE' && (
                      <button
                        onClick={() => handleStatusChange(boutique.id, 'SUSPENDU')}
                        className="w-full text-xs px-1.5 py-1 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                      >
                        ⚠ Suspendre
                      </button>
                    )}
                    {boutique.statut === 'SUSPENDU' && (
                      <button
                        onClick={() => handleStatusChange(boutique.id, 'VALIDE')}
                        className="w-full text-xs px-1.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                      >
                        ⟳ Réactiver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination modernisée */}
        {totalPages > 1 && (
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <div className="text-xs text-gray-600">
              Page <span className="font-semibold text-gray-900">{currentPage}</span> sur{' '}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-3 w-3" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    currentPage === page
                      ? 'bg-[#0f7b6c] text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Détails modernisé */}
        {showDetails && selectedBoutique && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg max-w-xs w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Détails de la boutique</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-3 w-3 text-gray-500" />
                </button>
              </div>
              <div className="p-3 space-y-2">
                <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                  {selectedBoutique.logo ? (
                    <img
                      src={`http://10.153.54.247:8080${selectedBoutique.logo}`}
                      alt={selectedBoutique.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Nom</label>
                    <p className="text-gray-900 font-medium">{selectedBoutique.nom}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                    <p className="text-gray-700">{selectedBoutique.description}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Adresse</label>
                    <p className="text-gray-700">{selectedBoutique.addresse}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Statut</label>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg ${getStatusStyle(selectedBoutique.statut)}`}>
                        {getStatusIcon(selectedBoutique.statut)}
                        {selectedBoutique.statut}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Note</label>
                    <div className="flex items-center text-xs text-gray-600 mb-1">
                      <StarIconSolid className="h-4 w-4 text-[#ffc300] mr-1" />
                      <span className="font-medium">{selectedBoutique.note.toFixed(1)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Date de création</label>
                    <p className="text-gray-700">{formatDate(selectedBoutique.createdAt)}</p>
                  </div>
                  {selectedBoutique.vendeur && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Vendeur</label>
                      <p className="text-gray-700">{selectedBoutique.vendeur.email}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-3 py-2">
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-xs"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Édition modernisé */}
        {showEditModal && selectedBoutique && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg max-w-xs w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2">
                <h3 className="text-sm font-bold text-gray-900">Modifier la boutique</h3>
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={editForm.nom}
                    onChange={(e) => setEditForm({...editForm, nom: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={1}
                    className="w-full px-2 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={editForm.addresse}
                    onChange={(e) => setEditForm({...editForm, addresse: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent"
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
                    min="0"
                    max="5"
                    step="0.1"
                    value={editForm.note}
                    onChange={(e) => setEditForm({...editForm, note: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f7b6c] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedBoutique(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}