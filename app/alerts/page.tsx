"use client"

import { useState, useEffect, useMemo } from "react"
import { AlertTriangle, Thermometer, Wifi, Bell, Droplet, Wind, Activity, Settings, Trash2, CheckCircle, Info, Eye, EyeOff, HelpCircle, Sliders } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { db } from '@/firebase'
import { ref, onValue, query, orderByChild, limitToLast, remove } from 'firebase/database'
import { toast } from "sonner"

interface Alert {
  id: string
  type: string
  message: string
  value: number
  timestamp: number
  read: boolean
}

interface ProcessedAlert extends Alert {
  isSuspicious: boolean
  severity: 'critical' | 'warning' | 'info'
}

interface GroupedAlert extends ProcessedAlert {
  count: number
  latestTimestamp: number
  alerts: ProcessedAlert[]
}

const SEVERITY_RULES = {
  tempAgua: {
    critical: { min: 15, max: 35 },
    warning: { min: 24, max: 31 },
    ideal: { min: 26, max: 30 }
  },
  tempAire: {
    critical: { min: 0, max: 45 },
    warning: { min: 10, max: 35 },
    ideal: { min: 20, max: 30 }
  },
  ph: {
    critical: { min: 6, max: 9 },
    warning: { min: 6.5, max: 8.5 },
    ideal: { min: 7.2, max: 7.6 }
  },
  humedadAire: {
    critical: { min: 10, max: 90 },
    warning: { min: 30, max: 70 },
    ideal: { min: 40, max: 60 }
  }
} as const;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuspicious, setShowSuspicious] = useState(false)

  useEffect(() => {
    const alertsRef = query(ref(db, 'alerts'), orderByChild('timestamp'), limitToLast(100))

    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const alertsList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        })).sort((a, b) => b.timestamp - a.timestamp)
        setAlerts(alertsList)
      } else {
        setAlerts([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleClearAlerts = async () => {
    if (confirm('¿Estás seguro de que quieres borrar todas las alertas?')) {
      try {
        await remove(ref(db, 'alerts'))
        toast.success('Alertas borradas correctamente')
      } catch (error) {
        console.error('Error clearing alerts:', error)
        toast.error('Error al borrar las alertas')
      }
    }
  }

  // Process Alerts: Flag Suspicious & Assign Severity
  const processedAlerts = useMemo(() => {
    return alerts.map(alert => {
      let isSuspicious = false
      let severity: 'critical' | 'warning' | 'info' = 'info'

      // Flag Suspicious Data (e.g., 85°C bug)
      if (alert.type === 'tempAgua' || alert.type === 'tempAire') {
        if (alert.value > 50 || alert.value < -10) {
          isSuspicious = true
        }
      }

      // Determine Severity
      const rules = SEVERITY_RULES[alert.type as keyof typeof SEVERITY_RULES]
      if (rules) {
        if (alert.value < rules.critical.min || alert.value > rules.critical.max) {
          severity = 'critical'
        } else if (alert.value < rules.warning.min || alert.value > rules.warning.max) {
          severity = 'warning'
        }
      } else if (alert.type === 'rssi') {
        if (alert.value < -80) severity = 'warning'
        if (alert.value < -90) severity = 'critical'
      }

      return { ...alert, isSuspicious, severity }
    })
  }, [alerts])

  // Group Alerts
  const groupedAlerts = useMemo(() => {
    const TIME_WINDOW = 15 * 60 * 1000 // 15 minutes
    const filtered = showSuspicious ? processedAlerts : processedAlerts.filter(a => !a.isSuspicious)

    return filtered.reduce((groups, alert) => {
      const existingGroup = groups.find(g =>
        g.type === alert.type &&
        g.message === alert.message &&
        Math.abs(g.latestTimestamp - alert.timestamp) < TIME_WINDOW
      )

      if (existingGroup) {
        existingGroup.count++
        // Keep the latest timestamp for sorting/display
        if (alert.timestamp > existingGroup.latestTimestamp) {
          existingGroup.latestTimestamp = alert.timestamp
        }
        existingGroup.alerts.push(alert)
      } else {
        groups.push({
          ...alert,
          count: 1,
          latestTimestamp: alert.timestamp,
          alerts: [alert]
        })
      }
      return groups
    }, [] as GroupedAlert[])
  }, [processedAlerts, showSuspicious])

  const getIcon = (type: string) => {
    switch (type) {
      case 'tempAgua': return Droplet
      case 'tempAire': return Thermometer
      case 'humedadAire': return Wind
      case 'ph': return Activity
      case 'rssi': return Wifi
      default: return AlertTriangle
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
      case 'warning': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
    }
  }

  const getIconColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
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
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        <DashboardHeader title="Alertas" />

        <main className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium text-foreground">Centro de Alertas</h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <Switch
                  id="show-suspicious"
                  checked={showSuspicious}
                  onCheckedChange={setShowSuspicious}
                />
                <Label htmlFor="show-suspicious" className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  {showSuspicious ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  Mostrar lecturas dudosas
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Muestra alertas generadas por posibles fallos del sensor (ej. &gt;50°C) que han sido descartadas del análisis principal.</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {alerts.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2 ml-auto sm:ml-0"
                  onClick={handleClearAlerts}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Borrar todo</span>
                </Button>
              )}
              <Link href="/alerts/settings">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Configuración</span>
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            </div>
          ) : groupedAlerts.length > 0 ? (
            <div className="space-y-4">
              {groupedAlerts.map((alert) => {
                const Icon = getIcon(alert.type)
                const { date, time } = formatDate(alert.latestTimestamp)
                const severityClass = getSeverityColor(alert.severity)
                const iconClass = getIconColor(alert.severity)

                // Dynamic Title and Description for Suspicious Alerts
                const title = alert.isSuspicious
                  ? "Posible fallo de sensor"
                  : alert.severity === 'critical' ? 'Crítico' : alert.severity === 'warning' ? 'Advertencia' : 'Información'

                const description = alert.isSuspicious
                  ? `Lectura anómala detectada: ${alert.value}°C. Valor físicamente improbable.`
                  : alert.message

                return (
                  <Card key={alert.id} className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${severityClass}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-2.5 rounded-full shrink-0 ${iconClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                              {title}
                            </h4>
                            {alert.isSuspicious && (
                              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase border border-orange-200">
                                Sospechoso
                              </span>
                            )}
                            {alert.count > 1 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-help">
                                    {alert.count} eventos
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">
                                    <p className="font-semibold mb-1">Historial reciente:</p>
                                    <ul className="list-disc pl-3 space-y-0.5">
                                      {alert.alerts.slice(0, 5).map((a, i) => (
                                        <li key={i}>{new Date(a.timestamp).toLocaleTimeString()}</li>
                                      ))}
                                      {alert.count > 5 && <li>... y {alert.count - 5} más</li>}
                                    </ul>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>

                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {description}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{time}</span>
                            <span>•</span>
                            <span>{date}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <Link href="/alerts/settings">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Configurar umbrales">
                              <Sliders className="h-4 w-4" />
                            </Button>
                          </Link>
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
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Todo en orden</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                No hay alertas activas {showSuspicious ? "" : "(las alertas sospechosas están ocultas)"}.
              </p>
            </div>
          )}
        </main>
      </div>
    </TooltipProvider>
  )
}
