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
  ChevronRightIcon
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
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetails, setShowDetails] = useState(false)

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
      const response = await userService.getAccounts()
      console.log('API Response - getAccounts:', response)
      const accountData = response?.data
      console.log('Accounts Data:', accountData)
      setAccounts(Array.isArray(accountData) ? accountData : [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
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

  const handleAccountStatusChange = async (accountId: number, action: 'activate' | 'deactivate') => {
    try {
      await userService.updateAccountStatus(accountId, action)
      fetchAccounts()
    } catch (error) {
      console.error('Error updating account status:', error)
    }
  }

  const handleVerifyAccount = async (accountId: number) => {
    try {
      await userService.verifyAccount(accountId)
      fetchAccounts()
    } catch (error) {
      console.error('Error verifying account:', error)
    }
  }


  const filteredUsers = (Array.isArray(users) ? users : []).filter(user =>
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.compte?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  )

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

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow">
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
                                src={`http://192.168.1.8:8080${user.photoProfil}`}
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
                          <button className="text-secondary-600 hover:text-secondary-900">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          {user.compte && (
                            <div className="flex space-x-1">
                              {user.compte.statut === 'ACTIF' ? (
                                <button
                                  onClick={() => handleAccountStatusChange(user.compte!.id, 'deactivate')}
                                  className="text-warning-600 hover:text-warning-900"
                                  title="Désactiver"
                                >
                                  <TrashIcon className="h-5 w-5" />
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de l'utilisateur</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Nom complet:</span> {selectedUser.prenom} {selectedUser.nom}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedUser.compte?.email || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Téléphone:</span> {selectedUser.compte?.telephone || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Adresse:</span> {selectedUser.adresse || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Date de naissance:</span> {selectedUser.dateNaissance ? formatDate(selectedUser.dateNaissance) : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Inscription:</span> {formatDate(selectedUser.createdAt)}
                  </div>
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
      </div>
    </AdminLayout>
  )
}
