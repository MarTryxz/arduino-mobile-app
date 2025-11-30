"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from '@/firebase'
import { ref, onValue, update } from 'firebase/database'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { User, Phone, MapPin, Save, ArrowLeft, Cpu, Crown, Shield, Droplets, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PoolVolumeCalculator } from "@/components/pool-volume-calculator"
import { HP_TO_FLOW_RATE } from "@/lib/filtration-calc"
import { DashboardHeader } from "@/components/dashboard-header"

export default function ProfilePage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [role, setRole] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        displayName: '',
        phoneNumber: '',
        address: '',
        macAddress: '',
        poolVolume: '',
        pumpFlowRate: ''
    })

    useEffect(() => {
        if (!user) return

        const userRef = ref(db, `users/${user.uid}`)
        onValue(userRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                setFormData({
                    displayName: data.displayName || '',
                    phoneNumber: data.phoneNumber || '',
                    address: data.address || '',
                    macAddress: data.macAddress || '',
                    poolVolume: data.poolVolume || '',
                    pumpFlowRate: data.pumpFlowRate || ''
                })
                setRole(data.role)
            }
        })
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

        setLoading(true)
        try {
            const updates: any = {
                displayName: formData.displayName,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                macAddress: formData.macAddress,
                poolVolume: formData.poolVolume,
                pumpFlowRate: formData.pumpFlowRate
            }

            await update(ref(db, `users/${user.uid}`), updates)
            toast.success("Perfil actualizado correctamente")
            setIsEditing(false)
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error("Error al actualizar el perfil")
        } finally {
            setLoading(false)
        }
    }

    const handleCancelSubscription = async () => {
        if (!user) return
        if (confirm("¿Estás seguro que deseas cancelar tu suscripción Premium? Perderás acceso a las funciones avanzadas al final del periodo actual.")) {
            try {
                await update(ref(db, `users/${user.uid}`), {
                    role: 'cliente_basico'
                })
                toast.success("Suscripción cancelada correctamente")
            } catch (error) {
                console.error('Error canceling subscription:', error)
                toast.error("Error al cancelar la suscripción")
            }
        }
    }

    const handleHpSelect = (hp: string) => {
        const flowRate = HP_TO_FLOW_RATE[hp]
        if (flowRate) {
            setFormData(prev => ({
                ...prev,
                pumpFlowRate: flowRate.toString()
            }))
            toast.info(`Capacidad estimada: ${flowRate} m³/h para ${hp} HP`)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <DashboardHeader title="Mi Perfil" />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver al Dashboard
                        </Link>
                    </div>

                    {/* Tarjeta de Suscripción */}
                    <Card className="border-blue-100 dark:border-blue-900 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800/50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <Crown className={`h-5 w-5 ${role === 'cliente_premium' || role === 'admin' ? 'text-yellow-500' : 'text-slate-400'}`} />
                                        Estado de la Cuenta
                                    </CardTitle>
                                    <CardDescription>
                                        {role === 'admin' ? 'Administrador del Sistema' :
                                            role === 'cliente_premium' ? 'Plan Premium Activo' : 'Plan Básico'}
                                    </CardDescription>
                                </div>
                                {(role === 'cliente_premium' || role === 'admin') && (
                                    <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-full text-xs font-medium border border-yellow-200 dark:border-yellow-800">
                                        PREMIUM
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {role === 'cliente_premium' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Shield className="h-4 w-4 text-green-500" />
                                        <span>Tu suscripción está activa y se renovará automáticamente.</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        onClick={handleCancelSubscription}
                                    >
                                        Cancelar Suscripción
                                    </Button>
                                </div>
                            ) : role !== 'admin' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Actualiza a Premium para acceder a análisis históricos, alertas avanzadas y soporte prioritario.
                                    </p>
                                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all">
                                        Obtener Premium
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Formulario de Datos */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Información Personal</CardTitle>
                                {!isEditing ? (
                                    <Button onClick={() => setIsEditing(true)} variant="outline">
                                        Editar
                                    </Button>
                                ) : (
                                    <Button onClick={() => setIsEditing(false)} variant="ghost">
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="displayName" className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-slate-400" />
                                            Nombre Completo
                                        </Label>
                                        <Input
                                            id="displayName"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Tu nombre"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                            Teléfono
                                        </Label>
                                        <Input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="+56 9 ..."
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address" className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            Dirección de la Piscina
                                        </Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Calle, Número, Comuna"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="macAddress" className="flex items-center gap-2">
                                            <Cpu className="h-4 w-4 text-slate-400" />
                                            ID del Dispositivo (MAC)
                                        </Label>
                                        <Input
                                            id="macAddress"
                                            name="macAddress"
                                            value={formData.macAddress}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="AA:BB:CC:DD:EE:FF"
                                            className="font-mono"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Este ID vincula tu cuenta con el hardware de monitoreo.
                                        </p>
                                    </div>

                                    {/* Pool Volume Section */}
                                    <div className="space-y-2 md:col-span-2 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="poolVolume" className="flex items-center gap-2">
                                                <Droplets className="h-4 w-4 text-blue-500" />
                                                Volumen de la Piscina (Litros)
                                            </Label>
                                            {isEditing && (
                                                <PoolVolumeCalculator
                                                    onCalculate={(vol) => setFormData(prev => ({ ...prev, poolVolume: vol.toString() }))}
                                                />
                                            )}
                                        </div>
                                        <Input
                                            id="poolVolume"
                                            name="poolVolume"
                                            type="number"
                                            value={formData.poolVolume}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Ej: 40000"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Necesario para calcular dosis químicas exactas.
                                        </p>
                                    </div>

                                    {/* Pump Capacity Section */}
                                    <div className="space-y-2 md:col-span-2 pt-4 border-t">
                                        <Label htmlFor="pumpFlowRate" className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-yellow-500" />
                                            Capacidad de Bomba (m³/h)
                                        </Label>

                                        {isEditing && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <span className="text-xs text-muted-foreground w-full mb-1">¿No sabes el caudal? Selecciona los HP de tu bomba:</span>
                                                {Object.keys(HP_TO_FLOW_RATE).map((hp) => (
                                                    <Button
                                                        key={hp}
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs h-7"
                                                        onClick={() => handleHpSelect(hp)}
                                                    >
                                                        {hp} HP
                                                    </Button>
                                                ))}
                                            </div>
                                        )}

                                        <Input
                                            id="pumpFlowRate"
                                            name="pumpFlowRate"
                                            type="number"
                                            value={formData.pumpFlowRate}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Ej: 14"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Usado para optimizar tiempos de filtrado y ahorrar energía.
                                        </p>
                                    </div>

                                </div>

                                {isEditing && (
                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={loading} className="gap-2">
                                            {loading ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Guardar Cambios
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    {/* Resumen de Datos Clave (Solo lectura) */}
                    {!isEditing && (
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <Droplets className="h-8 w-8 text-blue-500 mb-2" />
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {formData.poolVolume ? parseInt(formData.poolVolume).toLocaleString() : '-'} L
                                    </div>
                                    <div className="text-xs text-blue-600/80 dark:text-blue-400/80">Volumen Total</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-50 dark:bg-green-900/20 border-none">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <Zap className="h-8 w-8 text-green-500 mb-2" />
                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        {formData.pumpFlowRate ? `${formData.pumpFlowRate} m³/h` : '-'}
                                    </div>
                                    <div className="text-xs text-green-600/80 dark:text-green-400/80">Capacidad Bomba</div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
