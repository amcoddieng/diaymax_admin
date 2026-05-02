'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { categoryService, subCategoryService } from '@/services'
import { formatDate } from '@/lib/utils'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface Category {
  id: number
  nom: string
  description: string
  createdAt: string
  sousCategories?: SubCategory[]
}

interface SubCategory {
  id: number
  categorieId: number
  nom: string
  description: string
  createdAt: string
  categorieNom?: string
  categorieDescription?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  const [categoryForm, setCategoryForm] = useState({
    nom: '',
    description: ''
  })

  const [subCategoryForm, setSubCategoryForm] = useState({
    categorieId: 0,
    nom: '',
    description: ''
  })

  useEffect(() => {
    fetchCategories()
    fetchSubCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategoriesWithSubCategories()
      console.log('📡 Categories Page - API Response - getCategoriesWithSubCategories:', response)
      const categoryData = response?.data?.data || response?.data
      console.log('📂 Categories Page - Categories Data:', categoryData)
      setCategories(Array.isArray(categoryData) ? categoryData : [])
    } catch (error) {
      console.error('❌ Categories Page - Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSubCategories = async () => {
    try {
      const response = await subCategoryService.getSubCategoriesWithCategory()
      console.log('📡 Categories Page - API Response - getSubCategoriesWithCategory:', response)
      const subCategoryData = response?.data?.data || response?.data
      console.log('📋 Categories Page - SubCategories Data:', subCategoryData)
      setSubCategories(Array.isArray(subCategoryData) ? subCategoryData : [])
    } catch (error) {
      console.error('❌ Categories Page - Error fetching subcategories:', error)
      setSubCategories([])
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCategories()
      return
    }

    try {
      const response = await categoryService.searchCategories(searchTerm)
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error searching categories:', error)
    }
  }

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCreateCategory = async () => {
    try {
      await categoryService.createCategory(categoryForm)
      fetchCategories()
      setShowCategoryModal(false)
      setCategoryForm({ nom: '', description: '' })
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    try {
      await categoryService.updateCategory(editingCategory.id, categoryForm)
      fetchCategories()
      setShowCategoryModal(false)
      setEditingCategory(null)
      setCategoryForm({ nom: '', description: '' })
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return

    try {
      await categoryService.deleteCategory(categoryId)
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleCreateSubCategory = async () => {
    try {
      await subCategoryService.createSubCategory(subCategoryForm)
      fetchSubCategories()
      fetchCategories()
      setShowSubCategoryModal(false)
      setSubCategoryForm({ categorieId: 0, nom: '', description: '' })
    } catch (error) {
      console.error('Error creating subcategory:', error)
    }
  }

  const handleUpdateSubCategory = async () => {
    if (!editingSubCategory) return

    try {
      await subCategoryService.updateSubCategory(editingSubCategory.id, subCategoryForm)
      fetchSubCategories()
      fetchCategories()
      setShowSubCategoryModal(false)
      setEditingSubCategory(null)
      setSubCategoryForm({ categorieId: 0, nom: '', description: '' })
    } catch (error) {
      console.error('Error updating subcategory:', error)
    }
  }

  const handleDeleteSubCategory = async (subCategoryId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?')) return

    try {
      await subCategoryService.deleteSubCategory(subCategoryId)
      fetchSubCategories()
      fetchCategories()
    } catch (error) {
      console.error('Error deleting subcategory:', error)
    }
  }

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        nom: category.nom,
        description: category.description
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({ nom: '', description: '' })
    }
    setShowCategoryModal(true)
  }

  const openSubCategoryModal = (subCategory?: SubCategory, categoryId?: number) => {
    if (subCategory) {
      setEditingSubCategory(subCategory)
      setSubCategoryForm({
        categorieId: subCategory.categorieId,
        nom: subCategory.nom,
        description: subCategory.description
      })
    } else {
      setEditingSubCategory(null)
      setSubCategoryForm({
        categorieId: categoryId || 0,
        nom: '',
        description: ''
      })
    }
    setShowSubCategoryModal(true)
  }

  const filteredCategories = categories.filter(category =>
    category.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Catégories</h1>
            <p className="text-gray-600">Gérez les catégories et sous-catégories de produits</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => openSubCategoryModal()}
              className="flex items-center px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Sous-catégorie
            </button>
            <button
              onClick={() => openCategoryModal()}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Catégorie
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
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

        {/* Categories List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border-b border-gray-200 last:border-b-0">
                {/* Category Header */}
                <div className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <button
                        onClick={() => toggleCategoryExpansion(category.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      <div className="flex items-center space-x-2">
                        <TagIcon className="h-5 w-5 text-emerald-500" />
                        <h3 className="text-lg font-medium text-gray-900">{category.nom}</h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {category.sousCategories?.length || 0} sous-catégorie(s)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openSubCategoryModal(undefined, category.id)}
                        className="p-2 text-secondary-600 hover:text-secondary-900"
                        title="Ajouter une sous-catégorie"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openCategoryModal(category)}
                        className="p-2 text-emerald-600 hover:text-emerald-900"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 ml-8">{category.description}</p>
                  <p className="mt-1 text-xs text-gray-500 ml-8">
                    Créée le {formatDate(category.createdAt)}
                  </p>
                </div>

                {/* Subcategories */}
                {expandedCategories.has(category.id) && category.sousCategories && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {category.sousCategories.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {category.sousCategories.map((subCategory) => (
                          <div key={subCategory.id} className="p-3 pl-12 hover:bg-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <TagIcon className="h-4 w-4 text-secondary-500" />
                                  <h4 className="text-sm font-medium text-gray-900">{subCategory.nom}</h4>
                                </div>
                                <p className="mt-1 text-xs text-gray-600 ml-6">{subCategory.description}</p>
                                <p className="mt-1 text-xs text-gray-500 ml-6">
                                  Créée le {formatDate(subCategory.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => openSubCategoryModal(subCategory)}
                                  className="p-1 text-emerald-600 hover:text-emerald-900"
                                  title="Modifier"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubCategory(subCategory.id)}
                                  className="p-1 text-red-600 hover:text-red-900"
                                  title="Supprimer"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Aucune sous-catégorie pour cette catégorie
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune catégorie trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Essayez une autre recherche' : 'Commencez par ajouter une catégorie'}
              </p>
            </div>
          )}
        </div>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={categoryForm.nom}
                      onChange={(e) => setCategoryForm({...categoryForm, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCategoryModal(false)
                      setEditingCategory(null)
                      setCategoryForm({ nom: '', description: '' })
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    {editingCategory ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SubCategory Modal */}
        {showSubCategoryModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingSubCategory ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <select
                      value={subCategoryForm.categorieId}
                      onChange={(e) => setSubCategoryForm({...subCategoryForm, categorieId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                      disabled={!!editingSubCategory}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={subCategoryForm.nom}
                      onChange={(e) => setSubCategoryForm({...subCategoryForm, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={subCategoryForm.description}
                      onChange={(e) => setSubCategoryForm({...subCategoryForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowSubCategoryModal(false)
                      setEditingSubCategory(null)
                      setSubCategoryForm({ categorieId: 0, nom: '', description: '' })
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={editingSubCategory ? handleUpdateSubCategory : handleCreateSubCategory}
                    className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700"
                  >
                    {editingSubCategory ? 'Mettre à jour' : 'Créer'}
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
