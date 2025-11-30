"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Timer, Zap, ArrowRight, AlertTriangle, CheckCircle2, Settings } from "lucide-react"
import { calculateFiltrationTime, FiltrationResult } from "@/lib/filtration-calc"
import Link from "next/link"

interface FiltrationOptimizerProps {
    poolVolume: number | null
    pumpFlowRate: number | null
}

export function FiltrationOptimizer({ poolVolume, pumpFlowRate }: FiltrationOptimizerProps) {
    const [open, setOpen] = useState(false)

    if (!poolVolume || !pumpFlowRate) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Zap className="h-3 w-3" />
                        Optimizar
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configuración Necesaria</DialogTitle>
                        <DialogDescription>
                            Para calcular el tiempo óptimo de filtrado, necesitamos saber el volumen de tu piscina y la potencia de tu bomba.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <Settings className="h-12 w-12 text-slate-400" />
                        <p className="text-center text-sm text-muted-foreground">
                            Ve a tu perfil y configura estos datos para empezar a ahorrar energía.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button asChild onClick={() => setOpen(false)}>
                            <Link href="/profile">Ir al Perfil</Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    const result = calculateFiltrationTime(poolVolume, pumpFlowRate)

    if (!result) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50">
                    <Zap className="h-3 w-3" />
                    Ahorro Energía
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-blue-500" />
                        Optimizador de Filtrado
                    </DialogTitle>
                    <DialogDescription>
                        Basado en tu piscina de {poolVolume.toLocaleString()}L y bomba de {pumpFlowRate}m³/h.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Main Result */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-muted-foreground mb-2">Tiempo diario recomendado</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">{result.hoursNeeded}</span>
                            <span className="text-xl font-medium text-slate-500">horas</span>
                        </div>
                        {result.isEfficient && (
                            <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                <Zap className="h-3 w-3 fill-current" />
                                Ahorras {result.savingsVsStandard}h vs estándar (8h)
                            </div>
                        )}
                    </div>

                    {/* Explanation */}
                    <div className="space-y-3">
                        <h5 className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ¿Por qué este tiempo?
                        </h5>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Tu bomba es capaz de mover toda el agua de tu piscina en {result.hoursNeeded} horas.
                            Filtrar más tiempo del necesario solo gasta electricidad sin mejorar significativamente la calidad del agua.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => setOpen(false)} variant="secondary">
                        Entendido
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
