"use client"

import { useState, useEffect } from "react"
import { Thermometer, Droplet, Wind, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from '@/firebase'
import { ref, onValue } from 'firebase/database'

// Asegúrate de que la ruta de importación sea correcta según tu estructura
import { DashboardHeader } from "@/components/dashboard-header"
import PoolScene from "@/components/PoolScene"

interface Lecturas {
  tempAgua: number
  tempAire: number
  humedadAire: number
  phVoltaje: number
}

export default function DashboardPage() {
  const [lecturas, setLecturas] = useState<Lecturas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Estado para controlar la animación 3D
  const [sensorActivo, setSensorActivo] = useState<string | null>(null)

  // Conectar a Firebase
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

  // Calcular pH
  const calcularPH = (voltaje: number) => {
    const ph = 7 - (voltaje - 2.5) * 3.5
    return Math.max(0, Math.min(14, ph)).toFixed(1)
  }

  // Reloj de actualización ("hace X segundos")
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

  // Manejador del click para la animación
  const handleCardClick = (sensor: string) => {
    setSensorActivo(sensor)
    // Resetea a null después de 1.5 segundos para que la cámara "vuelva"
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
              {/* COLUMNA IZQUIERDA: Tarjetas */}
              <div className="lg:col-span-1 flex flex-col gap-4">

                {/* TARJETA TEMP AGUA */}
                <div onClick={() => handleCardClick('tempAgua')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                  <Card className={sensorActivo === 'tempAgua' ? 'ring-2 ring-blue-500' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Droplet className="h-4 w-4 mr-2 text-blue-500" /> Temperatura del Agua
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{lecturas.tempAgua.toFixed(1)}°C</div>
                      <p className="text-sm text-muted-foreground">
                        {lecturas.tempAgua < 18 ? '❄️ Fría' : lecturas.tempAgua > 28 ? '🔥 Caliente' : '✅ Óptima'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* TARJETA TEMP AIRE */}
                <div onClick={() => handleCardClick('tempAire')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                  <Card className={sensorActivo === 'tempAire' ? 'ring-2 ring-orange-500' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Thermometer className="h-4 w-4 mr-2 text-orange-500" /> Temperatura del Aire
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{lecturas.tempAire.toFixed(1)}°C</div>
                      <p className="text-sm text-muted-foreground">
                        {lecturas.tempAire < 15 ? '❄️ Frío' : '✅ Agradable'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* TARJETA HUMEDAD */}
                <div onClick={() => handleCardClick('humedadAire')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                  <Card className={sensorActivo === 'humedadAire' ? 'ring-2 ring-cyan-500' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Wind className="h-4 w-4 mr-2 text-cyan-500" /> Humedad del Aire
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{lecturas.humedadAire.toFixed(1)}%</div>
                      <p className="text-sm text-muted-foreground">
                        {lecturas.humedadAire > 70 ? '💧 Húmedo' : '✅ Normal'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* TARJETA PH */}
                <div onClick={() => handleCardClick('ph')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                  <Card className={sensorActivo === 'ph' ? 'ring-2 ring-green-500' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-green-500" /> Nivel de pH
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{calcularPH(lecturas.phVoltaje)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {parseFloat(calcularPH(lecturas.phVoltaje)) < 7.0 ? '🔴 Ácido' : '✅ Neutro'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

              </div>

              {/* COLUMNA DERECHA: Escena 3D */}
              <div className="lg:col-span-2 h-[500px] lg:h-auto">
                <PoolScene sensorActivo={sensorActivo} />
              </div>
            </div>

            {/* Estado de conexión */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-muted-foreground">Sistema conectado y recibiendo datos en tiempo real.</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}