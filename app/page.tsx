"use client"

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-gray-light p-4">
      <div className="w-full max-w-sm space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido a AquaGuard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de monitoreo de acuaponía basado en Arduino
          </p>
        </div>
        
        <div className="mt-6 space-y-4">
          <p className="text-center text-sm text-gray-600">
            Por favor inicia sesión o regístrate para continuar
          </p>
          <div className="flex flex-col space-y-2">
            <p className="text-center text-sm text-gray-500">
              Usa los botones de la esquina superior derecha para autenticarte
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
