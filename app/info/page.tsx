"use client"

import { useState, useEffect } from "react"
import { FileText, HelpCircle, ChevronRight, Download, MessageCircle, Wifi, Cpu, Activity, Clock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DashboardHeader } from "@/components/dashboard-header"
import Link from "next/link"
import { db } from '@/firebase'
import { ref, onValue } from 'firebase/database'
import { useAuth } from "@/contexts/AuthContext"

interface DeviceInfo {
  macAddress: string
  firmwareVersion: string
  lastUpdate: string
  model: string
}

interface SensorStatus {
  rssi: number
  uptime: number
}

const LedStatusItem = ({ color, title, description, animation }: { color: 'green' | 'red', title: string, description: React.ReactNode, animation?: 'pulse' | 'ping' | 'none' }) => (
  <div className="flex items-start gap-4 p-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <div className="mt-1 relative flex h-4 w-4 shrink-0">
      {animation === 'ping' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color === 'red' ? 'bg-red-400' : 'bg-green-400'}`}></span>
      )}
      {animation === 'pulse' && (
        <span className={`animate-pulse absolute inline-flex h-full w-full rounded-full opacity-75 ${color === 'red' ? 'bg-red-400' : 'bg-green-400'}`}></span>
      )}
      <span className={`relative inline-flex rounded-full h-4 w-4 ${color === 'red' ? 'bg-red-500' : 'bg-green-500'}`}></span>
    </div>

    <div>
      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{title}</h4>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>
    </div>
  </div>
)

export default function InfoPage() {
  const { user } = useAuth()
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    macAddress: 'Cargando...',
    firmwareVersion: 'v2.1.5', // Mocked for now or fetch if available
    lastUpdate: new Date().toLocaleDateString(),
    model: 'Arduino Sensor Pro'
  })
  const [sensorStatus, setSensorStatus] = useState<SensorStatus | null>(null)

  useEffect(() => {
    if (!user) return

    // Fetch User Data for MAC
    const userRef = ref(db, `users/${user.uid}`)
    onValue(userRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setDeviceInfo(prev => ({
          ...prev,
          macAddress: data.macAddress || 'No configurada'
        }))
      }
    })

    // Fetch Sensor Status for RSSI/Uptime
    const statusRef = ref(db, 'sensor_status/actual')
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSensorStatus({
          rssi: data.rssi,
          uptime: data.uptime
        })
      }
    })
  }, [user])

  const getSignalQuality = (rssi: number) => {
    if (rssi >= -60) return { text: 'Excelente', color: 'text-green-500' }
    if (rssi >= -80) return { text: 'Aceptable', color: 'text-yellow-500' }
    return { text: 'Débil', color: 'text-red-500' }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <DashboardHeader title="Información" />

      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* Device Health Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-500" />
              Salud del Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="text-muted-foreground flex items-center gap-2"><Wifi className="h-4 w-4" /> Señal WiFi</span>
                <span className={`font-medium ${sensorStatus ? getSignalQuality(sensorStatus.rssi).color : ''}`}>
                  {sensorStatus ? `${sensorStatus.rssi} dBm (${getSignalQuality(sensorStatus.rssi).text})` : '--'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Tiempo Activo</span>
                <span className="font-medium text-foreground">
                  {sensorStatus ? formatUptime(sensorStatus.uptime) : '--'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="text-muted-foreground flex items-center gap-2"><Activity className="h-4 w-4" /> Dirección MAC</span>
                <span className="font-mono text-xs font-medium text-foreground">{deviceInfo.macAddress}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Firmware</span>
                <span className="font-medium text-foreground">{deviceInfo.firmwareVersion}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LED Guide */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-app-blue-light/20">
                <HelpCircle className="h-5 w-5 text-app-blue" />
              </div>
              <div className="font-medium text-foreground">Guía de Indicadores LED</div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <LedStatusItem
                color="green"
                animation="pulse"
                title="Parpadeo Lento (Verde)"
                description="Funcionamiento normal. El dispositivo está enviando datos correctamente."
              />
              <LedStatusItem
                color="red"
                animation="ping"
                title="Parpadeo Rápido (Rojo)"
                description="Error crítico de hardware. Sensor BME280 no detectado al iniciar."
              />
              <LedStatusItem
                color="red"
                animation="none"
                title="Parpadeo Ocasional (Rojo)"
                description="Error momentáneo de lectura en los sensores. Se reintentará automáticamente."
              />
            </div>
          </CardContent>
        </Card>

        {/* Resources & Downloads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Recursos y Descargas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                <FileText className="h-4 w-4 text-blue-500" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Manual de Usuario</span>
                  <span className="text-xs text-muted-foreground">PDF • 2.4 MB</span>
                </div>
                <Download className="h-4 w-4 ml-auto text-muted-foreground" />
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                <Activity className="h-4 w-4 text-blue-500" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Guía de Solución de Problemas</span>
                  <span className="text-xs text-muted-foreground">PDF • 1.1 MB</span>
                </div>
                <Download className="h-4 w-4 ml-auto text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>

          {/* Support & Legal */}
          <div className="space-y-4">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full mb-3">
                  <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">¿Necesitas ayuda técnica?</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">Nuestro equipo de ingenieros está disponible para ayudarte.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Contactar Soporte
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <Link href="/info/terms" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Términos y condiciones</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  )
}
