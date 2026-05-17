'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { documentAPI, userAPI } from '@/lib/api'
import { formatDate, formatFileSize, getStatusColor } from '@/lib/utils'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

interface Document {
  id: number
  personneId: number
  type: 'CARTE_IDENTITE' | 'NINEA' | 'PASSPORT' | 'RCCM'
  url: string
  validated: boolean
  createdAt: string
  personne?: {
    id: number
    nom: string
    prenom: string
    email: string
  }
}

interface User {
  id: number
  nom: string
  prenom: string
  email: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const [uploadForm, setUploadForm] = useState({
    personneId: 0,
    type: 'CARTE_IDENTITE' as const,
    file: null as File | null
  })

  const documentTypes = [
    { value: 'CARTE_IDENTITE', label: 'Carte d\'identité' },
    { value: 'NINEA', label: 'NINEA' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'RCCM', label: 'RCCM' }
  ]

  useEffect(() => {
    fetchDocuments()
    fetchUsers()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await documentAPI.getDocuments()
      console.log('📡 Documents Page - API Response - getDocuments:', response)
      const documentData = response?.data?.data || response?.data
      console.log('📄 Documents Page - Documents Data:', documentData)
      setDocuments(Array.isArray(documentData) ? documentData : [])
    } catch (error) {
      console.error('❌ Documents Page - Error fetching documents:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getPersons()
      console.log('📡 Documents Page - API Response - getPersons:', response)
      const userData = response?.data?.data || response?.data
      console.log('👥 Documents Page - Users Data:', userData)
      setUsers(Array.isArray(userData) ? userData : [])
    } catch (error) {
      console.error('❌ Documents Page - Error fetching users:', error)
      setUsers([])
    }
  }

  const handleSearch = async () => {
    try {
      let response
      
      if (userFilter) {
        response = await documentAPI.getDocumentsByPerson(parseInt(userFilter))
        console.log('📡 Documents Page - API Response - getDocumentsByPerson:', response)
      } else {
        response = await documentAPI.getDocuments()
        console.log('📡 Documents Page - API Response - getDocuments (search):', response)
      }
      
      let filteredDocs = response?.data?.data || response?.data || []
      console.log('🔍 Documents Page - Search Results Data:', filteredDocs)
      
      if (typeFilter) {
        filteredDocs = filteredDocs.filter((doc: Document) => doc.type === typeFilter)
      }
      
      if (statusFilter === 'validated') {
        filteredDocs = filteredDocs.filter((doc: Document) => doc.validated)
      } else if (statusFilter === 'pending') {
        filteredDocs = filteredDocs.filter((doc: Document) => !doc.validated)
      }
      
      if (searchTerm) {
        filteredDocs = filteredDocs.filter((doc: Document) =>
          doc.personne?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.personne?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.personne?.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setDocuments(Array.isArray(filteredDocs) ? filteredDocs : [])
    } catch (error) {
      console.error('Error searching documents:', error)
    }
  }

  const handleValidateDocument = async (documentId: number) => {
    try {
      const response = await documentAPI.validateDocument(documentId)
      console.log('API Response - validateDocument:', response)
      fetchDocuments()
    } catch (error) {
      console.error('Error validating document:', error)
    }
  }

  const handleUploadDocument = async () => {
    if (!uploadForm.file || !uploadForm.personneId) {
      alert('Veuillez sélectionner un utilisateur et un fichier')
      return
    }

    try {
      const formData = new FormData()
      formData.append('personneId', uploadForm.personneId.toString())
      formData.append('type', uploadForm.type)
      formData.append('file', uploadForm.file)

      await documentAPI.createDocument(formData)
      fetchDocuments()
      setShowUploadModal(false)
      setUploadForm({
        personneId: 0,
        type: 'CARTE_IDENTITE',
        file: null
      })
    } catch (error) {
      console.error('Error uploading document:', error)
    }
  }

  const handlePreview = (document: Document) => {
    setSelectedDocument(document)
    setShowPreview(true)
  }

  const filteredDocuments = documents.filter(doc =>
    doc.personne?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.personne?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.personne?.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 12
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)
  const paginatedDocuments = filteredDocuments.slice(
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Documents</h1>
            <p className="text-gray-600">Gérez les documents des utilisateurs</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            Télécharger un document
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Tous les utilisateurs</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.prenom} {user.nom}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Tous les types</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Tous les statuts</option>
              <option value="validated">Validés</option>
              <option value="pending">En attente</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedDocuments.map((document) => (
            <div key={document.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-100 relative">
                {document.url ? (
                  <img
                    src={`https://c3c9-102-164-160-251.ngrok-free.app${document.url}`}
                    alt={`Document ${document.type}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <DocumentIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    document.validated 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {document.validated ? 'Validé' : 'En attente'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {documentTypes.find(t => t.value === document.type)?.label}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {document.personne?.prenom} {document.personne?.nom}
                  </p>
                  <p className="text-xs text-gray-500">
                    {document.personne?.email}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePreview(document)}
                    className="flex-1 flex items-center justify-center px-2 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Voir
                  </button>
                  {!document.validated && (
                    <button
                      onClick={() => handleValidateDocument(document.id)}
                      className="flex-1 flex items-center justify-center px-2 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Valider
                    </button>
                  )}
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
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredDocuments.length)}</span> sur{' '}
                  <span className="font-medium">{filteredDocuments.length}</span> documents
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

        {/* Document Preview Modal */}
        {showPreview && selectedDocument && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {documentTypes.find(t => t.value === selectedDocument.type)?.label}
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Utilisateur:</span> {selectedDocument.personne?.prenom} {selectedDocument.personne?.nom}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedDocument.personne?.email}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {documentTypes.find(t => t.value === selectedDocument.type)?.label}
                  </div>
                  <div>
                    <span className="font-medium">Statut:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedDocument.validated 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedDocument.validated ? 'Validé' : 'En attente'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Date d'ajout:</span> {formatDate(selectedDocument.createdAt)}
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  {selectedDocument.url ? (
                    <img
                      src={`http://https://c3c9-102-164-160-251.ngrok-free.app${selectedDocument.url}`}
                      alt={`Document ${selectedDocument.type}`}
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                      <DocumentIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                {!selectedDocument.validated && (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        handleValidateDocument(selectedDocument.id)
                        setShowPreview(false)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2 inline" />
                      Valider le document
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Télécharger un document</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
                    <select
                      value={uploadForm.personneId}
                      onChange={(e) => setUploadForm({...uploadForm, personneId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Sélectionner un utilisateur</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.prenom} {user.nom} - {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
                    <select
                      value={uploadForm.type}
                      onChange={(e) => setUploadForm({...uploadForm, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      {documentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                    {uploadForm.file && (
                      <p className="mt-1 text-sm text-gray-500">
                        {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setUploadForm({
                        personneId: 0,
                        type: 'CARTE_IDENTITE',
                        file: null
                      })
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUploadDocument}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Télécharger
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
