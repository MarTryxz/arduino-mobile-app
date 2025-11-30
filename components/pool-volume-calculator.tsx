"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Box, Circle, Cylinder } from "lucide-react"

interface PoolVolumeCalculatorProps {
    onCalculate: (volume: number) => void
}

export function PoolVolumeCalculator({ onCalculate }: PoolVolumeCalculatorProps) {
    const [open, setOpen] = useState(false)
    const [shape, setShape] = useState("rectangular")

    // Dimensions
    const [length, setLength] = useState("")
    const [width, setWidth] = useState("")
    const [depth, setDepth] = useState("")
    const [diameter, setDiameter] = useState("")

    const calculateVolume = () => {
        let volume = 0
        const d = parseFloat(depth)

        if (isNaN(d) || d <= 0) return

        if (shape === "rectangular") {
            const l = parseFloat(length)
            const w = parseFloat(width)
            if (!isNaN(l) && !isNaN(w)) {
                // V = L * W * D * 1000 (m3 to Liters)
                volume = l * w * d * 1000
            }
        } else if (shape === "round") {
            const diam = parseFloat(diameter)
            if (!isNaN(diam)) {
                // V = PI * r^2 * D * 1000
                const r = diam / 2
                volume = Math.PI * Math.pow(r, 2) * d * 1000
            }
        } else if (shape === "oval") {
            const l = parseFloat(length)
            const w = parseFloat(width)
            if (!isNaN(l) && !isNaN(w)) {
                // V = PI * (L/2) * (W/2) * D * 1000 (Approximation)
                // More accurate oval pool formula often used: 0.89 * L * W * D * 1000 (for rectangular with rounded corners)
                // Standard Ellipse: PI * A * B * D
                volume = Math.PI * (l / 2) * (w / 2) * d * 1000
            }
        }

        if (volume > 0) {
            onCalculate(Math.round(volume))
            setOpen(false)
            // Reset fields
            setLength("")
            setWidth("")
            setDepth("")
            setDiameter("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Calculator className="h-4 w-4" />
                    Calcular
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Calculadora de Volumen</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="rectangular" onValueChange={setShape} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="rectangular">Rectangular</TabsTrigger>
                        <TabsTrigger value="round">Redonda</TabsTrigger>
                        <TabsTrigger value="oval">Ovalada</TabsTrigger>
                    </TabsList>

                    <div className="py-4 space-y-4">
                        <div className="flex justify-center py-4">
                            {shape === "rectangular" && <Box className="h-16 w-16 text-blue-500 opacity-80" />}
                            {shape === "round" && <Circle className="h-16 w-16 text-blue-500 opacity-80" />}
                            {shape === "oval" && <div className="h-12 w-20 rounded-[50%] border-4 border-blue-500 opacity-80" />}
                        </div>

                        {/* Common Inputs based on shape */}
                        {(shape === "rectangular" || shape === "oval") && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="length">Largo (m)</Label>
                                        <Input
                                            id="length"
                                            type="number"
                                            placeholder="Ej: 8"
                                            value={length}
                                            onChange={(e) => setLength(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="width">Ancho (m)</Label>
                                        <Input
                                            id="width"
                                            type="number"
                                            placeholder="Ej: 4"
                                            value={width}
                                            onChange={(e) => setWidth(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {shape === "round" && (
                            <div className="space-y-2">
                                <Label htmlFor="diameter">Diámetro (m)</Label>
                                <Input
                                    id="diameter"
                                    type="number"
                                    placeholder="Ej: 4.5"
                                    value={diameter}
                                    onChange={(e) => setDiameter(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="depth">Profundidad Promedio (m)</Label>
                            <Input
                                id="depth"
                                type="number"
                                placeholder="Ej: 1.5"
                                value={depth}
                                onChange={(e) => setDepth(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Si tiene desnivel, usa el promedio entre la parte baja y honda.
                            </p>
                        </div>
                    </div>
                </Tabs>

                <DialogFooter>
                    <Button onClick={calculateVolume} className="w-full">
                        Calcular y Usar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
