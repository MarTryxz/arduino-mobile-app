"use client"

import { AlertTriangle, Thermometer, Wifi, Battery, Bell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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

import { DashboardHeader } from "@/components/dashboard-header"

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <DashboardHeader title="Alertas" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium text-foreground">Alertas recientes</h2>
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
                      <div className="font-medium text-foreground">{alert.message}</div>
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
            <div className="rounded-full bg-gray-100 dark:bg-slate-800 p-4 inline-flex mx-auto mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No hay alertas</h3>
            <p className="text-sm text-muted-foreground mt-1">Tu dispositivo está funcionando correctamente</p>
          </div>
        )}
      </main>
    </div>
  )
}
