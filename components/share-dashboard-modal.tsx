"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, Copy, RefreshCw, Trash2, Globe, Check } from "lucide-react"
import { toast } from "sonner"
import { db } from "@/firebase"
import { ref, set, remove, onValue } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"

export function ShareDashboardModal() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!user || !isOpen) return

        const tokenRef = ref(db, `users/${user.uid}/shareToken`)
        const unsubscribe = onValue(tokenRef, (snapshot) => {
            setToken(snapshot.val())
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user, isOpen])

    const generateLink = async () => {
        if (!user) return
        setGenerating(true)
        try {
            const newToken = crypto.randomUUID()

            // 1. Save to user profile (for UI)
            await set(ref(db, `users/${user.uid}/shareToken`), newToken)

            // 2. Save to shared_links (for public access)
            await set(ref(db, `shared_links/${newToken}`), {
                uid: user.uid,
                createdAt: Date.now()
            })

            toast.success("Enlace público generado")
        } catch (error) {
            console.error("Error generating link:", error)
            toast.error("Error al generar el enlace")
        } finally {
            setGenerating(false)
        }
    }

    const revokeLink = async () => {
        if (!user || !token) return
        if (!confirm("¿Estás seguro? El enlace actual dejará de funcionar inmediatamente.")) return

        try {
            // 1. Remove from shared_links
            await remove(ref(db, `shared_links/${token}`))

            // 2. Remove from user profile
            await remove(ref(db, `users/${user.uid}/shareToken`))

            toast.success("Enlace revocado correctamente")
            setToken(null)
        } catch (error) {
            console.error("Error revoking link:", error)
            toast.error("Error al revocar el enlace")
        }
    }

    const copyToClipboard = () => {
        if (!token) return
        const url = `${window.location.origin}/share/${token}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success("Enlace copiado al portapapeles")
        setTimeout(() => setCopied(false), 2000)
    }

    const shareUrl = token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${token}` : ''

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 hidden md:flex text-foreground">
                    <Share2 className="h-4 w-4" />
                    Compartir
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-500" />
                        Compartir Dashboard
                    </DialogTitle>
                    <DialogDescription>
                        Genera un enlace público para que tus familiares o amigos puedan ver el estado de la piscina sin necesidad de cuenta.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : token ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Enlace Público Activo</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        readOnly
                                        value={shareUrl}
                                        className="bg-muted font-mono text-xs"
                                    />
                                    <Button size="icon" variant="secondary" onClick={copyToClipboard}>
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={revokeLink}
                                    className="gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Revocar Enlace
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={generateLink}
                                    disabled={generating}
                                    className="gap-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                                    Regenerar
                                </Button>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md text-xs text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                                ⚠️ Cualquiera con este enlace podrá ver la temperatura y estado de tu piscina. No compartas este enlace en redes sociales públicas.
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full">
                                <Share2 className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-medium">Sin enlace activo</h4>
                                <p className="text-sm text-muted-foreground">
                                    Crea un enlace para compartir tu dashboard en modo "Solo Lectura".
                                </p>
                            </div>
                            <Button onClick={generateLink} disabled={generating} className="w-full max-w-xs">
                                {generating ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Generando...
                                    </>
                                ) : (
                                    "Generar Enlace Público"
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
