"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, MapPin, RefreshCw } from "lucide-react"
import { getWeatherForecast, getWeatherIcon, getWeatherDescription, DEFAULT_LOCATION, WeatherData } from "@/lib/weather"
import { User } from "firebase/auth"
import { db } from "@/firebase"
import { ref, get, set } from "firebase/database"
import { Button } from "@/components/ui/button"

interface SwimAnalysisProps {
    waterTemp: number
    user: User
}

interface SavedAnalysis {
    content: string
    dateKey: string
    timestamp: number
    weatherCode: number
    weatherTemp: number
    locationName: string
}

export function SwimAnalysis({ waterTemp, user }: SwimAnalysisProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    const [locationName, setLocationName] = useState("Ubicación actual")
    const [analysis, setAnalysis] = useState<string | null>(null)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [cooldown, setCooldown] = useState(false)

    // Helper to get local date key (YYYY-MM-DD)
    const getLocalDateKey = () => {
        const now = new Date()
        const offset = now.getTimezoneOffset() * 60000
        const localDate = new Date(now.getTime() - offset)
        return localDate.toISOString().split('T')[0]
    }

    // 1. Fetch Weather on Mount
    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                const data = await getWeatherForecast(lat, lon)
                setWeather(data)
            } catch (error) {
                console.error("Error fetching weather:", error)
            } finally {
                setLoading(false)
            }
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

    // 2. Logic to Generate Analysis Text
    const generateAnalysisText = (temp: number, weatherData: WeatherData) => {
        // 1. Check Weather Warnings
        if (weatherData.current.weatherCode >= 71) return "❄️ Se espera nieve. Cubre la piscina."
        if (weatherData.current.weatherCode >= 51) return "🌧️ Lluvia detectada. No es buen momento."
        if (weatherData.daily.minTemp <= 0) return "🥶 Alerta de helada. Protege el sistema."

        // 2. Check Water Temperature (Psychological Constants)
        if (temp >= 30) return "🔥 ¡Agua muy caliente! Tipo Jacuzzi."
        if (temp >= 26) return "🏊 ¡Condiciones perfectas! Disfruta el nado."
        if (temp >= 22) {
            // If water is "Refreshing" but day is hot, suggest waiting
            if (weatherData.daily.maxTemp > 28 && weatherData.current.temperature < 25) {
                return "🌤️ El agua refresca. La tarde estará ideal."
            }
            return "😎 Agua refrescante. Ideal para el calor."
        }

        // Water is Cold (< 22)
        if (weatherData.daily.maxTemp > 30) return "☀️ Hace calor, pero el agua sigue fría."
        return "🥶 Agua fría. Solo para valientes."
    }

    // 3. Check Persistence & Generate if Needed
    useEffect(() => {
        if (!weather || loading || !user) return

        const checkAndGenerate = async () => {
            const todayKey = getLocalDateKey()
            const analysisRef = ref(db, `users/${user.uid}/swim_analysis`)

            try {
                const snapshot = await get(analysisRef)
                const savedData = snapshot.val() as SavedAnalysis | null

                if (savedData && savedData.dateKey === todayKey) {
                    // Use saved analysis
                    setAnalysis(savedData.content)
                } else {
                    // Generate new analysis
                    const newText = generateAnalysisText(waterTemp, weather)
                    const newData: SavedAnalysis = {
                        content: newText,
                        dateKey: todayKey,
                        timestamp: Date.now(),
                        weatherCode: weather.current.weatherCode,
                        weatherTemp: weather.current.temperature,
                        locationName: locationName
                    }

                    await set(analysisRef, newData)
                    setAnalysis(newText)
                }
            } catch (error) {
                console.error("Error checking/saving analysis:", error)
                // Fallback to generating without saving if Firebase fails
                setAnalysis(generateAnalysisText(waterTemp, weather))
            }
        }

        checkAndGenerate()
    }, [weather, loading, user, waterTemp, locationName])

    // 4. Manual Regenerate
    const handleRegenerate = async () => {
        if (!weather || cooldown) return

        setIsRegenerating(true)
        setCooldown(true)

        try {
            const newText = generateAnalysisText(waterTemp, weather)
            const todayKey = getLocalDateKey()
            const newData: SavedAnalysis = {
                content: newText,
                dateKey: todayKey,
                timestamp: Date.now(),
                weatherCode: weather.current.weatherCode,
                weatherTemp: weather.current.temperature,
                locationName: locationName
            }

            const analysisRef = ref(db, `users/${user.uid}/swim_analysis`)
            await set(analysisRef, newData)
            setAnalysis(newText)
        } catch (error) {
            console.error("Error regenerating:", error)
        } finally {
            setIsRegenerating(false)
            // 5s Cooldown
            setTimeout(() => setCooldown(false), 5000)
        }
    }

    if (loading || !analysis || !weather) return (
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-blue-200 dark:border-slate-700">
            <CardContent className="p-6 flex items-center justify-center">
                <div className="animate-pulse flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm font-medium">Analizando condiciones de nado...</span>
                </div>
            </CardContent>
        </Card>
    )

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
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {locationName}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-background/50 backdrop-blur-sm"
                            onClick={handleRegenerate}
                            disabled={cooldown || isRegenerating}
                            title="Regenerar análisis"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="text-lg font-medium text-slate-800 dark:text-slate-200">
                        {analysis}
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
