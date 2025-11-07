"use client"

import { User } from 'firebase/auth'

// Guardar el token de sesión en una cookie
export function setAuthCookie(user: User | null) {
  if (typeof window === 'undefined') return
  
  if (user) {
    user.getIdToken().then((token) => {
      // Guardar el token en una cookie con el nombre __session
      document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`
    })
  } else {
    // Eliminar la cookie si no hay usuario
    document.cookie = '__session=; path=/; max-age=0'
  }
}

// Eliminar la cookie de sesión
export function removeAuthCookie() {
  if (typeof window === 'undefined') return
  document.cookie = '__session=; path=/; max-age=0'
}

// Obtener el token de la cookie
export function getAuthCookie(): string | null {
  if (typeof window === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('__session='))
  
  if (sessionCookie) {
    return sessionCookie.split('=')[1]
  }
  
  return null
}
