'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { userService } from '@/services'
import { formatDate, getStatusColor } from '@/lib/utils'
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface User {
  id: number
  nom: string
  prenom: string
  email?: string
  telephone?: string
  dateNaissance?: string
  adresse?: string
  photoProfil?: string
  ville?: string
  createdAt: string
  updatedAt: string
  compte?: {
    id: number
    email: string
    telephone?: string
    role: string
    statut: string
    isVerified: boolean
    lastLogin?: string
    createdAt: string
  }
}

interface Account {
  id: number
  personneId: number
  email: string
  telephone?: string
  role: string
  statut: string
  isVerified: boolean
  lastLogin?: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
  // Confirmation modals states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    dateNaissance: '',
    ville: '',
    email: '',
    telephone: '',
    role: 'CLIENT'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'activate' | 'deactivate' | 'verify'
    userId?: number
    accountId?: number
    action?: string
  } | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchAccounts()
  }, [])

  const fetchUsers = async () => {
    try {
      console.log('🔄 Fetching users...')
      const response = await userService.getPersons()
      console.log('📡 API Response - getPersons:', response)
      console.log('📊 Response status:', response?.status)
      console.log('📋 Response data:', response?.data)
      
      const userData = response?.data?.data || response?.data
      console.log('👥 Users Data type:', typeof userData)
      console.log('👥 Users Data is array:', Array.isArray(userData))
      console.log('👥 Users Data length:', userData?.length)
      console.log('👥 First user sample:', userData?.[0])
      
      if (userData && Array.isArray(userData)) {
        console.log('✅ Setting users with', userData.length, 'items')
        setUsers(userData)
      } else {
        console.log('⚠️ Invalid user data, setting empty array')
        setUsers([])
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      console.error('❌ Error details:', (error as any).response?.data || (error as any).message)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAccounts = async () => {
    try {
      console.log('🔄 Fetching accounts...')
      const response = await userService.getAccounts()
      console.log('📡 API Response - getAccounts:', response)
      console.log('📊 Response status:', response?.status)
      console.log('📋 Response data:', response?.data)
      
      const accountData = response?.data?.data || response?.data
      console.log('👥 Accounts Data type:', typeof accountData)
      console.log('👥 Accounts Data is array:', Array.isArray(accountData))
      console.log('👥 Accounts Data length:', accountData?.length)
      
      if (accountData && Array.isArray(accountData)) {
        console.log('✅ Setting accounts with', accountData.length, 'items')
        console.log('📊 Sample account:', accountData[0])
        setAccounts(accountData)
      } else {
        console.log('⚠️ Invalid account data, setting empty array')
        setAccounts([])
      }
    } catch (error) {
      console.error('❌ Error fetching accounts:', error)
      console.error('❌ Error details:', (error as any).response?.data || (error as any).message)
      setAccounts([])
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchUsers()
      return
    }

    try {
      const response = await userService.searchPersons(searchTerm)
      setUsers(response.data || [])
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  // Functions to show confirmation modals
  const handleAccountStatusChange = (accountId: number, action: 'activate' | 'deactivate') => {
    setConfirmAction({
      type: action,
      accountId,
      action: action === 'activate' ? 'activer' : 'désactiver'
    })
    setShowStatusConfirm(true)
  }

  const handleVerifyAccount = (accountId: number) => {
    setConfirmAction({
      type: 'verify',
      accountId
    })
    setShowVerifyConfirm(true)
  }

  const handleDeleteUser = (userId: number) => {
    setConfirmAction({
      type: 'delete',
      userId
    })
    setShowDeleteConfirm(true)
  }

  // Functions to execute confirmed actions
  const executeAccountStatusChange = async () => {
    if (!confirmAction?.accountId) return
    
    try {
      const accountId = confirmAction.accountId
      const action = confirmAction.type
      console.log(`🔄 ${action} du compte ID: ${accountId}`)
      
      // Vérifier le statut actuel du compte
      const currentAccount = accounts.find(acc => acc.id === accountId)
      const currentStatus = currentAccount?.statut
      
      console.log(`📊 Statut actuel: ${currentStatus}, Action demandée: ${action}`)
      console.log('📊 Tous les comptes disponibles:', accounts.map(acc => ({ id: acc.id, statut: acc.statut })))
      
      // Vérifier si l'action est nécessaire
      if (currentStatus === 'ACTIF' && action === 'activate') {
        console.log('⚠️ Le compte est déjà actif, annulation de l\'action')
        setShowStatusConfirm(false)
        setConfirmAction(null)
        alert('Ce compte est déjà actif')
        return
      }
      
      // Vérifier si le compte est déjà inactif (peut avoir différents statuts)
      const inactiveStatuses = ['INACTIF', 'DESACTIVE', 'SUSPENDU', 'BLOQUE']
      if (inactiveStatuses.includes(currentStatus || '') && action === 'deactivate') {
        console.log(`⚠️ Le compte est déjà inactif (${currentStatus}), annulation de l\'action`)
        setShowStatusConfirm(false)
        setConfirmAction(null)
        alert(`Ce compte est déjà inactif (${currentStatus})`)
        return
      }
      
      // Appel API avec logs détaillés
      console.log(`📡 Envoi de la requête ${action} au compte ${accountId}`)
      const response = await userService.updateAccountStatus(accountId, action as 'activate' | 'deactivate')
      console.log('📡 API Response:', response.status, response.data)
      
      // Attendre un peu pour que l'API traite la demande
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Rafraîchir les données pour mettre à jour le visuel
      console.log('🔄 Rafraîchissement des données...')
      await Promise.all([
        fetchUsers(),
        fetchAccounts()
      ])
      
      setShowStatusConfirm(false)
      setConfirmAction(null)
      console.log(`✅ Compte ${action} avec succès`)
    } catch (error) {
      console.error('❌ Error updating account status:', error)
      console.error('❌ Error details:', (error as any).response?.data || (error as any).message)
      
      // Afficher une alerte à l'utilisateur en cas d'erreur
      const errorMessage = (error as any).response?.data?.message || 'Erreur inconnue'
      alert(`Erreur lors du ${confirmAction?.action}: ${errorMessage}`)
    }
  }

  const executeVerifyAccount = async () => {
    if (!confirmAction?.accountId) return
    
    try {
      console.log(`🔄 Vérification du compte ID: ${confirmAction.accountId}`)
      await userService.verifyAccount(confirmAction.accountId)
      
      // Rafraîchir les données pour mettre à jour le visuel
      await Promise.all([
        fetchUsers(),
        fetchAccounts()
      ])
      
      setShowVerifyConfirm(false)
      setConfirmAction(null)
      console.log('✅ Compte vérifié avec succès')
    } catch (error) {
      console.error('❌ Error verifying account:', error)
    }
  }

  const executeDeleteUser = async () => {
    if (!confirmAction?.userId) return
    
    try {
      console.log(`🔄 Suppression de l'utilisateur ID: ${confirmAction.userId}`)
      
      // Pour l'instant, simuler la suppression en filtrant localement
      // TODO: Remplacer par l'API quand elle sera disponible
      // await userService.deletePerson(confirmAction.userId)
      
      // Simulation de la suppression pour le visuel
      setUsers(prevUsers => prevUsers.filter(user => user.id !== confirmAction.userId))
      setAccounts(prevAccounts => prevAccounts.filter(account => account.personneId !== confirmAction.userId))
      
      setShowDeleteConfirm(false)
      setConfirmAction(null)
      console.log('✅ Utilisateur supprimé avec succès (simulation)')
    } catch (error) {
      console.error('❌ Error deleting user:', error)
    }
  }

  // Initialize edit form when user is selected
  const initializeEditForm = (user: User) => {
    setEditForm({
      nom: user.nom || '',
      prenom: user.prenom || '',
      adresse: user.adresse || '',
      dateNaissance: user.dateNaissance || '',
      ville: user.ville || '',
      email: user.compte?.email || '',
      telephone: user.compte?.telephone || user.telephone || '',
      role: user.compte?.role || 'CLIENT'
    })
  }
  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Save user modifications
  const handleSaveUser = async () => {
    if (!selectedUser?.compte?.id) {
      alert('Erreur: Aucun compte sélectionné')
      return
    }

    setIsSaving(true)
    try {
      console.log('🔄 Sauvegarde des modifications utilisateur...')
      console.log('📊 Données du formulaire:', editForm)
      
      // Préparer les données pour l'API
      const updateData = {
        // Informations de la personne
        nom: editForm.nom,
        prenom: editForm.prenom,
        adresse: editForm.adresse,
        dateNaissance: editForm.dateNaissance || undefined,
        ville: editForm.ville,
        
        // Informations du compte
        email: editForm.email,
        telephone: editForm.telephone,
        role: editForm.role
      }

      console.log('📡 Envoi des données à l\'API:', updateData)
      
      // Appel API combinée
      const response = await userService.updateCompteAndPersonne(selectedUser.compte.id, updateData)
      console.log('📡 API Response:', response.status, response.data)
      
      // Rafraîchir les données
      await Promise.all([
        fetchUsers(),
        fetchAccounts()
      ])
      
      setShowEditModal(false)
      setIsSaving(false)
      console.log('✅ Utilisateur mis à jour avec succès')
      alert('Utilisateur mis à jour avec succès!')
    } catch (error) {
      console.error('❌ Error saving user:', error)
      console.error('❌ Error details:', (error as any).response?.data || (error as any).message)
      setIsSaving(false)
      
      const errorMessage = (error as any).response?.data?.message || 'Erreur inconnue'
      alert(`Erreur lors de la sauvegarde: ${errorMessage}`)
    }
  }


  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    // Search filter
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.compte?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    // Role filter
    const matchesRole = roleFilter === '' || user.compte?.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-600">Gérez tous les utilisateurs et leurs comptes</p>
          </div>
          <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 flex items-center">
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Ajouter un utilisateur
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
              >
                Rechercher
              </button>
            </div>
            
            {/* Role Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filtrer par rôle:</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setRoleFilter('')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    roleFilter === '' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setRoleFilter('CLIENT')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    roleFilter === 'CLIENT' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Clients
                </button>
                <button
                  onClick={() => setRoleFilter('ADMIN')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    roleFilter === 'ADMIN' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Admins
                </button>
                <button
                  onClick={() => setRoleFilter('MODERATEUR')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    roleFilter === 'MODERATEUR' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Modérateurs
                </button>
                <button
                  onClick={() => setRoleFilter('VENDEUR')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    roleFilter === 'VENDEUR' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Vendeurs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.photoProfil ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`https://98c3-102-164-160-251.ngrok-free.app${user.photoProfil}`}
                              alt={`${user.prenom} ${user.nom}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.prenom.charAt(0)}{user.nom.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.prenom} {user.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.dateNaissance && formatDate(user.dateNaissance)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.compte?.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{user.compte?.telephone || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{user.adresse || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.compte?.role || 'Aucun compte'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.compte?.isVerified ? 'Vérifié' : 'Non vérifié'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.compte && (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.compte.statut)}`}>
                          {user.compte.statut}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowDetails(true)
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => {
                            initializeEditForm(user)
                            setSelectedUser(user)
                            setShowEditModal(true)
                          }}
                          className="text-secondary-600 hover:text-secondary-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        {user.compte && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer l'utilisateur"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                            {user.compte.statut === 'ACTIF' ? (
                              <button
                                onClick={() => handleAccountStatusChange(user.compte!.id, 'deactivate')}
                                className="text-warning-600 hover:text-warning-900"
                                title="Désactiver"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAccountStatusChange(user.compte!.id, 'activate')}
                                className="text-success-600 hover:text-success-900"
                                title="Activer"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            {!user.compte.isVerified && (
                              <button
                                onClick={() => handleVerifyAccount(user.compte!.id)}
                                className="text-info-600 hover:text-info-900"
                                title="Vérifier"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> sur{' '}
                    <span className="font-medium">{filteredUsers.length}</span> résultats
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
        </div>

        {/* User Details Modal */}
        {showDetails && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4 pt-8">
            <div className="relative bg-[#f8f9fa] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto border border-[#0f7b6c]/20">
              {/* Header avec image de profil */}
              <div className="relative bg-gradient-to-r from-[#0f7b6c] to-[#0f7b6c]/90 px-6 pt-6 pb-12">
                <button
                  onClick={() => setShowDetails(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                      {selectedUser.photoProfil ? (
                        <img 
                          src={selectedUser.photoProfil} 
                          alt={`${selectedUser.prenom} ${selectedUser.nom}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-10 w-10 text-[#ffc300]" />
                      )}
                    </div>
                    {selectedUser.compte?.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-[#ffc300] rounded-full p-1">
                        <ShieldCheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="mt-4 text-xl font-bold text-white">
                    {selectedUser.prenom} {selectedUser.nom}
                  </h3>
                  
                  {selectedUser.compte?.role && (
                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      selectedUser.compte.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      selectedUser.compte.role === 'MODERATEUR' ? 'bg-blue-100 text-blue-800' :
                      selectedUser.compte.role === 'VENDEUR' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.compte.role}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Body avec informations */}
              <div className="px-6 py-6 -mt-6">
                <div className="bg-white rounded-xl shadow-sm border border-[#0f7b6c]/10 p-6">
                  {/* Contact Information - Grid Layout */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#0f7b6c]/10 rounded-lg flex items-center justify-center">
                        <EnvelopeIcon className="h-5 w-5 text-[#0f7b6c]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.compte?.email || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#0f7b6c]/10 rounded-lg flex items-center justify-center">
                        <PhoneIcon className="h-5 w-5 text-[#0f7b6c]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.compte?.telephone || selectedUser.telephone || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#0f7b6c]/10 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="h-5 w-5 text-[#0f7b6c]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Adresse</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.adresse || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#0f7b6c]/10 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-[#0f7b6c]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Date de naissance</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedUser.dateNaissance ? formatDate(selectedUser.dateNaissance) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Account Information - Grid Layout */}
                  <div className="border-t border-[#0f7b6c]/10 pt-6 mt-6 grid grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#0f7b6c]/10 rounded-lg flex items-center justify-center">
                        <ClockIcon className="h-5 w-5 text-[#0f7b6c]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Date d'inscription</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                    </div>
                    
                    {selectedUser.compte?.lastLogin && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-[#0f7b6c]/10 rounded-lg flex items-center justify-center">
                          <ClockIcon className="h-5 w-5 text-[#0f7b6c]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Dernière connexion</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(selectedUser.compte.lastLogin)}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#0f7b6c]/10 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="h-5 w-5 text-[#0f7b6c]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Ville</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.ville || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {selectedUser.compte?.statut && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-[#0f7b6c]/10 rounded-lg flex items-center justify-center">
                          <ShieldCheckIcon className="h-5 w-5 text-[#0f7b6c]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Statut du compte</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedUser.compte.statut)}`}>
                            {selectedUser.compte.statut}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Actions - Footer fixe */}
              <div className="sticky bottom-0 bg-[#f8f9fa] border-t border-[#0f7b6c]/10 px-6 pb-6 pt-4 space-y-3 mt-4">
                {/* Primary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      initializeEditForm(selectedUser!)
                      setShowEditModal(true)
                    }}
                    className="px-4 py-2 bg-[#0f7b6c] text-white rounded-lg hover:bg-[#0f7b6c]/90 transition-colors font-medium flex items-center justify-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      if (selectedUser?.compte) {
                        handleDeleteUser(selectedUser.id)
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Supprimer
                  </button>
                </div>
                
                {/* Secondary Actions */}
                {selectedUser?.compte && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setShowDetails(false)
                        if (selectedUser.compte?.statut === 'ACTIF') {
                          setConfirmAction({ type: 'deactivate', accountId: selectedUser.compte.id, action: 'désactiver' })
                          setShowStatusConfirm(true)
                        } else {
                          setConfirmAction({ type: 'activate', accountId: selectedUser.compte?.id, action: 'activer' })
                          setShowStatusConfirm(true)
                        }
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center ${
                        selectedUser.compte.statut === 'ACTIF' 
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {selectedUser.compte.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDetails(false)
                        if (selectedUser?.compte && !selectedUser.compte.isVerified) {
                          setConfirmAction({ type: 'verify', accountId: selectedUser.compte.id, action: 'vérifier' })
                          setShowVerifyConfirm(true)
                        }
                      }}
                      disabled={selectedUser?.compte?.isVerified}
                      className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center ${
                        selectedUser.compte.isVerified
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#ffc300] text-white hover:bg-[#ffc300]/90'
                      }`}
                    >
                      <ShieldCheckIcon className="h-4 w-4 mr-2" />
                      {selectedUser.compte.isVerified ? 'Déjà vérifié' : 'Vérifier'}
                    </button>
                  </div>
                )}
                
                {/* Close Button */}
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal with transparent background */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Confirmer la suppression</h3>
              <p className="text-center text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setConfirmAction(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={executeDeleteUser}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Confirmation Modal with transparent background */}
        {showStatusConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
                <PencilIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Confirmer le changement de statut</h3>
              <p className="text-center text-gray-600 mb-6">
                Êtes-vous sûr de vouloir {confirmAction?.action} ce compte ?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowStatusConfirm(false)
                    setConfirmAction(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={executeAccountStatusChange}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verify Account Confirmation Modal with transparent background */}
        {showVerifyConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Confirmer la vérification</h3>
              <p className="text-center text-gray-600 mb-6">
                Êtes-vous sûr de vouloir vérifier ce compte ? Cette action marquera le compte comme vérifié.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowVerifyConfirm(false)
                    setConfirmAction(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={executeVerifyAccount}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Vérifier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal with transparent background */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 pt-6 pb-8">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                    <PencilIcon className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Modifier l'utilisateur</h3>
                  <p className="text-emerald-100 mt-1">
                    {selectedUser.prenom} {selectedUser.nom}
                  </p>
                </div>
              </div>
              
              {/* Body */}
              <div className="px-6 py-6 -mt-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <form className="space-y-6">
                    {/* Informations Personnelles */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Informations Personnelles</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                          <input
                            type="text"
                            value={editForm.prenom}
                            onChange={(e) => handleEditFormChange('prenom', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                          <input
                            type="text"
                            value={editForm.nom}
                            onChange={(e) => handleEditFormChange('nom', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        <input
                          type="text"
                          value={editForm.adresse}
                          onChange={(e) => handleEditFormChange('adresse', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Adresse complète"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                        <input
                          type="date"
                          value={editForm.dateNaissance}
                          onChange={(e) => handleEditFormChange('dateNaissance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                        <input
                          type="text"
                          value={editForm.ville}
                          onChange={(e) => handleEditFormChange('ville', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Ville"
                        />
                      </div>
                    </div>
                    
                    {/* Informations du Compte */}
                    {selectedUser.compte && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Informations du Compte</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => handleEditFormChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                          <input
                            type="tel"
                            value={editForm.telephone}
                            onChange={(e) => handleEditFormChange('telephone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="+221 XXXXXXXX"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                          <select
                            value={editForm.role}
                            onChange={(e) => handleEditFormChange('role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="CLIENT">Client</option>
                            <option value="VENDEUR">Vendeur</option>
                            <option value="MODERATEUR">Modérateur</option>
                            <option value="ADMIN">Administrateur</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 pb-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveUser}
                    disabled={isSaving}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                      isSaving
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
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