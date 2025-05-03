"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulación de envío de correo de recuperación
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-gray-light p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            <Link href="/" className="mr-2">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4 text-app-blue-light" />
              </Button>
            </Link>
            <CardTitle className="text-2xl font-bold">Recuperar contraseña</CardTitle>
          </div>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        {submitted ? (
          <CardContent>
            <Alert className="bg-app-green/10 border-app-green/30">
              <AlertDescription className="text-app-gray">
                Si tu correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña en breve.
                Por favor, revisa tu bandeja de entrada.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-app-blue-light" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-app-blue hover:bg-app-blue/90" disabled={loading}>
                {loading ? "Enviando..." : "Enviar instrucciones"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
