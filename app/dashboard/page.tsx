'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { userService, boutiqueService, categoryService, productService } from '@/services'
import {
  UsersIcon,
  BuildingStorefrontIcon,
  TagIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface Stats {
  users: number
  boutiques: number
  categories: number
  products: number
  revenue: number
  growth: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    boutiques: 0,
    categories: 0,
    products: 0,
    revenue: 0,
    growth: 0
  })
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchStats()
    }
  }, [mounted])

  const fetchStats = async () => {
    try {
      console.log('🔄 Dashboard Page - Fetching stats...')
      
      // Use getPersons() to count users instead of countPersons()
      const [personsRes, boutiquesRes, categoriesRes, productsRes] = await Promise.all([
        userService.getPersons(),
        boutiqueService.getBoutiques(),
        categoryService.getCategories(),
        productService.getProducts()
      ])

      console.log('📊 Dashboard Page - Persons Response:', personsRes)
      console.log('📊 Dashboard Page - Boutiques Response:', boutiquesRes)
      console.log('📊 Dashboard Page - Categories Response:', categoriesRes)
      console.log('📊 Dashboard Page - Products Response:', productsRes)

      const persons = personsRes?.data?.data || personsRes?.data || []
      const boutiques = boutiquesRes?.data?.data || boutiquesRes?.data || []
      const categories = categoriesRes?.data?.data || categoriesRes?.data || []
      const products = productsRes?.data?.data || productsRes?.data || []

      const usersCount = Array.isArray(persons) ? persons.length : 0

      console.log('📊 Dashboard Page - Processed data:')
      console.log('- Users count:', usersCount)
      console.log('- Boutiques count:', boutiques.length)
      console.log('- Categories count:', categories.length)
      console.log('- Products count:', products.length)

      setStats({
        users: usersCount,
        boutiques: boutiques.length,
        categories: categories.length,
        products: products.length,
        revenue: 2450000, // Example revenue
        growth: 12.5 // Example growth
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Utilisateurs',
      value: stats.users,
      icon: UsersIcon,
      color: 'bg-emerald-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Boutiques',
      value: stats.boutiques,
      icon: BuildingStorefrontIcon,
      color: 'bg-secondary-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Catégories',
      value: stats.categories,
      icon: TagIcon,
      color: 'bg-accent-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Produits',
      value: stats.products,
      icon: ShoppingBagIcon,
      color: 'bg-cta-500',
      change: '+18%',
      changeType: 'positive'
    }
  ]

  if (!mounted) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    )
  }

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Vue d'ensemble de l'administration Diaymax</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} rounded-md p-3`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                          <span className="sr-only">Increased by</span>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue and Growth */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Chiffre d'affaires</h3>
              <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.revenue.toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-sm text-gray-500 mt-2">Ce mois-ci</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Croissance</h3>
              <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.growth}%
            </div>
            <p className="text-sm text-gray-500 mt-2">Augmentation mensuelle</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <UsersIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Nouvel utilisateur inscrit</p>
                  <p className="text-sm text-gray-500">Il y a 2 heures</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center">
                    <BuildingStorefrontIcon className="h-4 w-4 text-secondary-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Nouvelle boutique validée</p>
                  <p className="text-sm text-gray-500">Il y a 4 heures</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-cta-100 flex items-center justify-center">
                    <ShoppingBagIcon className="h-4 w-4 text-cta-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Nouveaux produits ajoutés</p>
                  <p className="text-sm text-gray-500">Il y a 6 heures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
