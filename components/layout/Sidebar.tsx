'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  TagIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Utilisateurs', href: '/users', icon: UsersIcon },
  { name: 'Boutiques', href: '/boutiques', icon: BuildingStorefrontIcon },
  { name: 'Catégories', href: '/categories', icon: TagIcon },
  { name: 'Produits', href: '/products', icon: ShoppingBagIcon },
  { name: 'Paniers', href: '/carts', icon: ShoppingCartIcon },
  { name: 'Commandes', href: '/orders', icon: ClipboardDocumentListIcon },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Statistiques', href: '/statistics', icon: ChartBarIcon },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 border-b border-emerald-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-lg">
                <span className="text-emerald-600 font-bold text-xl">D</span>
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-white">Diaymax</h1>
              <p className="text-xs text-emerald-100">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Menu Principal
            </p>
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500 shadow-sm'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }
                `}
                onClick={() => onClose()}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'
                  }`}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="mb-3">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Compte
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  )
}
