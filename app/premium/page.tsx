"use client"

import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PremiumPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-5xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
                        Mejora tu experiencia
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Desbloquea todo el potencial de AquaGuard con nuestros planes premium.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Monthly Plan */}
                    <Card className="relative flex flex-col border-2 border-transparent hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl bg-white dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Mensual</CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400">Flexibilidad total, cancela cuando quieras.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">$15.000</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">/ mes</span>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    "Monitoreo en tiempo real",
                                    "Alertas básicas",
                                    "Soporte por correo",
                                    "Acceso a la app móvil"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center text-gray-600 dark:text-gray-300">
                                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                                Elegir Mensual
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Yearly Plan */}
                    <Card className="relative flex flex-col border-2 border-amber-500 shadow-2xl scale-105 z-10 bg-white dark:bg-slate-900">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 text-sm font-bold uppercase tracking-wide shadow-md">
                                Mejor Valor
                            </Badge>
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Anual</CardTitle>
                                <Sparkles className="h-6 w-6 text-amber-500" />
                            </div>
                            <CardDescription className="text-gray-500 dark:text-gray-400">Ahorra dinero con nuestro plan anual.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">$10.000</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">/ mes</span>
                                <p className="text-sm text-green-600 font-medium mt-1">Facturado $120.000 anualmente</p>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    "Todo lo del plan mensual",
                                    "Alertas prioritarias SMS",
                                    "Soporte 24/7",
                                    "Análisis histórico avanzado",
                                    "Exportación de datos",
                                    "Configuración personalizada"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center text-gray-600 dark:text-gray-300">
                                        <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg" size="lg">
                                Obtener Premium Anual
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="text-center mt-8">
                    <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 underline">
                        Volver al panel principal
                    </a>
                </div>
            </div>
        </div>
    )
}
