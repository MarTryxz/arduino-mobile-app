"use client"

import { useState } from "react"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Thermometer,
  Droplet,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Datos simulados para el historial
const generateHistoryData = (days: number, baseValue: number, variance: number) => {
  return Array.from({ length: days })
    .map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return {
        date: date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
        value: +(baseValue + (Math.random() * variance * 2 - variance)).toFixed(1),
      }
    })
    .reverse()
}

import { DashboardHeader } from "@/components/dashboard-header"

export default function HistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [activeTab, setActiveTab] = useState("temperature")

  // Generar datos simulados
  const temperatureData = generateHistoryData(selectedPeriod === "7d" ? 7 : selectedPeriod === "14d" ? 14 : 30, 24.5, 2)

  const phData = generateHistoryData(selectedPeriod === "7d" ? 7 : selectedPeriod === "14d" ? 14 : 30, 7.2, 0.5)

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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-app-blue/10">
            <TabsTrigger value="temperature" className="data-[state=active]:bg-app-blue data-[state=active]:text-white">
              <Thermometer className="h-4 w-4 mr-2" />
              Temperatura
            </TabsTrigger>
            <TabsTrigger value="ph" className="data-[state=active]:bg-app-blue data-[state=active]:text-white">
              <Droplet className="h-4 w-4 mr-2" />
              pH
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temperature" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Historial de temperatura (°C)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-[200px] flex items-end justify-between gap-1">
                    {temperatureData.map((item, index) => {
                      // Normalizar el valor para la altura de la barra (entre 10% y 100%)
                      const normalizedHeight = 10 + ((item.value - 20) / 10) * 90
                      return (
                        <div key={index} className="flex flex-col items-center gap-1 flex-1">
                          <div
                            className="w-full bg-app-red/50 rounded-t-sm relative group"
                            style={{ height: `${normalizedHeight}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.value}°C
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </div>
                    <div className="flex items-center">
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ph" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Historial de pH</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-[200px] flex items-end justify-between gap-1">
                    {phData.map((item, index) => {
                      // Normalizar el valor para la altura de la barra (entre 10% y 100%)
                      const normalizedHeight = 10 + ((item.value - 6) / 2) * 90
                      return (
                        <div key={index} className="flex flex-col items-center gap-1 flex-1">
                          <div
                            className="w-full bg-app-blue-light/50 rounded-t-sm relative group"
                            style={{ height: `${normalizedHeight}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.value}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </div>
                    <div className="flex items-center">
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
