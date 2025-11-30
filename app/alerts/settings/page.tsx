"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { db } from "@/firebase"
import { ref, onValue, update } from "firebase/database"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { AlertTriangle, Save, Send, Thermometer, Droplet, Wind, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

interface AlertSettings {
    telegram: {
        chatId: string
        enabled: boolean
    }
    thresholds: {
        waterTemp: { min: number; max: number; enabled: boolean }
        airTemp: { min: number; max: number; enabled: boolean }
        humidity: { max: number; enabled: boolean }
    }
}

const defaultSettings: AlertSettings = {
    telegram: {
        chatId: "",
        enabled: false
    },
    thresholds: {
        waterTemp: { min: 18, max: 35, enabled: true },
        airTemp: { min: 5, max: 40, enabled: true },
        humidity: { max: 80, enabled: true }
    }
}

export default function AlertSettingsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<AlertSettings>(defaultSettings)
    const [role, setRole] = useState<string | null>(null)

    // Check role and fetch settings
    useEffect(() => {
        if (!user) return

        const roleRef = ref(db, `users/${user.uid}/role`)
        onValue(roleRef, (snapshot) => {
            const userRole = snapshot.val()
            setRole(userRole)

            if (userRole !== 'cliente_premium' && userRole !== 'admin') {
                toast.error("Esta función es exclusiva para usuarios Premium")
                router.push('/alerts')
                return
            }

            // Fetch settings
            const settingsRef = ref(db, `users/${user.uid}/alertSettings`)
            onValue(settingsRef, (settingsSnapshot) => {
                const data = settingsSnapshot.val()
                if (data) {
                    // Merge with defaults to ensure structure
                    setSettings({
                        telegram: { ...defaultSettings.telegram, ...data.telegram },
                        thresholds: {
                            waterTemp: { ...defaultSettings.thresholds.waterTemp, ...data.thresholds?.waterTemp },
                            airTemp: { ...defaultSettings.thresholds.airTemp, ...data.thresholds?.airTemp },
                            humidity: { ...defaultSettings.thresholds.humidity, ...data.thresholds?.humidity }
                        }
                    })
                }
                setLoading(false)
            }, { onlyOnce: true })
        })
    }, [user, router])

    const handleSave = async () => {
        // Validation Logic
        if (settings.thresholds.waterTemp.min >= settings.thresholds.waterTemp.max) {
            toast.error("Temp. Agua: El mínimo debe ser menor al máximo")
            return
        }
        if (settings.thresholds.airTemp.min >= settings.thresholds.airTemp.max) {
            toast.error("Temp. Aire: El mínimo debe ser menor al máximo")
            return
        }

        setSaving(true)
        try {
            await update(ref(db, `users/${user?.uid}/alertSettings`), settings)
            toast.success("Configuración guardada correctamente")
        } catch (error) {
            console.error("Error saving settings:", error)
            toast.error("Error al guardar la configuración")
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
            <DashboardHeader title="Configuración de Alertas" />

            <main className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
                <div className="flex items-center gap-2 mb-6">
                    <Link href="/alerts">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h2 className="text-lg font-medium text-foreground">Personalizar Alertas</h2>
                </div>

                {/* Telegram Configuration */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Send className="h-5 w-5 text-blue-500" />
                                <CardTitle>Notificaciones Telegram</CardTitle>
                            </div>
                            <Switch
                                checked={settings.telegram.enabled}
                                onCheckedChange={(checked) => setSettings({
                                    ...settings,
                                    telegram: { ...settings.telegram, enabled: checked }
                                })}
                            />
                        </div>
                        <CardDescription>
                            Recibe alertas instantáneas en tu celular.
                        </CardDescription>
                    </CardHeader>
                    {settings.telegram.enabled && (
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="chatId">Telegram Chat ID</Label>
                                <Input
                                    id="chatId"
                                    placeholder="Ej: 123456789"
                                    value={settings.telegram.chatId}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        telegram: { ...settings.telegram, chatId: e.target.value }
                                    })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    ¿No sabes tu ID?
                                    1. Abre <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">@userinfobot</a> en Telegram.
                                    2. Envía el comando <code>/start</code>.
                                    3. Copia el número que te responde.
                                </p>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Thresholds Configuration */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <CardTitle>Umbrales de Alerta</CardTitle>
                        </div>
                        <CardDescription>
                            Define cuándo quieres recibir una alerta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Water Temp */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Droplet className="h-4 w-4 text-blue-500" />
                                    <Label className="font-medium">Temperatura del Agua</Label>
                                </div>
                                <Switch
                                    checked={settings.thresholds.waterTemp.enabled}
                                    onCheckedChange={(checked) => setSettings({
                                        ...settings,
                                        thresholds: {
                                            ...settings.thresholds,
                                            waterTemp: { ...settings.thresholds.waterTemp, enabled: checked }
                                        }
                                    })}
                                />
                            </div>
                            {settings.thresholds.waterTemp.enabled && (
                                <div className="grid grid-cols-2 gap-4 pl-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="waterMin">Mínimo (°C)</Label>
                                        <Input
                                            id="waterMin"
                                            type="number"
                                            value={settings.thresholds.waterTemp.min}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                thresholds: {
                                                    ...settings.thresholds,
                                                    waterTemp: { ...settings.thresholds.waterTemp, min: Number(e.target.value) }
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="waterMax">Máximo (°C)</Label>
                                        <Input
                                            id="waterMax"
                                            type="number"
                                            value={settings.thresholds.waterTemp.max}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                thresholds: {
                                                    ...settings.thresholds,
                                                    waterTemp: { ...settings.thresholds.waterTemp, max: Number(e.target.value) }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-4"></div>

                        {/* Air Temp */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Thermometer className="h-4 w-4 text-orange-500" />
                                    <Label className="font-medium">Temperatura del Aire</Label>
                                </div>
                                <Switch
                                    checked={settings.thresholds.airTemp.enabled}
                                    onCheckedChange={(checked) => setSettings({
                                        ...settings,
                                        thresholds: {
                                            ...settings.thresholds,
                                            airTemp: { ...settings.thresholds.airTemp, enabled: checked }
                                        }
                                    })}
                                />
                            </div>
                            {settings.thresholds.airTemp.enabled && (
                                <div className="grid grid-cols-2 gap-4 pl-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="airMin">Mínimo (°C)</Label>
                                        <Input
                                            id="airMin"
                                            type="number"
                                            value={settings.thresholds.airTemp.min}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                thresholds: {
                                                    ...settings.thresholds,
                                                    airTemp: { ...settings.thresholds.airTemp, min: Number(e.target.value) }
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="airMax">Máximo (°C)</Label>
                                        <Input
                                            id="airMax"
                                            type="number"
                                            value={settings.thresholds.airTemp.max}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                thresholds: {
                                                    ...settings.thresholds,
                                                    airTemp: { ...settings.thresholds.airTemp, max: Number(e.target.value) }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-4"></div>

                        {/* Humidity */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wind className="h-4 w-4 text-cyan-500" />
                                    <Label className="font-medium">Humedad Máxima</Label>
                                </div>
                                <Switch
                                    checked={settings.thresholds.humidity.enabled}
                                    onCheckedChange={(checked) => setSettings({
                                        ...settings,
                                        thresholds: {
                                            ...settings.thresholds,
                                            humidity: { ...settings.thresholds.humidity, enabled: checked }
                                        }
                                    })}
                                />
                            </div>
                            {settings.thresholds.humidity.enabled && (
                                <div className="grid grid-cols-1 gap-4 pl-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="humMax">Máximo (%)</Label>
                                        <Input
                                            id="humMax"
                                            type="number"
                                            value={settings.thresholds.humidity.max}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                thresholds: {
                                                    ...settings.thresholds,
                                                    humidity: { ...settings.thresholds.humidity, max: Number(e.target.value) }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Configuración
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    )
}
