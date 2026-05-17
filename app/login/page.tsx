'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services'
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

// Debug helper
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.log(`[LOGIN DEBUG] ${message}`, data || '')
  }
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')

  const router = useRouter()

  useEffect(() => {
    debugLog('Login page initialized')

    const token = localStorage.getItem('admin_token')
    const user = localStorage.getItem('admin_user')

    if (token && user) {
      router.push('/dashboard')
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

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

    try {
      const response = await authService.login(
        formData.email,
        formData.password
      )

      if (response.data.success) {
        const { token, userId, email, username, role } =
          response.data.data

        if (role !== 'ADMIN') {
          setError('Accès réservé aux administrateurs')
          return
        }

        localStorage.setItem('admin_token', token)

        localStorage.setItem(
          'admin_user',
          JSON.stringify({
            id: userId,
            email,
            username,
            role,
          })
        )

        router.push('/dashboard')
      } else {
        setError(response.data.message || 'Erreur de connexion')
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Erreur de connexion au serveur'

      setError(errorMsg)

      if (err.response?.status === 401) {
        setDebugInfo('Identifiants invalides')
      } else if (err.response?.status === 500) {
        setDebugInfo('Erreur serveur interne')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f9fa] flex items-center justify-center px-4 py-10">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-[#0f7b6c]/10 blur-3xl"></div>

      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#ffc300]/20 blur-3xl"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="relative bg-[#0f7b6c] px-8 py-10 text-center">
            {/* Yellow accent */}
            <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-[#ffc300]/30"></div>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg">
              <ShieldCheckIcon className="h-10 w-10 text-[#0f7b6c]" />
            </div>

            <h1 className="mt-5 text-3xl font-extrabold text-white">
              Administration
            </h1>

            <p className="mt-2 text-sm text-white/80">
              Connectez-vous à votre espace admin
            </p>

            {process.env.NEXT_PUBLIC_DEBUG === 'true' && (
              <div className="mt-4 inline-flex rounded-full bg-[#ffc300] px-3 py-1 text-xs font-semibold text-[#0f7b6c]">
                MODE DEBUG
              </div>
            )}
          </div>

          {/* Form */}
          <form
            className="space-y-6 px-8 py-8"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Adresse email
              </label>

              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@diaymax.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-[#f8f9fa] px-4 py-4 text-gray-800 outline-none transition-all duration-300 focus:border-[#0f7b6c] focus:ring-4 focus:ring-[#0f7b6c]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Mot de passe
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-[#f8f9fa] px-4 py-4 pr-14 text-gray-800 outline-none transition-all duration-300 focus:border-[#0f7b6c] focus:ring-4 focus:ring-[#0f7b6c]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#0f7b6c]"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Debug */}
            {debugInfo && (
              <div className="rounded-2xl border border-[#ffc300]/30 bg-[#ffc300]/10 px-4 py-3">
                <p className="text-xs font-medium text-[#0f7b6c]">
                  {debugInfo}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#0f7b6c] py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#0d6a5d] hover:shadow-2xl disabled:opacity-60"
            >
              <span className="relative z-10 flex items-center">
                {isLoading ? (
                  <>
                    <svg
                      className="mr-3 h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-20"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>

                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 
                        0 0 5.373 0 12h4z"
                      ></path>
                    </svg>

                    Connexion...
                  </>
                ) : (
                  <>
                    <span>SE CONNECTER</span>
                  </>
                )}
              </span>

              {/* Shine effect */}
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"></div>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {process.env.NEXT_PUBLIC_APP_NAME} • v
            {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
          </p>

          {process.env.NEXT_PUBLIC_DEBUG === 'true' && (
            <p className="mt-1 text-[11px] text-gray-400">
              API : {process.env.NEXT_PUBLIC_API_URL || "https://c3c9-102-164-160-251.ngrok-free.app"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}