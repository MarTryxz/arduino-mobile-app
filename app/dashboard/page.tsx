"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Thermometer, Droplet, Wind, Activity, Bell, History, Info, Menu, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { UserButton } from '@/components/ui/user-button'
import { db } from '@/firebase'
import { ref, onValue } from 'firebase/database'

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

  // Conectar a Firebase Realtime Database
  useEffect(() => {
    const lecturasRef = ref(db, 'sensor_status/actual')

    const unsubscribe = onValue(
      lecturasRef,
      (snapshot) => {
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
        console.error('Error al leer datos:', error)
        setError('Error al conectar con la base de datos')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Calcular pH desde voltaje (conversión aproximada)
  const calcularPH = (voltaje: number) => {
    // Fórmula aproximada: pH = 7 - (voltaje - 2.5) * 3.5
    // Ajusta esta fórmula según tu sensor específico
    const ph = 7 - (voltaje - 2.5) * 3.5
    return Math.max(0, Math.min(14, ph)).toFixed(1)
  }

  // Estado para actualizar el tiempo transcurrido cada segundo
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Formatear tiempo transcurrido
  const tiempoTranscurrido = () => {
    if (!lastUpdate) return 'Cargando...'
    const segundos = Math.floor((Date.now() - lastUpdate.getTime()) / 1000)
    if (segundos < 60) return `Actualizado hace ${segundos} segundo${segundos !== 1 ? 's' : ''}`
    const minutos = Math.floor(segundos / 60)
    if (minutos < 60) return `Actualizado hace ${minutos} minuto${minutos > 1 ? 's' : ''}`
    const horas = Math.floor(minutos / 60)
    return `Actualizado hace ${horas} hora${horas > 1 ? 's' : ''}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-app-blue text-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex">
          <h1 className="text-xl font-bold">Mi Dispositivo</h1>
          <div className="ml-auto flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <div className="flex items-center gap-2">
                <UserButton />
              </div>
              <SheetContent title="Menu">
                <SheetHeader>
                  <SheetTitle>Menú de navegación</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/dashboard" className="flex items-center gap-2 py-2 font-medium">
                    <Home className="h-5 w-5" />
                    Panel principal
                  </Link>
                  <Link href="/history" className="flex items-center gap-2 py-2">
                    <History className="h-5 w-5" />
                    Historial
                  </Link>
                  <Link href="/alerts" className="flex items-center gap-2 py-2">
                    <Bell className="h-5 w-5" />
                    Alertas
                  </Link>
                  <Link href="/info" className="flex items-center gap-2 py-2">
                    <Info className="h-5 w-5" />
                    Información
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Estado de carga o error */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Cargando datos...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && lecturas && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Lecturas en tiempo real</h2>
              <p className="text-sm text-gray-500">{tiempoTranscurrido()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Temperatura del Agua */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Droplet className="h-4 w-4 mr-2 text-blue-500" />
                    Temperatura del Agua
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{lecturas.tempAgua.toFixed(1)}°C</div>
                  <p className="text-sm text-muted-foreground">
                    {lecturas.tempAgua < 18 ? '❄️ Fría' : lecturas.tempAgua > 28 ? '🔥 Caliente' : '✅ Óptima'}
                  </p>
                </CardContent>
              </Card>

              {/* Temperatura del Aire */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Thermometer className="h-4 w-4 mr-2 text-orange-500" />
                    Temperatura del Aire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{lecturas.tempAire.toFixed(1)}°C</div>
                  <p className="text-sm text-muted-foreground">
                    {lecturas.tempAire < 15 ? '❄️ Frío' : lecturas.tempAire > 30 ? '🔥 Caluroso' : '✅ Agradable'}
                  </p>
                </CardContent>
              </Card>

              {/* Humedad del Aire */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Wind className="h-4 w-4 mr-2 text-cyan-500" />
                    Humedad del Aire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{lecturas.humedadAire.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">
                    {lecturas.humedadAire < 30 ? '🏜️ Seco' : lecturas.humedadAire > 70 ? '💧 Húmedo' : '✅ Normal'}
                  </p>
                </CardContent>
              </Card>

              {/* pH del Agua */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-green-500" />
                    Nivel de pH
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{calcularPH(lecturas.phVoltaje)}</div>
                  <p className="text-sm text-muted-foreground">
                    Voltaje: {lecturas.phVoltaje.toFixed(2)}V
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {parseFloat(calcularPH(lecturas.phVoltaje)) < 7.0 ? '🔴 Ácido' :
                      parseFloat(calcularPH(lecturas.phVoltaje)) > 7.8 ? '🔵 Alcalino' :
                        '✅ Neutro'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Información adicional */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base font-medium">Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Conexión</p>
                    <p className="font-medium text-green-600">● En línea</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Última actualización</p>
                    <p className="font-medium">{lastUpdate?.toLocaleTimeString('es-ES')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
