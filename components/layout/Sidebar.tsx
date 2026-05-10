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
        fixed inset-y-0 left-0 z-40 w-56 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-14 px-4 bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] border-b border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-lg">
                <span className="text-[#0f7b6c] font-bold text-lg">D</span>
              </div>
            </div>
            <div className="ml-2">
              <h1 className="text-sm font-bold text-white">Diaymax</h1>
              <p className="text-xs text-gray-200">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-200 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="mb-3">
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                  group flex items-center px-2 py-2 text-xs font-medium rounded-md transition-all duration-200
                  ${isActive
                    ? 'bg-[#0f7b6c] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#0f7b6c]'
                  }
                `}
                onClick={() => onClose()}
              >
                <item.icon
                  className={`mr-2 h-4 w-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#0f7b6c]'
                  }`}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="mb-2">
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Compte
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full group flex items-center px-2 py-2 text-xs font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  )
}
