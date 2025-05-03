"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bluetooth, Wifi, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConnectionGuidePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("bluetooth")
  const [bluetoothConnected, setBluetoothConnected] = useState(false)
  const [wifiConnected, setWifiConnected] = useState(false)
  const [wifiName, setWifiName] = useState("")
  const [wifiPassword, setWifiPassword] = useState("")

  const handleBluetoothConnect = () => {
    // Simulación de conexión Bluetooth
    setTimeout(() => {
      setBluetoothConnected(true)
      setActiveTab("wifi")
    }, 1500)
  }

  const handleWifiConnect = () => {
    // Simulación de conexión WiFi
    setTimeout(() => {
      setWifiConnected(true)
    }, 1500)
  }

  const handleComplete = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-gray-light p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Configuración del dispositivo</CardTitle>
          <CardDescription>Conecta tu dispositivo Arduino siguiendo estos pasos</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bluetooth" disabled={bluetoothConnected}>
                <Bluetooth className="mr-2 h-4 w-4" />
                Bluetooth
              </TabsTrigger>
              <TabsTrigger value="wifi" disabled={!bluetoothConnected || wifiConnected}>
                <Wifi className="mr-2 h-4 w-4" />
                Wi-Fi
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bluetooth" className="space-y-4 py-4">
              <div className="text-center space-y-4">
                <div className="rounded-full bg-app-blue-light/20 p-4 inline-flex mx-auto">
                  <Bluetooth className="h-8 w-8 text-app-blue" />
                </div>
                <h3 className="font-medium text-lg">Conectar por Bluetooth</h3>
                <p className="text-sm text-muted-foreground">
                  Asegúrate que tu dispositivo Arduino esté encendido y en modo de emparejamiento.
                </p>
              </div>

              <Button
                onClick={handleBluetoothConnect}
                className="w-full bg-app-blue hover:bg-app-blue/90"
                disabled={bluetoothConnected}
              >
                {bluetoothConnected ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Conectado
                  </>
                ) : (
                  "Buscar dispositivos"
                )}
              </Button>
            </TabsContent>

            <TabsContent value="wifi" className="space-y-4 py-4">
              <div className="text-center space-y-4">
                <div className="rounded-full bg-app-blue-light/20 p-4 inline-flex mx-auto">
                  <Wifi className="h-8 w-8 text-app-blue" />
                </div>
                <h3 className="font-medium text-lg">Configurar Wi-Fi</h3>
                <p className="text-sm text-muted-foreground">
                  Configura la red Wi-Fi para que tu dispositivo pueda conectarse a internet.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="wifi-name">Nombre de la red</Label>
                  <Input
                    id="wifi-name"
                    placeholder="Ingresa el nombre de tu red Wi-Fi"
                    value={wifiName}
                    onChange={(e) => setWifiName(e.target.value)}
                    disabled={wifiConnected}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wifi-password">Contraseña</Label>
                  <Input
                    id="wifi-password"
                    type="password"
                    placeholder="Ingresa la contraseña de tu red Wi-Fi"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    disabled={wifiConnected}
                  />
                </div>
              </div>

              {!wifiConnected ? (
                <Button
                  onClick={handleWifiConnect}
                  className="w-full bg-app-blue hover:bg-app-blue/90"
                  disabled={!wifiName || !wifiPassword}
                >
                  Conectar
                </Button>
              ) : (
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center text-app-green">
                    <Check className="mr-2 h-5 w-5" />
                    <span className="font-medium">Conexión exitosa</span>
                  </div>
                  <Button onClick={handleComplete} className="w-full bg-app-blue hover:bg-app-blue/90">
                    Continuar al panel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
