"use client"

import { useState, useEffect } from "react"
import { Thermometer, Droplet, Wind, Activity, Wifi, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from '@/firebase'
import { ref, onValue } from 'firebase/database'
import { DashboardHeader } from "@/components/dashboard-header"
import PoolScene from "@/components/PoolScene"
import { SENSOR_RANGES } from "@/constants/ranges"

interface Lecturas {
  tempAgua: number
  tempAire: number
  humedadAire: number
  phVoltaje: number
  rssi: number
  uptime: number
}

export default function DashboardPage() {
  const [lecturas, setLecturas] = useState<Lecturas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [sensorActivo, setSensorActivo] = useState<string | null>(null)

  useEffect(() => {
    const lecturasRef = ref(db, 'sensor_status/actual')
    const unsubscribe = onValue(lecturasRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setLecturas(data)
        setLastUpdate(new Date())
        setError(null)
      } else {
        setError('No hay datos disponibles')
      }
      setLoading(false)
    },
      (error) => {
        console.error('Error:', error)
        setError('Error al conectar con la base de datos')
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  const calcularPH = (voltaje: number) => {
    const ph = 7 - (voltaje - 2.5) * 3.5
    return Math.max(0, Math.min(14, ph)).toFixed(1)
  }

  const getSignalQuality = (rssi: number) => {
    if (rssi >= -60) return { text: 'Excelente', color: 'text-green-500', icon: Wifi }
    if (rssi >= -80) return { text: 'Aceptable', color: 'text-yellow-500', icon: Wifi }
    return { text: 'Muy mala', color: 'text-red-500', icon: AlertTriangle }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    return `${minutes}m ${secs}s`
  }

  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick(prev => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const tiempoTranscurrido = () => {
    if (!lastUpdate) return 'Cargando...'
    const segundos = Math.floor((Date.now() - lastUpdate.getTime()) / 1000)
    if (segundos < 60) return `Actualizado hace ${segundos} segundo${segundos !== 1 ? 's' : ''}`
    const minutos = Math.floor(segundos / 60)
    return `Actualizado hace ${minutos} minuto${minutos > 1 ? 's' : ''}`
  }

  const handleCardClick = (sensor: string) => {
    setSensorActivo(sensor)
    setTimeout(() => setSensorActivo(null), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <DashboardHeader title="Mi Dispositivo" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && lecturas && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">Lecturas en tiempo real</h2>
              <p className="text-sm text-muted-foreground">{tiempoTranscurrido()}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 flex flex-col gap-4">

                {/* TEMP AGUA */}
                <div onClick={() => handleCardClick('tempAgua')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                  <Card className={sensorActivo === 'tempAgua' ? 'ring-2 ring-blue-500' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Droplet className="h-4 w-4 mr-2 text-blue-500" /> {SENSOR_RANGES.tempAgua.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{lecturas.tempAgua.toFixed(1)}{SENSOR_RANGES.tempAgua.unit}</div>
                      <p className="text-sm text-muted-foreground">
                        {lecturas.tempAgua < SENSOR_RANGES.tempAgua.min ? '❄️ Fría' : lecturas.tempAgua > SENSOR_RANGES.tempAgua.max ? '🔥 Caliente' : '✅ Óptima'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* TEMP AIRE */}
                <div onClick={() => handleCardClick('tempAire')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                  <Card className={sensorActivo === 'tempAire' ? 'ring-2 ring-orange-500' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Thermometer className="h-4 w-4 mr-2 text-orange-500" /> {SENSOR_RANGES.tempAire.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{lecturas.tempAire.toFixed(1)}{SENSOR_RANGES.tempAire.unit}</div>
                      <p className="text-sm text-muted-foreground">
                        {lecturas.tempAire < SENSOR_RANGES.tempAire.min ? '❄️ Frío' : '✅ Agradable'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* HUMEDAD */}
                <div onClick={() => handleCardClick('humedadAire')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                  <Card className={sensorActivo === 'humedadAire' ? 'ring-2 ring-cyan-500' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Wind className="h-4 w-4 mr-2 text-cyan-500" /> {SENSOR_RANGES.humedadAire.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{lecturas.humedadAire.toFixed(1)}{SENSOR_RANGES.humedadAire.unit}</div>
                      <p className="text-sm text-muted-foreground">
                        {lecturas.humedadAire > SENSOR_RANGES.humedadAire.max ? '💧 Húmedo' : '✅ Normal'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* PH */}
                <div onClick={() => handleCardClick('ph')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                  <Card className={sensorActivo === 'ph' ? 'ring-2 ring-green-500' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-green-500" /> {SENSOR_RANGES.ph.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{calcularPH(lecturas.phVoltaje)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {parseFloat(calcularPH(lecturas.phVoltaje)) < SENSOR_RANGES.ph.min ? '🔴 Ácido' : '✅ Neutro'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

              </div>

              <div className="lg:col-span-2 h-[500px] lg:h-auto">
                <PoolScene sensorActivo={sensorActivo} temperatura={lecturas.tempAgua} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-muted-foreground">Sistema conectado y recibiendo datos.</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const quality = getSignalQuality(lecturas.rssi)
                        const Icon = quality.icon
                        return <Icon className={`h-4 w-4 ${quality.color}`} />
                      })()}
                      <span className="text-sm font-medium">Señal WiFi</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${getSignalQuality(lecturas.rssi).color}`}>
                        {getSignalQuality(lecturas.rssi).text} ({lecturas.rssi} dBm)
                      </span>
                      {lecturas.rssi < -80 && (
                        <p className="text-xs text-red-500">Riesgo de desconexión</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Tiempo Activo</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold">{formatUptime(lecturas.uptime)}</span>
                      {lecturas.uptime < 60 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          Recién Reiniciado
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}