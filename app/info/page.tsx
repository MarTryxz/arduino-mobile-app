"use client"

import Link from "next/link"
import { Home, History, Bell, Info, Menu, FileText, HelpCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-app-blue text-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Información</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent title="Menu">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/dashboard" className="flex items-center gap-2 py-2">
                  <Home className="h-5 w-5" />
                  Panel principal
                </Link>
                <Link href="/history" className="flex items-center gap-2 py-2">
                  <History className="h-5 w-5" />
                  Historial
                </Link>
                <Link href="/alerts" className="flex items-center gap-2 py-2">
                  <Bell className="h-5 w-5" />
                  Alertas
                </Link>
                <Link href="/info" className="flex items-center gap-2 py-2 font-medium">
                  <Info className="h-5 w-5" />
                  Información
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Link href="/info/terms" className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-app-blue-light/20">
                    <FileText className="h-5 w-5 text-app-blue" />
                  </div>
                  <div>Términos y condiciones</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-app-blue-light/20">
                  <HelpCircle className="h-5 w-5 text-app-blue" />
                </div>
                <div className="font-medium">Guía de LEDs del dispositivo</div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="led-power">
                  <AccordionTrigger className="text-sm">LED de encendido (verde)</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      <strong>Encendido fijo:</strong> El dispositivo está encendido y funcionando correctamente.
                      <br />
                      <strong>Parpadeo lento:</strong> El dispositivo está en modo de ahorro de energía.
                      <br />
                      <strong>Apagado:</strong> El dispositivo está apagado o sin alimentación.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="led-wifi">
                  <AccordionTrigger className="text-sm">LED de Wi-Fi (azul)</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      <strong>Encendido fijo:</strong> Conectado a la red Wi-Fi.
                      <br />
                      <strong>Parpadeo rápido:</strong> Intentando conectar a la red Wi-Fi.
                      <br />
                      <strong>Parpadeo lento:</strong> En modo de configuración Wi-Fi.
                      <br />
                      <strong>Apagado:</strong> Wi-Fi desactivado o sin configurar.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="led-bluetooth">
                  <AccordionTrigger className="text-sm">LED de Bluetooth (azul)</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      <strong>Encendido fijo:</strong> Conectado a un dispositivo por Bluetooth.
                      <br />
                      <strong>Parpadeo:</strong> En modo de emparejamiento o buscando dispositivos.
                      <br />
                      <strong>Apagado:</strong> Bluetooth desactivado.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="led-error">
                  <AccordionTrigger className="text-sm">LED de error (rojo)</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      <strong>Encendido fijo:</strong> Error crítico en el sistema.
                      <br />
                      <strong>Parpadeo rápido:</strong> Error en los sensores o lecturas fuera de rango.
                      <br />
                      <strong>Parpadeo lento:</strong> Batería baja.
                      <br />
                      <strong>Apagado:</strong> Sin errores detectados.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-app-blue text-app-blue hover:bg-app-blue hover:text-white"
              >
                Acerca del dispositivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Información del dispositivo</DialogTitle>
                <DialogDescription>Detalles técnicos y versión del firmware</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Modelo:</div>
                  <div>Arduino Sensor Pro</div>

                  <div className="text-muted-foreground">Número de serie:</div>
                  <div>ASP-2025-0042</div>

                  <div className="text-muted-foreground">Versión de firmware:</div>
                  <div>v2.1.5</div>

                  <div className="text-muted-foreground">Última actualización:</div>
                  <div>01/05/2025</div>

                  <div className="text-muted-foreground">Sensores:</div>
                  <div>Temperatura, pH, Humedad</div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
