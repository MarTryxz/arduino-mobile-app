"use client"

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/firebase'
import { ref, onValue } from 'firebase/database'
import { Crown, Shield } from 'lucide-react'
import { PremiumModal } from '@/components/premium-modal'
import { SubscriptionModal } from '@/components/subscription-modal'

export function UserButton() {
  const { user, logOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [role, setRole] = useState<string | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch user role
  useEffect(() => {
    if (!user) return

    const roleRef = ref(db, `users/${user.uid}/role`)
    const unsubscribe = onValue(roleRef, (snapshot) => {
      setRole(snapshot.val())
    })

    return () => unsubscribe()
  }, [user])

  const handleLogout = async () => {
    try {
      await logOut()
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  if (!user) return null

  // Obtener iniciales del nombre o email
  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email?.[0]?.toUpperCase() || 'U'
  }

  const isPro = role === 'cliente_premium'
  const isAdmin = role === 'admin'
  const showBadge = isPro || isAdmin

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition relative group"
        aria-label="Menú de usuario"
      >
        {showBadge && (
          <div className={`absolute -top-1 -right-1 z-10 rounded-full p-1 shadow-sm border border-white dark:border-slate-900 ${isAdmin ? 'bg-red-600' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}>
            <Crown className="w-3 h-3 text-white fill-white" />
          </div>
        )}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-md transition-all duration-300 ${showBadge
          ? isAdmin
            ? 'bg-gradient-to-br from-red-800 to-red-900 text-white border-2 border-red-500/50'
            : 'bg-gradient-to-br from-slate-800 to-slate-900 text-amber-400 border-2 border-amber-500/50'
          : 'bg-blue-600 text-white'
          }`}>
          {getInitials()}
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {user.displayName || 'Usuario'}
              </p>
              {showBadge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm flex items-center gap-1 ${isAdmin ? 'bg-red-600' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}>
                  <Crown className="w-3 h-3 fill-white" />
                  {isAdmin ? 'ADMIN' : 'PRO'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </div>
            </Link>

            {/* Subscription Management */}
            {!isPro && !isAdmin ? (
              <button
                onClick={() => {
                  setIsOpen(false)
                  setShowPremiumModal(true)
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <div className="flex items-center">
                  <Crown className="w-4 h-4 mr-3 text-amber-500" />
                  Obtener Premium
                </div>
              </button>
            ) : (
              !isAdmin && (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setShowSubscriptionModal(true)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 mr-3 text-amber-500" />
                    Gestionar Suscripción
                  </div>
                </button>
              )
            )}

            {isAdmin && (
              <Link
                href="/admin/users"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                  <Shield className="w-4 h-4 mr-3 text-amber-500" />
                  Panel de Admin
                </div>
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </div>
            </button>
          </div>
        </div>
      )}
      <PremiumModal open={showPremiumModal} onOpenChange={setShowPremiumModal} />
      <SubscriptionModal open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal} />
    </div>
  )
}
