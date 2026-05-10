'use client'

import { useState, useEffect } from 'react'
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<any>({})

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('admin_user') || '{}')
    setUser(userData)
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-12">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Bars3Icon className="h-4 w-4" />
          </button>

          {/* Page title for mobile */}
          <div className="flex-1 lg:hidden">
            <h1 className="text-sm font-semibold text-gray-900">Administration</h1>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-2">
            {/* Search bar (desktop only) */}
            <div className="hidden lg:block flex-1 max-w-xs mr-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0f7b6c] focus:border-[#0f7b6c] text-xs"
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
              <BellIcon className="h-4 w-4" />
              <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* User profile */}
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium text-gray-900">{user.username ? user.username.split(' ').reverse().join(' ') : 'Admin'}</p>
                <p className="text-xs text-gray-500">{user.email || 'admin@diaymax.com'}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#0f7b6c] to-[#0a5c50] flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">
                  {(user.username || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
