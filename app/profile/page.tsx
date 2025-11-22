"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { db } from "@/firebase"
import { ref, onValue, update } from "firebase/database"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone, MapPin, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        poolLocation: ''
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
                        poolLocation: data.poolLocation || ''
                    })
                }
                setLoading(false)
            })

            return () => unsubscribe()
        } else {
            setLoading(false)
        }
    }, [user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                poolLocation: formData.poolLocation
            })
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
        } catch (error) {
            console.error('Error al actualizar perfil:', error)
            setMessage({ type: 'error', text: 'Error al actualizar el perfil' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <DashboardHeader title="Mi Perfil" />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver al Dashboard
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Editar Perfil</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                                onChange={handleChange}
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
                                                onChange={handleChange}
                                                className="pl-10"
                                                placeholder="Tu apellido"
                                            />
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
                                                onChange={handleChange}
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
                                                onChange={handleChange}
                                                className="pl-10"
                                                placeholder="Ej: Santiago, Chile"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Mensajes de éxito/error */}
                                {message && (
                                    <div className={`p-4 rounded-lg text-sm text-center ${message.type === 'success'
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                        {message.text}
                                    </div>
                                )}

                                {/* Botón Guardar */}
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>Guardando...</>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
