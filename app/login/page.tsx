'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

// Debug helper
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.log(`[LOGIN DEBUG] ${message}`, data || '')
  }
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const router = useRouter()

  useEffect(() => {
    debugLog('Login page initialized', {
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      debugMode: process.env.NEXT_PUBLIC_DEBUG,
      nodeEnv: process.env.NODE_ENV
    })

    // Check if already logged in
    const token = localStorage.getItem('admin_token')
    const user = localStorage.getItem('admin_user')
    
    if (token && user) {
      debugLog('User already logged in', { token: token.substring(0, 20) + '...', user: JSON.parse(user) })
      router.push('/dashboard')
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    debugLog(`Form field changed`, { field: name, value })
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (error) {
      setError('')
      setDebugInfo('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setDebugInfo('')

    debugLog('Login attempt started', { email: formData.email })

    try {
      debugLog('Sending API request to authService.login')
      const response = await authService.login(formData.email, formData.password)
      
      debugLog('API response received', {
        status: response.status,
        data: response.data,
        success: response.data.success
      })
      
      if (response.data.success) {
        const { token, userId, email, username, role } = response.data.data
        
        debugLog('Login successful', {
          userId,
          email,
          username,
          role,
          tokenLength: token?.length
        })
        
        // Verify this is an admin user
        if (role !== 'ADMIN') {
          const errorMsg = 'Accès réservé aux administrateurs'
          debugLog('Access denied - not admin', { role })
          setError(errorMsg)
          setDebugInfo(`Rôle détecté: ${role} (ADMIN requis)`)
          return
        }
        
        // Store authentication data
        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_user', JSON.stringify({
          id: userId,
          email,
          username,
          role
        }))
        
        debugLog('Authentication data stored in localStorage')
        debugLog('Redirecting to dashboard...')
        
        router.push('/dashboard')
      } else {
        const errorMsg = response.data.message || 'Erreur de connexion'
        debugLog('Login failed - API returned success: false', { message: response.data.message })
        setError(errorMsg)
        setDebugInfo(`Réponse API: ${JSON.stringify(response.data)}`)
      }
    } catch (err: any) {
      debugLog('Login error caught', {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      })
      
      const errorMsg = err.response?.data?.message || err.message || 'Erreur de connexion au serveur'
      setError(errorMsg)
      
      if (err.response?.status === 401) {
        setDebugInfo('Erreur 401: Identifiants invalides')
      } else if (err.response?.status === 500) {
        setDebugInfo('Erreur 500: Erreur serveur interne')
      } else if (err.code === 'NETWORK_ERROR') {
        setDebugInfo('Erreur réseau: Impossible de contacter le serveur')
      } else {
        setDebugInfo(`Erreur: ${err.response?.data?.errorCode || 'UNKNOWN'}`)
      }
    } finally {
      setIsLoading(false)
      debugLog('Login attempt finished')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 shadow-lg">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Administration Diaymax
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour accéder au panneau d'administration
          </p>
          {process.env.NEXT_PUBLIC_DEBUG === 'true' && (
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-debug-100 text-debug-800">
              Mode Debug Activé
            </div>
          )}
        </div>
        
        {/* Login Form */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 4 4 0 008 0zm-4 8a6 6 0 100-12 6 6 0 000 12z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="admin@diaymax.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="•••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-error-50 border border-error-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-error-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Info */}
            {debugInfo && (
              <div className="rounded-lg bg-info-50 border border-info-200 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-info-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-info-800 font-mono">{debugInfo}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 hover:from-primary-700 hover:via-primary-600 hover:to-secondary-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="font-medium">Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                      </svg>
                      <span className="font-semibold">SE CONNECTER</span>
                    </>
                  )}
                </span>
                
                {/* Button shine effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {process.env.NEXT_PUBLIC_APP_NAME} v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
          </p>
          {process.env.NEXT_PUBLIC_DEBUG === 'true' && (
            <p className="text-xs text-gray-400 mt-1">
              API: {process.env.NEXT_PUBLIC_API_URL}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
