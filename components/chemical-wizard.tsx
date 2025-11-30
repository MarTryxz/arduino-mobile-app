"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Beaker, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react"
import { calculatePhDosage, ChemicalDosage } from "@/lib/chemical-calc"
import Link from "next/link"

interface ChemicalWizardProps {
    poolVolume: number | null
    currentPh: number
}

export function ChemicalWizard({ poolVolume, currentPh }: ChemicalWizardProps) {
    const [open, setOpen] = useState(false)

    if (!poolVolume) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/50">
                        <Beaker className="h-3 w-3" />
                        Solucionar
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configuración Necesaria</DialogTitle>
                        <DialogDescription>
                            Para calcular la dosis exacta de químicos, necesitamos saber el volumen de tu piscina.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <AlertTriangle className="h-12 w-12 text-yellow-500" />
                        <p className="text-center text-sm text-muted-foreground">
                            Ve a tu perfil y configura el volumen (litros) o usa la calculadora integrada.
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

    const dosage = calculatePhDosage(poolVolume, currentPh)

    if (!dosage) return null // pH is optimal

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/50">
                    <Beaker className="h-3 w-3" />
                    Solucionar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Beaker className="h-5 w-5 text-blue-500" />
                        Asistente Químico
                    </DialogTitle>
                    <DialogDescription>
                        Recomendación basada en tu piscina de {poolVolume.toLocaleString()} Litros.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Status Visual */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Actual</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{currentPh}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400" />
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Objetivo</p>
                            <p className="text-xl font-bold text-green-600">7.4</p>
                        </div>
                    </div>

                    {/* Action Card */}
                    <div className={`p-4 rounded-lg border-l-4 shadow-sm ${dosage.type === 'increase'
                            ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                            : 'bg-orange-50 border-orange-500 dark:bg-orange-900/20'
                        }`}>
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                            {dosage.type === 'increase' ? '⬆️ Subir pH' : '⬇️ Bajar pH'}
                        </h4>
                        <p className="text-lg font-bold mb-2">
                            Agrega {dosage.amount} {dosage.unit}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">
                            de {dosage.chemicalName}
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2">
                        <h5 className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Instrucciones
                        </h5>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {dosage.instruction}
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
