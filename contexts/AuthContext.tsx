"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  getAdditionalUserInfo,
} from 'firebase/auth'
import { ref, set } from 'firebase/database'
import { auth, db } from '@/firebase'
import { setAuthCookie, removeAuthCookie } from '@/lib/auth-cookies'

// Tipos para el contexto
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  logOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

// Proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)

      // Actualizar la cookie de sesión cuando cambia el estado de autenticación
      setAuthCookie(user)
    })

    // Cleanup subscription
    return unsubscribe
  }, [])

  // Función para iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  // Función para registrarse
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Si se proporciona un nombre, actualizar el perfil
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName })
      }

      // Guardar datos del usuario en Realtime Database
      if (userCredential.user) {
        await set(ref(db, `users/${userCredential.user.uid}`), {
          role: 'cliente',
          lastName: displayName || ''
        })
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al registrarse')
    }
  }

  // Función para cerrar sesión
  const logOut = async () => {
    try {
      await signOut(auth)
      // Eliminar la cookie de sesión al cerrar sesión
      removeAuthCookie()
    } catch (error: any) {
      throw new Error(error.message || 'Error al cerrar sesión')
    }
  }

  // Función para recuperar contraseña
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(error.message || 'Error al enviar correo de recuperación')
    }
  }

  // Función para iniciar sesión con Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Verificar si es un usuario nuevo
      const additionalUserInfo = getAdditionalUserInfo(result)
      if (additionalUserInfo?.isNewUser && result.user) {
        await set(ref(db, `users/${result.user.uid}`), {
          role: 'cliente',
          lastName: result.user.displayName || ''
        })
      }
    } catch (error: any) {
      // Manejo de errores específicos
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Ventana cerrada. Por favor intenta de nuevo.')
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup bloqueado. Permite popups en tu navegador.')
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Solicitud cancelada.')
      }
      throw new Error(error.message || 'Error al iniciar sesión con Google')
    }
  }

  // Función para iniciar sesión con Facebook
  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider()
      // Solicitar permisos adicionales (opcional)
      provider.addScope('email')
      provider.addScope('public_profile')

      const result = await signInWithPopup(auth, provider)

      // Verificar si es un usuario nuevo
      const additionalUserInfo = getAdditionalUserInfo(result)
      if (additionalUserInfo?.isNewUser && result.user) {
        await set(ref(db, `users/${result.user.uid}`), {
          role: 'cliente',
          lastName: result.user.displayName || ''
        })
      }
    } catch (error: any) {
      // Manejo de errores específicos
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Ventana cerrada. Por favor intenta de nuevo.')
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup bloqueado. Permite popups en tu navegador.')
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Solicitud cancelada.')
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('Ya existe una cuenta con este email usando otro método de inicio de sesión.')
      }
      throw new Error(error.message || 'Error al iniciar sesión con Facebook')
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    logOut,
    resetPassword,
    signInWithGoogle,
    signInWithFacebook
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
