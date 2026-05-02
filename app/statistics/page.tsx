'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { userAPI, boutiqueAPI, categoryAPI, productAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  UsersIcon,
  BuildingStorefrontIcon,
  TagIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface StatsData {
  users: number
  boutiques: number
  categories: number
  products: number
  revenue: number
  growth: number
}

interface MonthlyData {
  month: string
  users: number
  boutiques: number
  products: number
}

interface CategoryData {
  name: string
  value: number
}

interface BoutiqueStatusData {
  name: string
  value: number
  color: string
}

const COLORS = ['#0ea5e9', '#14b8a6', '#a855f7', '#f59e0b', '#10b981']

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatsData>({
    users: 0,
    boutiques: 0,
    categories: 0,
    products: 0,
    revenue: 0,
    growth: 0
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [boutiqueStatusData, setBoutiqueStatusData] = useState<BoutiqueStatusData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      console.log('🔄 Statistics Page - Fetching statistics...')
      
      // Try each API call individually to identify which one fails
      let usersRes, boutiquesRes, categoriesRes, productsRes
      
      try {
        console.log('📊 Statistics Page - Calling userAPI.getPersons() to count users...')
        const personsResponse = await userAPI.getPersons()
        const personsData = personsResponse?.data?.data || personsResponse?.data || []
        const usersCount = Array.isArray(personsData) ? personsData.length : 0
        usersRes = { data: usersCount, status: personsResponse.status || 200 }
        console.log('✅ Statistics Page - Users API success:', usersRes.status, 'count:', usersCount)
      } catch (error) {
        console.error('❌ Statistics Page - Users API failed:', error)
        console.error('❌ Error type:', typeof error)
        console.error('❌ Error constructor:', (error as any)?.constructor?.name)
        console.error('❌ Error message:', (error as any)?.message)
        console.error('❌ Error response:', (error as any).response)
        console.error('❌ Error response data:', (error as any).response?.data)
        console.error('❌ Error response status:', (error as any).response?.status)
        console.error('❌ Error stack:', (error as any)?.stack)
        console.error('❌ Stringified error:', JSON.stringify(error, null, 2))
        usersRes = { data: 0, status: 'error' }
      }
      
      try {
        console.log('📊 Statistics Page - Calling boutiqueAPI.getBoutiques()...')
        boutiquesRes = await boutiqueAPI.getBoutiques()
        console.log('✅ Statistics Page - Boutiques API success:', boutiquesRes.status)
      } catch (error) {
        console.error('❌ Statistics Page - Boutiques API failed:', error)
        console.error('❌ Error details:', (error as any).response?.data || (error as any).message)
        boutiquesRes = { data: [], status: 'error' }
      }
      
      try {
        console.log('📊 Statistics Page - Calling categoryAPI.getCategories()...')
        categoriesRes = await categoryAPI.getCategories()
        console.log('✅ Statistics Page - Categories API success:', categoriesRes.status)
      } catch (error) {
        console.error('❌ Statistics Page - Categories API failed:', error)
        console.error('❌ Error details:', (error as any).response?.data || (error as any).message)
        categoriesRes = { data: [], status: 'error' }
      }
      
      try {
        console.log('📊 Statistics Page - Calling productAPI.getProducts()...')
        productsRes = await productAPI.getProducts()
        console.log('✅ Statistics Page - Products API success:', productsRes.status)
      } catch (error) {
        console.error('❌ Statistics Page - Products API failed:', error)
        console.error('❌ Error details:', (error as any).response?.data || (error as any).message)
        productsRes = { data: [], status: 'error' }
      }

      console.log('📊 Statistics Page - Users Response:', usersRes)
      console.log('📊 Statistics Page - Boutiques Response:', boutiquesRes)
      console.log('📊 Statistics Page - Categories Response:', categoriesRes)
      console.log('📊 Statistics Page - Products Response:', productsRes)

      const boutiques = boutiquesRes?.data?.data || boutiquesRes?.data || []
      const categories = categoriesRes?.data?.data || categoriesRes?.data || []
      const products = productsRes?.data?.data || productsRes?.data || []

      console.log('📊 Statistics Page - Processed data:')
      console.log('- Users count:', usersRes.data)
      console.log('- Boutiques count:', boutiques.length)
      console.log('- Categories count:', categories.length)
      console.log('- Products count:', products.length)

      // Calculate stats
      const statsData = {
        users: usersRes.data || 0,
        boutiques: boutiques.length,
        categories: categories.length,
        products: products.length,
        revenue: 2450000, // Example revenue
        growth: 12.5 // Example growth
      }

      setStats(statsData)

      // Generate monthly data (mock data for demo)
      const mockMonthlyData = [
        { month: 'Jan', users: 45, boutiques: 8, products: 120 },
        { month: 'Fév', users: 52, boutiques: 12, products: 145 },
        { month: 'Mar', users: 61, boutiques: 15, products: 178 },
        { month: 'Avr', users: 73, boutiques: 18, products: 210 },
        { month: 'Mai', users: 89, boutiques: 22, products: 256 },
        { month: 'Juin', users: 105, boutiques: 28, products: 310 }
      ]
      setMonthlyData(mockMonthlyData)

      // Generate category data (mock data)
      const mockCategoryData = categories.slice(0, 5).map((cat: any, index: number) => ({
        name: cat.nom,
        value: Math.floor(Math.random() * 100) + 20
      }))
      setCategoryData(mockCategoryData)

      // Generate boutique status data
      const statusCounts = boutiques.reduce((acc: any, boutique: any) => {
        acc[boutique.statut] = (acc[boutique.statut] || 0) + 1
        return acc
      }, {})

      const statusData = [
        { name: 'Validées', value: statusCounts.VALIDE || 0, color: '#10b981' },
        { name: 'En attente', value: statusCounts.EN_ATTENTE || 0, color: '#f59e0b' },
        { name: 'Refusées', value: statusCounts.REFUSE || 0, color: '#ef4444' },
        { name: 'Suspendues', value: statusCounts.SUSPENDU || 0, color: '#6b7280' }
      ].filter(item => item.value > 0)

      setBoutiqueStatusData(statusData)

    } catch (error) {
      console.error('Error fetching statistics:', error)
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
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'Boutiques',
      value: stats.boutiques,
      icon: BuildingStorefrontIcon,
      color: 'bg-secondary-500',
      change: '+22%',
      changeType: 'positive'
    },
    {
      name: 'Catégories',
      value: stats.categories,
      icon: TagIcon,
      color: 'bg-accent-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Produits',
      value: stats.products,
      icon: ShoppingBagIcon,
      color: 'bg-cta-500',
      change: '+35%',
      changeType: 'positive'
    }
  ]

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
          <h1 className="text-2xl font-bold text-gray-900">Statistiques et Analytiques</h1>
          <p className="text-gray-600">Vue d'ensemble des performances de la plateforme</p>
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
              {formatCurrency(stats.revenue)}
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Growth Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution mensuelle</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  name="Utilisateurs"
                />
                <Line 
                  type="monotone" 
                  dataKey="boutiques" 
                  stroke="#14b8a6" 
                  strokeWidth={2}
                  name="Boutiques"
                />
                <Line 
                  type="monotone" 
                  dataKey="products" 
                  stroke="#a855f7" 
                  strokeWidth={2}
                  name="Produits"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition des catégories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Boutique Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Statut des boutiques</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={boutiqueStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {boutiqueStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Résumé détaillé</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Métrique
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ce mois
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Utilisateurs actifs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stats.users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor(stats.users * 0.15)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    +15%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Boutiques validées
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {boutiqueStatusData.find(s => s.name === 'Validées')?.value || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor((boutiqueStatusData.find(s => s.name === 'Validées')?.value || 0) * 0.22)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    +22%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Produits actifs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stats.products}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor(stats.products * 0.35)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    +35%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Revenus générés
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(stats.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(stats.revenue * 0.125)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    +12.5%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
