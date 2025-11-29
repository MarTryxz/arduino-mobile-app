"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Thermometer, Wifi, Battery, Bell, Droplet, Wind, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { db } from '@/firebase'
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database'

interface Alert {
  id: string
  type: string
  message: string
  value: number
  timestamp: number
  read: boolean
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const alertsRef = query(ref(db, 'alerts'), orderByChild('timestamp'), limitToLast(50))

    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const alertsList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        })).sort((a, b) => b.timestamp - a.timestamp) // Sort descending
        setAlerts(alertsList)
      } else {
        setAlerts([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'tempAgua':
        return Droplet
      case 'tempAire':
        return Thermometer
      case 'humedadAire':
        return Wind
      case 'ph':
        return Activity
      case 'rssi':
        return Wifi
      default:
        return AlertTriangle
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <DashboardHeader title="Alertas" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium text-foreground">Alertas recientes</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const Icon = getIcon(alert.type)
              const { date, time } = formatDate(alert.timestamp)

              return (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-red-100 dark:bg-red-900/20`}>
                        <Icon className={`h-5 w-5 text-red-500`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{alert.message}</div>
                        <div className="text-sm text-muted-foreground">
                          {date} • {time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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
