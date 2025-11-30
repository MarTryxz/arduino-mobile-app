"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Flame, Timer, AlertTriangle, ArrowRight, Lock } from "lucide-react"
import Link from "next/link"
import { calculateHeatingTime, DEFAULT_INEFFICIENCY, HIGH_INEFFICIENCY } from "@/lib/heating-calc"
import { cn } from "@/lib/utils"

interface HeatingEstimatorProps {
    currentTemp: number
    poolVolume: number
    heaterPower: number
    hasHeater: boolean
    isPremium: boolean
}

export function HeatingEstimator({
    currentTemp,
    poolVolume,
    heaterPower,
    hasHeater,
    isPremium
}: HeatingEstimatorProps) {
    const [open, setOpen] = useState(false)
    const [targetTemp, setTargetTemp] = useState(currentTemp + 2)
    const [hasCover, setHasCover] = useState(true)
    const [result, setResult] = useState<{ hours: number; completionDate: Date | null } | null>(null)

    // Ensure target temp is at least current temp
    useEffect(() => {
        if (targetTemp < currentTemp) {
            setTargetTemp(currentTemp)
        }
    }, [currentTemp])

    useEffect(() => {
        if (open && poolVolume && heaterPower) {
            const inefficiency = hasCover ? DEFAULT_INEFFICIENCY : HIGH_INEFFICIENCY
            const calc = calculateHeatingTime(poolVolume, currentTemp, targetTemp, heaterPower, inefficiency)
            setResult(calc)
        }
    }, [targetTemp, hasCover, poolVolume, heaterPower, currentTemp, open])

    if (!hasHeater) return null

    // If not premium, show locked state or upgrade prompt
    if (!isPremium) {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800">
                        <Lock className="h-4 w-4" />
                        Planificar Calefacción
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <Crown className="h-5 w-5" />
                            Función Premium
                        </DialogTitle>
                        <DialogDescription>
                            La planificación de calefacción está disponible solo para usuarios Premium.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-center space-y-4">
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <Flame className="h-12 w-12 text-orange-500 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Calcula exactamente cuánto tardará tu piscina en llegar a la temperatura ideal y ahorra energía.
                            </p>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white" asChild>
                            <Link href="/profile">Actualizar a Premium</Link>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // Missing configuration
    if (!poolVolume || !heaterPower) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800">
                        <Flame className="h-4 w-4" />
                        Planificar
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Faltan Datos</DialogTitle>
                        <DialogDescription>
                            Para calcular el tiempo de calentamiento, necesitamos saber el volumen de tu piscina y la potencia de tu calefactor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end pt-4">
                        <Button asChild>
                            <Link href="/profile">Configurar Perfil</Link>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    const formatDate = (date: Date) => {
        const today = new Date()
        const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth()
        const isTomorrow = date.getDate() === today.getDate() + 1 && date.getMonth() === today.getMonth()

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        if (isToday) return `Hoy a las ${timeStr}`
        if (isTomorrow) return `Mañana a las ${timeStr}`
        return `${date.toLocaleDateString()} a las ${timeStr}`
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20">
                    <Flame className="h-4 w-4" />
                    Planificar Calefacción
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-orange-500" />
                        Estimador de Calefacción
                    </DialogTitle>
                    <DialogDescription>
                        Calcula cuánto tardará en llegar a tu temperatura ideal.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Target Temp Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Temperatura Deseada</Label>
                            <span className="text-2xl font-bold text-orange-600">
                                {targetTemp}°C
                            </span>
                        </div>
                        <Slider
                            value={[targetTemp]}
                            min={Math.floor(currentTemp)}
                            max={40}
                            step={1}
                            onValueChange={(vals) => setTargetTemp(vals[0])}
                            className="py-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Actual: {currentTemp.toFixed(1)}°C</span>
                            <span>Máx: 40°C</span>
                        </div>

                        {targetTemp > 30 && (
                            <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
                                <AlertTriangle className="h-3 w-3" />
                                Temperaturas sobre 30°C pueden favorecer algas.
                            </div>
                        )}
                    </div>

                    {/* Cover Toggle */}
                    <div className="flex items-center justify-between space-x-2 border-t pt-4">
                        <Label htmlFor="has-cover" className="flex flex-col gap-1">
                            <span>¿Usas cobertor térmico?</span>
                            <span className="font-normal text-xs text-muted-foreground">Ayuda a retener el calor (20-30% más rápido)</span>
                        </Label>
                        <Switch id="has-cover" checked={hasCover} onCheckedChange={setHasCover} />
                    </div>

                    {/* Result */}
                    {result && result.hours > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Tiempo estimado:</span>
                                <span className="font-medium">{result.hours} horas</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Estará lista:</span>
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-lg">
                                    <ArrowRight className="h-4 w-4" />
                                    {result.completionDate && formatDate(result.completionDate)}
                                </div>
                            </div>
                        </div>
                    )}

                    {result && result.hours === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-2">
                            La temperatura deseada es igual o menor a la actual.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function Crown({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
        </svg>
    )
}
