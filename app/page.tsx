"use client"

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { SignInButton, SignUpButton } from '@clerk/nextjs'

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
          <p className="mt-2 text-sm text-gray-600 mb-4">
            Sistema de monitoreo de acuaponía basado en Arduino
          </p>
          <div className="flex justify-center gap-4">
            <button className="button"> <SignUpButton mode="modal" /> </button>
            <button className="button"> <SignInButton mode="modal" /> </button>
          </div>
        </div>
      </div>
    </div>
  )
}
