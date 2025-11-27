"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Thermometer,
  Droplet,
  Wind,
  Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { db } from '@/firebase'
import { ref, onValue, query, limitToLast } from 'firebase/database'

interface HistoryDataPoint {
  date: string
  value: number
  timestamp: number
}

export default function HistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [activeTab, setActiveTab] = useState("water-temp")

  const [waterTempData, setWaterTempData] = useState<HistoryDataPoint[]>([])
  const [airTempData, setAirTempData] = useState<HistoryDataPoint[]>([])
  const [humidityData, setHumidityData] = useState<HistoryDataPoint[]>([])
  const [phData, setPhData] = useState<HistoryDataPoint[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const historyRef = ref(db, 'sensor_status/historial')
    const q = query(historyRef, limitToLast(100))

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const waterPoints: HistoryDataPoint[] = []
        const airPoints: HistoryDataPoint[] = []
        const humidityPoints: HistoryDataPoint[] = []
        const phPoints: HistoryDataPoint[] = []

        Object.entries(data).forEach(([key, value]: [string, any]) => {
          // Try to get timestamp from value or key
          let timestamp = value.timestamp || value.time || Date.now(); // Fallback if missing

          // If key looks like a timestamp, use it
          if (!value.timestamp && !value.time && !isNaN(Number(key))) {
            timestamp = Number(key);
          }

          const date = new Date(timestamp).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })

          // Water Temperature
          if (value.tempAgua !== undefined) {
            waterPoints.push({
              date,
              value: Number(value.tempAgua),
              timestamp
            })
          }

          // Air Temperature
          if (value.tempAire !== undefined) {
            airPoints.push({
              date,
              value: Number(value.tempAire),
              timestamp
            })
          }

          // Humidity
          if (value.humedadAire !== undefined) {
            humidityPoints.push({
              date,
              value: Number(value.humedadAire),
              timestamp
            })
          }

          // pH
          if (value.phVoltaje !== undefined) {
            // Calculate pH from voltage
            const ph = 7 - (Number(value.phVoltaje) - 2.5) * 3.5
            const phValue = Math.max(0, Math.min(14, ph))

            phPoints.push({
              date,
              value: Number(phValue.toFixed(1)),
              timestamp
            })
          }
        })

        // Sort by timestamp
        const sortByTime = (a: HistoryDataPoint, b: HistoryDataPoint) => a.timestamp - b.timestamp

        waterPoints.sort(sortByTime)
        airPoints.sort(sortByTime)
        humidityPoints.sort(sortByTime)
        phPoints.sort(sortByTime)

        setWaterTempData(waterPoints)
        setAirTempData(airPoints)
        setHumidityData(humidityPoints)
        setPhData(phPoints)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [selectedPeriod])

  // Helper to render chart
  const renderChart = (data: HistoryDataPoint[], unit: string, colorFrom: string, colorTo: string, minVal: number, maxVal: number, title: string) => {
    if (data.length === 0) {
      return <div className="text-center py-12 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">No hay datos disponibles para {title}</div>
    }

    return (
      <div className="space-y-6">
        {/* Chart Container with Grid Background */}
        <div className="h-[300px] relative bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-800 p-4">
          {/* Grid Lines (Visual only) */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
            <div className="w-full h-px bg-slate-400"></div>
            <div className="w-full h-px bg-slate-400"></div>
            <div className="w-full h-px bg-slate-400"></div>
            <div className="w-full h-px bg-slate-400"></div>
            <div className="w-full h-px bg-slate-400"></div>
          </div>

          <div className="h-full flex items-end justify-between gap-2 overflow-x-auto pb-2 relative z-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {data.map((item, index) => {
              // Normalize height between 10% and 100%
              const range = maxVal - minVal || 1; // Avoid division by zero
              const normalizedHeight = Math.max(10, Math.min(100, 10 + ((item.value - minVal) / range) * 90))

              return (
                <div key={index} className="flex flex-col items-center gap-2 min-w-[24px] flex-1 group h-full justify-end">
                  <div
                    className={`w-full bg-gradient-to-t ${colorFrom} ${colorTo} rounded-t-lg relative transition-all duration-500 ease-out hover:scale-y-105 hover:brightness-110 shadow-md hover:shadow-lg cursor-pointer`}
                    style={{
                      height: `${normalizedHeight}%`,
                      animation: `growUp 0.5s ease-out ${index * 0.02}s backwards`
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 whitespace-nowrap shadow-xl pointer-events-none -translate-y-2 group-hover:translate-y-0">
                      {item.value}{unit}
                      <div className="text-[10px] font-normal text-slate-300 mt-0.5">{item.date}</div>
                      {/* Arrow */}
                      <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  </div>

                  {/* Show date only for some items to avoid clutter */}
                  {index % Math.ceil(data.length / 6) === 0 && (
                    <span className="text-[10px] font-medium text-muted-foreground truncate w-full text-center">{item.date.split(',')[0]}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <style jsx global>{`
            @keyframes growUp {
                from { height: 0%; opacity: 0; }
                to { opacity: 1; }
            }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <DashboardHeader title="Historial" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Datos históricos</h2>
          </div>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="14d">14 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-app-blue/10 h-auto">
              <TabsTrigger value="water-temp" className="data-[state=active]:bg-app-blue data-[state=active]:text-white py-2">
                <Droplet className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Temp. Agua</span>
                <span className="sm:hidden">Agua</span>
              </TabsTrigger>
              <TabsTrigger value="air-temp" className="data-[state=active]:bg-app-blue data-[state=active]:text-white py-2">
                <Thermometer className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Temp. Aire</span>
                <span className="sm:hidden">Aire</span>
              </TabsTrigger>
              <TabsTrigger value="humidity" className="data-[state=active]:bg-app-blue data-[state=active]:text-white py-2">
                <Wind className="h-4 w-4 mr-2" />
                Humedad
              </TabsTrigger>
              <TabsTrigger value="ph" className="data-[state=active]:bg-app-blue data-[state=active]:text-white py-2">
                <Activity className="h-4 w-4 mr-2" />
                pH
              </TabsTrigger>
            </TabsList>

            <TabsContent value="water-temp" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Temperatura del Agua (°C)</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderChart(waterTempData, "°C", "from-blue-500", "to-cyan-400", 10, 40, "Temperatura del Agua")}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="air-temp" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Temperatura del Aire (°C)</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderChart(airTempData, "°C", "from-orange-500", "to-amber-300", 0, 40, "Temperatura del Aire")}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="humidity" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Humedad del Aire (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderChart(humidityData, "%", "from-cyan-500", "to-blue-300", 0, 100, "Humedad")}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ph" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Nivel de pH</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderChart(phData, "", "from-green-500", "to-emerald-300", 0, 14, "pH")}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
