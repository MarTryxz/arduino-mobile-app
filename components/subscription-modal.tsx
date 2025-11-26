"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, FileText, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/firebase"
import { ref, update } from "firebase/database"
import { toast } from "sonner"
import jsPDF from "jspdf"

interface SubscriptionModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    const handleCancelSubscription = async () => {
        if (!user) return

        if (confirm("¿Estás seguro de que quieres cancelar tu suscripción Premium? Perderás los beneficios inmediatamente.")) {
            setLoading(true)
            try {
                const userRef = ref(db, `users/${user.uid}`)
                await update(userRef, {
                    role: 'cliente'
                })
                toast.success("Suscripción cancelada correctamente")
                onOpenChange(false)
            } catch (error) {
                console.error("Error cancelling subscription:", error)
                toast.error("Error al cancelar la suscripción")
            } finally {
                setLoading(false)
            }
        }
    }

    const handleViewInvoices = () => {
        try {
            const doc = new jsPDF()

            // Título
            doc.setFontSize(20)
            doc.text("Historial de Pagos - Arduino Mobile App", 20, 20)

            // Información del usuario
            doc.setFontSize(12)
            doc.text(`Usuario: ${user?.email || 'Usuario'}`, 20, 35)
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 20, 42)

            // Línea separadora
            doc.line(20, 48, 190, 48)

            // Cabecera de la tabla
            doc.setFontSize(10)
            doc.setFont("helvetica", "bold")
            doc.text("Fecha", 20, 60)
            doc.text("Descripción", 60, 60)
            doc.text("Estado", 130, 60)
            doc.text("Monto", 170, 60)

            // Datos de ejemplo
            const pagos = [
                { fecha: "25/11/2025", desc: "Suscripción Premium Mensual", estado: "Completado", monto: "$9.99" },
                { fecha: "25/10/2025", desc: "Suscripción Premium Mensual", estado: "Completado", monto: "$9.99" },
                { fecha: "25/09/2025", desc: "Suscripción Premium Mensual", estado: "Completado", monto: "$9.99" },
                { fecha: "25/08/2025", desc: "Suscripción Premium Mensual", estado: "Completado", monto: "$9.99" },
            ]

            doc.setFont("helvetica", "normal")
            let y = 70
            pagos.forEach(pago => {
                doc.text(pago.fecha, 20, y)
                doc.text(pago.desc, 60, y)
                doc.text(pago.estado, 130, y)
                doc.text(pago.monto, 170, y)
                y += 10
            })

            // Información de contacto
            doc.setFontSize(10)
            doc.text("¿Preguntas o reclamos?", 20, 260)
            doc.setFont("helvetica", "bold")
            doc.text("Contacto: openrakiduamstudio@gmail.com", 20, 266)
            doc.setFont("helvetica", "normal")

            // Pie de página
            doc.setFontSize(8)
            doc.text("Este documento es un comprobante de pago generado automáticamente.", 20, 280)

            // Descargar PDF
            doc.save("historial_pagos.pdf")
            toast.success("Historial de pagos descargado")

        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.error("Error al generar el PDF")
        }
    }

    const handleChangeCard = () => {
        toast.info("Esta función estará disponible pronto.")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gestionar Suscripción</DialogTitle>
                    <DialogDescription>
                        Administra tu plan Premium y métodos de pago.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                                <CardTitle className="text-base text-amber-900 dark:text-amber-400">Plan PRO Activo</CardTitle>
                            </div>
                            <CardDescription className="text-amber-700 dark:text-amber-500/70">
                                Tienes acceso a todas las funciones premium.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <div className="grid gap-2">
                        <Button variant="outline" className="justify-start h-auto py-3" onClick={handleViewInvoices}>
                            <FileText className="mr-2 h-4 w-4" />
                            <div className="flex flex-col items-start text-left">
                                <span className="font-medium">Ver Facturas</span>
                                <span className="text-xs text-muted-foreground">Descarga tu historial de pagos</span>
                            </div>
                        </Button>

                        <Button variant="outline" className="justify-start h-auto py-3" onClick={handleChangeCard}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <div className="flex flex-col items-start text-left">
                                <span className="font-medium">Cambiar Tarjeta</span>
                                <span className="text-xs text-muted-foreground">Actualiza tu método de pago</span>
                            </div>
                        </Button>
                    </div>

                    <div className="pt-4 border-t">
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleCancelSubscription}
                            disabled={loading}
                        >
                            {loading ? "Procesando..." : "Cancelar Suscripción"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Al cancelar, perderás acceso a las funciones premium inmediatamente.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
