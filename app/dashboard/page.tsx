"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Thermometer, Droplet, Wifi, Bluetooth, Bell, History, Info, Menu, Home, Battery } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'


export default function DashboardPage() {
  const [temperature, setTemperature] = useState(24.5)
  const [ph, setPh] = useState(7.2)
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [wifiStrength, setWifiStrength] = useState(75)
  const [bluetoothConnected, setBluetoothConnected] = useState(true)

  // Simulación de datos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature((prev) => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1))
      setPh((prev) => +(prev + (Math.random() * 0.2 - 0.1)).toFixed(1))
      setBatteryLevel((prev) => Math.max(0, Math.min(100, prev - Math.random() * 0.5)))
      setWifiStrength((prev) => Math.max(0, Math.min(100, prev + (Math.random() * 10 - 5))))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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
                <SignedOut>
                  <SignInButton mode="modal" />
                  <SignUpButton mode="modal" />
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
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
        <h2 className="text-lg font-medium">Lecturas en tiempo real</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Thermometer className="h-4 w-4 mr-2 text-app-red" />
                Temperatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{temperature}°C</div>
              <p className="text-sm text-muted-foreground">Actualizado hace 5 segundos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Droplet className="h-4 w-4 mr-2 text-app-blue-light" />
                Nivel de pH
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ph}</div>
              <p className="text-sm text-muted-foreground">Actualizado hace 5 segundos</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-lg font-medium pt-4">Estado del dispositivo</h2>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Battery className="h-4 w-4 mr-2 text-app-green" />
                  <span>Batería</span>
                </div>
                <span className="font-medium">{batteryLevel.toFixed(0)}%</span>
              </div>
              <Progress value={batteryLevel} className="h-2 bg-app-gray-light [&>div]:bg-app-green" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Wifi className="h-4 w-4 mr-2 text-app-blue-light" />
                  <span>Señal Wi-Fi</span>
                </div>
                <span className="font-medium">{wifiStrength.toFixed(0)}%</span>
              </div>
              <Progress value={wifiStrength} className="h-2 bg-app-gray-light [&>div]:bg-app-blue-light" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bluetooth className="h-4 w-4 mr-2 text-app-blue-light" />
                  <span>Bluetooth</span>
                </div>
                <span className={`font-medium ${bluetoothConnected ? "text-app-green" : "text-app-red"}`}>
                  {bluetoothConnected ? "Conectado" : "Desconectado"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
