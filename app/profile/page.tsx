"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { db } from "@/firebase"
import { deleteUser } from "firebase/auth"
import { ref, onValue, update, remove } from "firebase/database"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone, MapPin, Save, ArrowLeft, Cpu, Crown, Shield } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function ProfilePage() {
    const { user, logOut } = useAuth()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [role, setRole] = useState<string>('cliente')

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        poolLocation: '',
        macAddress: ''
    })

    // Redirigir si no hay usuario
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    // Cargar datos del usuario
    useEffect(() => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}`)
            const unsubscribe = onValue(userRef, (snapshot) => {
                const data = snapshot.val()
                if (data) {
                    setFormData({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        phone: data.phone || '',
                        poolLocation: data.poolLocation || '',
                        macAddress: data.macAddress || ''
                    })
                    if (data.role) {
                        setRole(data.role)
                    }
                }
                setLoading(false)
            })

            return () => unsubscribe()
        } else {
            setLoading(false)
        }
    }, [user])

    const toggleEdit = () => {
        if (isEditing) {
            setIsEditing(false)
        } else {
            setIsEditing(true)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setSaving(true)
        setMessage(null)

        try {
            const userRef = ref(db, `users/${user.uid}`)
            await update(userRef, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                poolLocation: formData.poolLocation,
                macAddress: formData.macAddress
            })
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
            setIsEditing(false)
        } catch (error) {
            console.error('Error al actualizar perfil:', error)
            setMessage({ type: 'error', text: 'Error al actualizar el perfil' })
        } finally {
            setSaving(false)
        }
    }

    const handleCancelSubscription = async () => {
        if (!user) return

        if (confirm("¿Estás seguro de que quieres cancelar tu suscripción Premium? Perderás los beneficios inmediatamente.")) {
            try {
                const userRef = ref(db, `users/${user.uid}`)
                await update(userRef, {
                    role: 'cliente'
                })
                toast.success("Suscripción cancelada correctamente")
            } catch (error) {
                console.error("Error cancelling subscription:", error)
                toast.error("Error al cancelar la suscripción")
            }
        }
    }
    const handleDeleteAccount = async () => {
        if (!user) return

        if (confirm("¿Estás SEGURO de que quieres eliminar tu cuenta? Esta acción NO se puede deshacer y perderás todos tus datos.")) {
            try {
                // Check if login is recent (within last 5 minutes)
                if (user.metadata.lastSignInTime) {
                    const lastSignIn = new Date(user.metadata.lastSignInTime).getTime()
                    const now = new Date().getTime()
                    // 5 minutes in milliseconds
                    if (now - lastSignIn > 5 * 60 * 1000) {
                        toast.error("Por seguridad, debes haber iniciado sesión recientemente. Te redirigiremos al login.")
                        setTimeout(async () => {
                            await logOut()
                            router.push('/login')
                        }, 2000)
                        return
                    }
                }

                // 1. Delete user data from Realtime Database
                await remove(ref(db, `users/${user.uid}`))

                // 2. Delete user from Firebase Auth
                await deleteUser(user)

                router.push('/')
                toast.success("Cuenta eliminada correctamente")
            } catch (error: any) {
                console.error("Error deleting account:", error)
                if (error.code === 'auth/requires-recent-login') {
                    toast.error("Por seguridad, inicia sesión nuevamente e inténtalo de nuevo.")
                    await logOut()
                    router.push('/login')
                } else {
                    toast.error("Error al eliminar la cuenta: " + error.message)
                }
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const getPlanDetails = () => {
        if (role === 'admin') {
            return {
                name: 'Administrador',
                icon: <Shield className="w-5 h-5 text-white" />,
                style: 'bg-gradient-to-r from-red-600 to-red-800 text-white border-red-500',
                badge: 'ADMIN'
            }
        } else if (role === 'cliente_premium') {
            return {
                name: 'Plan PRO',
                icon: <Crown className="w-5 h-5 text-white" />,
                style: 'bg-gradient-to-r from-amber-400 to-orange-600 text-white border-amber-500',
                badge: 'PRO'
            }
        } else {
            return {
                name: 'Plan Gratuito',
                icon: <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />,
                style: 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700',
                badge: 'FREE'
            }
        }
    }

    const plan = getPlanDetails()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <DashboardHeader title="Mi Perfil" />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver al Dashboard
                        </Link>
                    </div>

                    {/* Plan Card */}
                    <Card className={`overflow-hidden border-2 ${role !== 'cliente' ? 'shadow-lg' : ''}`}>
                        <div className={`p-6 flex items-center justify-between ${plan.style}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${role === 'cliente' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white/20'}`}>
                                    {plan.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{plan.name}</h3>
                                    <p className={`text-sm ${role === 'cliente' ? 'text-gray-500 dark:text-gray-400' : 'text-white/80'}`}>
                                        {role === 'cliente' ? 'Actualiza a PRO para más funciones' : 'Tienes acceso total al sistema'}
                                    </p>
                                </div>
                            </div>
                            {role === 'cliente' && (
                                <Button asChild variant="default" size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-none">
                                    <Link href="/assistant">
                                        Obtener Premium
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-2xl font-bold">
                                {isEditing ? 'Editar Perfil' : 'Mi Perfil'}
                            </CardTitle>
                            {!isEditing && (
                                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                                    Editar
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {message && (
                                <div className={`p-4 mb-6 rounded-lg text-sm text-center ${message.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Nombre */}
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">Nombre</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className="pl-10"
                                                    placeholder="Tu nombre"
                                                />
                                            </div>
                                        </div>

                                        {/* Apellido */}
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Apellido</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className="pl-10"
                                                    placeholder="Tu apellido"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Teléfono */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="pl-10"
                                                placeholder="+56 9 1234 5678"
                                            />
                                        </div>
                                    </div>

                                    {/* Ubicación de la piscina */}
                                    <div className="space-y-2">
                                        <Label htmlFor="poolLocation">Ubicación de la Piscina</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="poolLocation"
                                                name="poolLocation"
                                                value={formData.poolLocation}
                                                onChange={handleInputChange}
                                                className="pl-10"
                                                placeholder="Ej: Santiago, Chile"
                                            />
                                        </div>
                                    </div>

                                    {/* MAC del Dispositivo */}
                                    <div className="space-y-2">
                                        <Label htmlFor="macAddress">MAC del Dispositivo</Label>
                                        <div className="relative">
                                            <Cpu className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="macAddress"
                                                name="macAddress"
                                                value={formData.macAddress}
                                                onChange={handleInputChange}
                                                className="pl-10 font-mono"
                                                placeholder="AA:BB:CC:DD:EE:FF"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Ingresa la dirección MAC de tu dispositivo AquaGuard para vincularlo.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setIsEditing(false)}
                                            disabled={saving}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Guardar Cambios
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre Completo</h3>
                                            <div className="mt-1 flex items-center text-lg font-medium">
                                                <User className="w-5 h-5 mr-2 text-blue-500" />
                                                {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}` : <span className="text-gray-400 italic">No especificado</span>}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</h3>
                                            <div className="mt-1 flex items-center text-lg">
                                                <Phone className="w-5 h-5 mr-2 text-blue-500" />
                                                {formData.phone || <span className="text-gray-400 italic">No especificado</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ubicación de la Piscina</h3>
                                        <div className="mt-1 flex items-center text-lg">
                                            <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                                            {formData.poolLocation || <span className="text-gray-400 italic">No especificada</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dispositivo Vinculado (MAC)</h3>
                                        <div className="mt-1 flex items-center text-lg font-mono bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded-md w-fit">
                                            <Cpu className="w-5 h-5 mr-2 text-blue-500" />
                                            {formData.macAddress || <span className="text-gray-400 italic font-sans">Ninguno</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-red-600 dark:text-red-500">Zona de Peligro</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {role === 'cliente_premium' && (
                                <div className="flex items-center justify-between p-4 border border-red-100 dark:border-red-900/30 rounded-lg bg-red-50 dark:bg-red-900/10">
                                    <div>
                                        <h4 className="font-semibold text-red-700 dark:text-red-400">Cancelar Suscripción Premium</h4>
                                        <p className="text-sm text-red-600/80 dark:text-red-400/70">
                                            Perderás acceso a las funciones PRO al final del periodo actual.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50"
                                        onClick={handleCancelSubscription}
                                    >
                                        Cancelar Suscripción
                                    </Button>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 border border-red-100 dark:border-red-900/30 rounded-lg bg-red-50 dark:bg-red-900/10">
                                <div>
                                    <h4 className="font-semibold text-red-700 dark:text-red-400">Eliminar Cuenta</h4>
                                    <p className="text-sm text-red-600/80 dark:text-red-400/70">
                                        Esta acción es permanente y no se puede deshacer.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                >
                                    Eliminar Cuenta
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
