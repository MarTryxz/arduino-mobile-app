"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Calendar,
  Thermometer,
  Droplet,
  Wind,
  Activity,
  Download,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { PremiumModal } from "@/components/premium-modal"
import { useAuth } from "@/contexts/AuthContext"
import { db } from '@/firebase'
import { ref, onValue, query, limitToLast } from 'firebase/database'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Brush
} from 'recharts'

interface HistoryDataPoint {
  date: string
  value: number
  timestamp: number
}

interface ExportDataPoint {
  date: string
  timestamp: number
  tempAgua?: number
  tempAire?: number
  humedadAire?: number
  ph?: number
}

interface KPIData {
  min: number
  max: number
  avg: number
  trend: number
}

// Helper to filter outliers (e.g., 85°C error or -127°C disconnect)
const isValidValue = (value: number) => {
  return value < 50 && value > -10
}

// Helper to downsample data for performance
const downsampleData = (data: HistoryDataPoint[], targetPoints: number = 700) => {
  if (data.length <= targetPoints) return data

  const blockSize = Math.ceil(data.length / targetPoints)
  const downsampled: HistoryDataPoint[] = []

  for (let i = 0; i < data.length; i += blockSize) {
    const chunk = data.slice(i, i + blockSize)
    const avgValue = chunk.reduce((sum, item) => sum + item.value, 0) / chunk.length
    // Use the timestamp of the middle item
    const midItem = chunk[Math.floor(chunk.length / 2)]

    downsampled.push({
      ...midItem,
      value: Number(avgValue.toFixed(2))
    })
  }

  return downsampled
}

const calculateKPIs = (data: HistoryDataPoint[]): KPIData | null => {
  if (data.length === 0) return null

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length

  // Calculate trend (last 20% vs first 20%)
  const splitIndex = Math.floor(data.length * 0.2)
  const startAvg = data.slice(0, splitIndex).reduce((sum, d) => sum + d.value, 0) / splitIndex
  const endAvg = data.slice(-splitIndex).reduce((sum, d) => sum + d.value, 0) / splitIndex
  const trend = endAvg - startAvg

  return { min, max, avg, trend }
}

const KPICards = ({ kpi, unit }: { kpi: KPIData | null, unit: string }) => {
  if (!kpi) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-slate-50 dark:bg-slate-900/50 border-none shadow-sm">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Mínima</div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">
            {kpi.min.toFixed(1)}{unit}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-50 dark:bg-slate-900/50 border-none shadow-sm">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Máxima</div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">
            {kpi.max.toFixed(1)}{unit}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-50 dark:bg-slate-900/50 border-none shadow-sm">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Promedio</div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">
            {kpi.avg.toFixed(1)}{unit}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-50 dark:bg-slate-900/50 border-none shadow-sm">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Tendencia</div>
          <div className={`text-2xl font-bold flex items-center gap-1 ${kpi.trend > 0 ? 'text-green-500' : kpi.trend < 0 ? 'text-red-500' : 'text-slate-500'}`}>
            {kpi.trend > 0.1 ? <TrendingUp className="h-5 w-5" /> : kpi.trend < -0.1 ? <TrendingDown className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
            {Math.abs(kpi.trend).toFixed(1)}{unit}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const HistoryChart = ({
  data,
  unit,
  color,
  title,
  idealMin,
  idealMax,
  domain
}: {
  data: HistoryDataPoint[],
  unit: string,
  color: string,
  title: string,
  idealMin?: number,
  idealMax?: number,
  domain?: [number | 'auto' | 'dataMin' | string, number | 'auto' | 'dataMax' | string]
}) => {
  if (data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">No hay datos disponibles para {title}</div>
  }

  const kpis = useMemo(() => calculateKPIs(data), [data])

  return (
    <div className="space-y-6">
      <KPICards kpi={kpis} unit={unit} />

      <div className="h-[400px] w-full bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-800 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              minTickGap={50}
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
            />
            <YAxis
              domain={domain || ['auto', 'auto']}
              tickFormatter={(val) => val.toFixed(1)}
              width={40}
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              labelFormatter={(ts) => new Date(ts).toLocaleString()}
              formatter={(value: number) => [`${value.toFixed(2)}${unit}`, title]}
            />

            {idealMin !== undefined && idealMax !== undefined && (
              <ReferenceArea y1={idealMin} y2={idealMax} fill="green" fillOpacity={0.05} strokeOpacity={0} />
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fillOpacity={1}
              fill={`url(#color${title})`}
              strokeWidth={2}
            />
            <Brush
              dataKey="timestamp"
              height={30}
              stroke={color}
              tickFormatter={() => ""}
              fill="var(--background)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [activeTab, setActiveTab] = useState("water-temp")

  const [waterTempData, setWaterTempData] = useState<HistoryDataPoint[]>([])
  const [airTempData, setAirTempData] = useState<HistoryDataPoint[]>([])
  const [humidityData, setHumidityData] = useState<HistoryDataPoint[]>([])
  const [phData, setPhData] = useState<HistoryDataPoint[]>([])
  const [fullHistoryData, setFullHistoryData] = useState<ExportDataPoint[]>([])

  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [role, setRole] = useState<string | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  useEffect(() => {
    if (!user) return

    const roleRef = ref(db, `users/${user.uid}/role`)
    const unsubscribe = onValue(roleRef, (snapshot) => {
      setRole(snapshot.val())
    })

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    // Determine limit based on period (approximate points per day * days)
    // Assuming 1 point every 5 mins = 288 points/day
    let limit = 2000 // Default for 7d
    if (selectedPeriod === "14d") limit = 4000
    if (selectedPeriod === "30d") limit = 9000

    const historyRef = ref(db, 'sensor_status/historial')
    const q = query(historyRef, limitToLast(limit))

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const waterPoints: HistoryDataPoint[] = []
        const airPoints: HistoryDataPoint[] = []
        const humidityPoints: HistoryDataPoint[] = []
        const phPoints: HistoryDataPoint[] = []
        const exportPoints: ExportDataPoint[] = []

        Object.entries(data).forEach(([key, value]: [string, any]) => {
          let timestamp = value.timestamp || value.time || Date.now();
          if (!value.timestamp && !value.time && !isNaN(Number(key))) {
            timestamp = Number(key);
          }

          // Filter by selected period
          const now = Date.now()
          const days = parseInt(selectedPeriod)
          if (now - timestamp > days * 24 * 60 * 60 * 1000) return

          const date = new Date(timestamp).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })

          const exportPoint: ExportDataPoint = {
            date,
            timestamp,
            tempAgua: value.tempAgua,
            tempAire: value.tempAire,
            humedadAire: value.humedadAire,
            ph: undefined
          }

          // Water Temperature
          if (value.tempAgua !== undefined && isValidValue(Number(value.tempAgua))) {
            waterPoints.push({ date, value: Number(value.tempAgua), timestamp })
          }

          // Air Temperature
          if (value.tempAire !== undefined && isValidValue(Number(value.tempAire))) {
            airPoints.push({ date, value: Number(value.tempAire), timestamp })
          }

          // Humidity
          if (value.humedadAire !== undefined && Number(value.humedadAire) >= 0 && Number(value.humedadAire) <= 100) {
            humidityPoints.push({ date, value: Number(value.humedadAire), timestamp })
          }

          // pH
          if (value.phVoltaje !== undefined) {
            const ph = 7 - (Number(value.phVoltaje) - 2.5) * 3.5
            const phValue = Math.max(0, Math.min(14, ph))
            const finalPh = Number(phValue.toFixed(2))

            phPoints.push({ date, value: finalPh, timestamp })
            exportPoint.ph = finalPh
          }

          exportPoints.push(exportPoint)
        })

        const sortByTime = (a: { timestamp: number }, b: { timestamp: number }) => a.timestamp - b.timestamp

        // Downsample if needed (e.g. for 30 days)
        const targetPoints = 700 // Target max points for chart performance

        setWaterTempData(downsampleData(waterPoints.sort(sortByTime), targetPoints))
        setAirTempData(downsampleData(airPoints.sort(sortByTime), targetPoints))
        setHumidityData(downsampleData(humidityPoints.sort(sortByTime), targetPoints))
        setPhData(downsampleData(phPoints.sort(sortByTime), targetPoints))
        setFullHistoryData(exportPoints.sort(sortByTime))
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [selectedPeriod])

  const handleExportCSV = () => {
    const isPremium = role === 'cliente_premium' || role === 'admin'

    if (!isPremium) {
      setShowPremiumModal(true)
      return
    }

    if (fullHistoryData.length === 0) return

    const headers = ["Fecha", "Temperatura Agua (°C)", "Temperatura Aire (°C)", "Humedad (%)", "pH"]
    const rows = fullHistoryData.map(point => {
      const dateObj = new Date(point.timestamp)
      const formattedDate = dateObj.getFullYear() + "-" +
        String(dateObj.getMonth() + 1).padStart(2, '0') + "-" +
        String(dateObj.getDate()).padStart(2, '0') + " " +
        String(dateObj.getHours()).padStart(2, '0') + ":" +
        String(dateObj.getMinutes()).padStart(2, '0') + ":" +
        String(dateObj.getSeconds()).padStart(2, '0')

      return [
        formattedDate,
        point.tempAgua ?? "",
        point.tempAire ?? "",
        point.humedadAire ?? "",
        point.ph ?? ""
      ].join(",")
    })

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `historial_sensores_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

          <Button
            variant="outline"
            size="sm"
            className="ml-2 gap-2 hidden sm:flex"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="ml-2 sm:hidden"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {
          loading ? (
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
                    <HistoryChart
                      data={waterTempData}
                      unit="°C"
                      color="#0ea5e9" // Blue
                      title="Temperatura del Agua"
                      idealMin={26}
                      idealMax={30}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="air-temp" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Temperatura del Aire (°C)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HistoryChart
                      data={airTempData}
                      unit="°C"
                      color="#f97316" // Orange
                      title="Temperatura del Aire"
                      idealMin={20}
                      idealMax={30}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="humidity" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Humedad del Aire (%)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HistoryChart
                      data={humidityData}
                      unit="%"
                      color="#6366f1" // Indigo
                      title="Humedad"
                      idealMin={40}
                      idealMax={60}
                      domain={[0, 100]}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ph" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Nivel de pH</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HistoryChart
                      data={phData}
                      unit=""
                      color="#22c55e" // Green
                      title="pH"
                      idealMin={7.2}
                      idealMax={7.6}
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )
        }
      </main >
      <PremiumModal open={showPremiumModal} onOpenChange={setShowPremiumModal} />
    </div >
  )
}
