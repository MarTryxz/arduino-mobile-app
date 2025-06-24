"use client"

import Link from "next/link"
import { Home, History, Bell, Info, Menu, AlertTriangle, Thermometer, Wifi, Battery } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Datos simulados para las alertas
const alerts = [
  {
    id: 1,
    type: "temperature",
    message: "Temperatura fuera de rango: 32.5°C",
    date: "01/05/2025",
    time: "14:32",
    icon: Thermometer,
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
  {
    id: 2,
    type: "wifi",
    message: "Conexión Wi-Fi perdida",
    date: "30/04/2025",
    time: "18:45",
    icon: Wifi,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
  },
  {
    id: 3,
    type: "battery",
    message: "Batería baja: 15%",
    date: "29/04/2025",
    time: "09:12",
    icon: Battery,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
  },
]

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-app-blue text-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Alertas</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent title="Menu">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/dashboard" className="flex items-center gap-2 py-2">
                  <Home className="h-5 w-5" />
                  Panel principal
                </Link>
                <Link href="/history" className="flex items-center gap-2 py-2">
                  <History className="h-5 w-5" />
                  Historial
                </Link>
                <Link href="/alerts" className="flex items-center gap-2 py-2 font-medium">
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
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">Alertas recientes</h2>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {alert.type === "temperature" && (
                      <div className={`p-2 rounded-full bg-app-red/20`}>
                        <alert.icon className={`h-5 w-5 text-app-red`} />
                      </div>
                    )}
                    {alert.type === "wifi" && (
                      <div className={`p-2 rounded-full bg-app-red/20`}>
                        <alert.icon className={`h-5 w-5 text-app-red`} />
                      </div>
                    )}
                    {alert.type === "battery" && (
                      <div className={`p-2 rounded-full bg-app-red/20`}>
                        <alert.icon className={`h-5 w-5 text-app-red`} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.date} • {alert.time}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="rounded-full bg-gray-100 p-4 inline-flex mx-auto mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No hay alertas</h3>
            <p className="text-sm text-muted-foreground mt-1">Tu dispositivo está funcionando correctamente</p>
          </div>
        )}
      </main>
    </div>
  )
}
