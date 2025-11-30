"use client"

import { useState, useEffect } from "react"
import { ref, onValue } from "firebase/database"
import { db } from "@/firebase"
import { Thermometer, Droplet, Wind, Activity, Wifi, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic'

const PoolScene = dynamic(() => import("@/components/PoolScene"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] lg:h-full min-h-[400px] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 shadow-inner flex items-center justify-center text-slate-500">
            <div className="animate-pulse">Cargando 3D...</div>
        </div>
    ),
})

interface Props {
    token: string
}

export function SharedDashboardClient({ token }: Props) {
    const [valid, setValid] = useState<boolean | null>(null)
    const [lecturas, setLecturas] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [sensorActivo, setSensorActivo] = useState<string | null>(null)

    useEffect(() => {
        // 1. Validate Token
        const linkRef = ref(db, `shared_links/${token}`)
        const unsubscribeLink = onValue(linkRef, (snapshot) => {
            if (snapshot.exists()) {
                setValid(true)
                // 2. If valid, fetch sensor data
                const sensorRef = ref(db, 'sensor_status/actual')
                onValue(sensorRef, (sensorSnap) => {
                    setLecturas(sensorSnap.val())
                    setLoading(false)
                })
            } else {
                setValid(false)
                setLoading(false)
            }
        })
        return () => unsubscribeLink()
    }, [token])

    const handleCardClick = (sensor: string) => {
        setSensorActivo(sensor)
        setTimeout(() => setSensorActivo(null), 1500)
    }

    const calcularPH = (voltaje: number) => {
        const ph = 7 - (voltaje - 2.5) * 3.5
        return Math.max(0, Math.min(14, ph)).toFixed(1)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (valid === false) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
                <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Enlace no válido o expirado</h1>
                <p className="text-slate-400 text-center">El enlace que intentas acceder no existe o ha sido revocado por el propietario.</p>
            </div>
        )
    }

    if (!lecturas) return null

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Kiosk Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Wifi className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none">Monitor de Piscina</h1>
                        <p className="text-xs text-slate-400">Vista de Invitado • En Vivo</p>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-2xl font-bold text-blue-400">{lecturas.tempAgua.toFixed(1)}°C</div>
                    <div className="text-xs text-slate-500">Temp. Agua</div>
                </div>
            </header>

            <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col lg:flex-row gap-6">
                {/* Left Column: Sensors */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-1 gap-4 content-start">
                    {/* Water Temp */}
                    <Card
                        className={`bg-slate-900 border-slate-800 cursor-pointer transition-all ${sensorActivo === 'tempAgua' ? 'ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}
                        onClick={() => handleCardClick('tempAgua')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                                <Droplet className="h-4 w-4 mr-2 text-blue-500" /> Agua
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{lecturas.tempAgua.toFixed(1)}°C</div>
                            <p className="text-xs text-blue-400 mt-1">
                                {lecturas.tempAgua < 22 ? 'Fría' : lecturas.tempAgua > 30 ? 'Caliente' : 'Ideal'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Air Temp */}
                    <Card
                        className={`bg-slate-900 border-slate-800 cursor-pointer transition-all ${sensorActivo === 'tempAire' ? 'ring-2 ring-orange-500' : 'hover:bg-slate-800'}`}
                        onClick={() => handleCardClick('tempAire')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                                <Thermometer className="h-4 w-4 mr-2 text-orange-500" /> Aire
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{lecturas.tempAire.toFixed(1)}°C</div>
                        </CardContent>
                    </Card>

                    {/* Humidity */}
                    <Card
                        className={`bg-slate-900 border-slate-800 cursor-pointer transition-all ${sensorActivo === 'humedadAire' ? 'ring-2 ring-cyan-500' : 'hover:bg-slate-800'}`}
                        onClick={() => handleCardClick('humedadAire')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                                <Wind className="h-4 w-4 mr-2 text-cyan-500" /> Humedad
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{lecturas.humedadAire.toFixed(1)}%</div>
                        </CardContent>
                    </Card>

                    {/* pH */}
                    <Card
                        className={`bg-slate-900 border-slate-800 cursor-pointer transition-all ${sensorActivo === 'ph' ? 'ring-2 ring-green-500' : 'hover:bg-slate-800'}`}
                        onClick={() => handleCardClick('ph')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                                <Activity className="h-4 w-4 mr-2 text-green-500" /> pH
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{calcularPH(lecturas.phVoltaje)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: 3D Scene (Takes more space in Kiosk mode) */}
                <div className="lg:flex-[3] h-[400px] lg:h-auto bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative">
                    <PoolScene sensorActivo={sensorActivo} temperatura={lecturas.tempAgua} />

                    {/* Overlay Info */}
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs text-slate-300">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3 w-3" />
                            <span>Actualizado hace instantes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wifi className="h-3 w-3" />
                            <span>Señal: {lecturas.rssi} dBm</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
