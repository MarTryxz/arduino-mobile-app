"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, MapPin } from "lucide-react"
import { getWeatherForecast, getWeatherIcon, getWeatherDescription, DEFAULT_LOCATION, WeatherData } from "@/lib/weather"

interface SwimAnalysisProps {
    waterTemp: number
}

export function SwimAnalysis({ waterTemp }: SwimAnalysisProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    const [locationName, setLocationName] = useState("Ubicación actual")

    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            const data = await getWeatherForecast(lat, lon)
            setWeather(data)
            setLoading(false)
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude)
                },
                (error) => {
                    console.log("Geolocation denied/error, using default:", error)
                    setLocationName("Santiago (Default)")
                    fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon)
                }
            )
        } else {
            setLocationName("Santiago (Default)")
            fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon)
        }
    }, [])

    const getAnalysis = () => {
        if (!weather) return "Analizando condiciones..."

        // 1. Check Weather Warnings
        if (weather.current.weatherCode >= 71) return "❄️ Se espera nieve. Cubre la piscina."
        if (weather.current.weatherCode >= 51) return "🌧️ Lluvia detectada. No es buen momento."
        if (weather.daily.minTemp <= 0) return "🥶 Alerta de helada. Protege el sistema."

        // 2. Check Water Temperature (Psychological Constants)
        if (waterTemp >= 30) return "🔥 ¡Agua muy caliente! Tipo Jacuzzi."
        if (waterTemp >= 26) return "🏊 ¡Condiciones perfectas! Disfruta el nado."
        if (waterTemp >= 22) {
            // If water is "Refreshing" but day is hot, suggest waiting
            if (weather.daily.maxTemp > 28 && weather.current.temperature < 25) {
                return "🌤️ El agua refresca. La tarde estará ideal."
            }
            return "😎 Agua refrescante. Ideal para el calor."
        }

        // Water is Cold (< 22)
        if (weather.daily.maxTemp > 30) return "☀️ Hace calor, pero el agua sigue fría."
        return "🥶 Agua fría. Solo para valientes."
    }

    if (loading) return (
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-blue-200 dark:border-slate-700">
            <CardContent className="p-6 flex items-center justify-center">
                <div className="animate-pulse flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm font-medium">Analizando condiciones de nado...</span>
                </div>
            </CardContent>
        </Card>
    )

    if (!weather) return null

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-blue-200 dark:border-slate-700 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-24 w-24" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Sparkles className="h-4 w-4" />
                        Análisis de Nado IA
                    </CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {locationName}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="text-lg font-medium text-slate-800 dark:text-slate-200">
                        {getAnalysis()}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{getWeatherIcon(weather.current.weatherCode)}</span>
                            <div>
                                <p className="font-medium text-foreground">{weather.current.temperature}°C</p>
                                <p className="text-xs">{getWeatherDescription(weather.current.weatherCode)}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-border mx-2"></div>
                        <div className="flex flex-col text-xs">
                            <span>Máx: {weather.daily.maxTemp}°C</span>
                            <span>Mín: {weather.daily.minTemp}°C</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
