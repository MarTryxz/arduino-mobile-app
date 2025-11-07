"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
    const { signIn, signInWithGoogle, user, signInWithFacebook } = useAuth()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (user) {
            router.push('/dashboard')
        }
    }, [user, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn(email, password)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError('')
        setLoading(true)

        try {
            await signInWithGoogle()
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión con Google')
        } finally {
            setLoading(false)
        }
    }

    const handleFacebookSignIn = async () => {
        setError('')
        setLoading(true)

        try {
            await signInWithFacebook()
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión con Facebook')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-gray-900 min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo y título */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <Image
                            src="/openrakiduamlogo.webp"
                            alt="Logo AquaGuard"
                            width={64}
                            height={64}
                            className="h-16 w-auto"
                        />
                        <h1 className="text-3xl font-bold text-blue-600">AquaGuard</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Monitoreo inteligente de piscinas</p>
                </div>

                {/* Formulario de inicio de sesión */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                        Iniciar Sesión
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Campo de correo electrónico */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="correo@ejemplo.com"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Campo de contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pr-12 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Mostrar u ocultar contraseña"
                                    className="absolute inset-y-0 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Recordarme y olvidé contraseña */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Recordarme</span>
                            </label>
                            <Link href="/recover-password" className="text-blue-600 hover:text-blue-700 font-medium">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {/* Mensaje de error */}
                        {error && (
                            <p className="text-center text-sm text-red-600 dark:text-red-400">
                                ✗ {error}
                            </p>
                        )}

                        {/* Botón de inicio de sesión */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    {/* Divisor */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                                o continuar con
                            </span>
                        </div>
                    </div>
                    {/* Contenedor para los botones de Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Botón de inicio de sesión con Google */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
                        </button>
                        {/* ---- NUEVO: Botón de inicio de sesión con Facebook ---- */}
                        <button
                            onClick={handleFacebookSignIn}
                            disabled={loading}
                            className="flex items-center justify-center px-4 py-2 border rounded-lg bg-[#1877F2] text-white hover:bg-[#166eeb] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* Icono de Facebook */}
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.8c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className="text-sm font-medium">Facebook</span>
                        </button>
                    </div>

                    {/* Registro */}
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                        ¿No tienes una cuenta?
                        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold ml-1">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>

                {/* Volver a inicio */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}
