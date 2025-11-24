"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { db } from "@/firebase"
import { ref, onValue, set, remove } from "firebase/database"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, User, Sparkles, RefreshCw, Trash2 } from "lucide-react"
import { sendMessageToGemini } from "@/app/actions/chat"
import { PremiumModal } from "@/components/premium-modal"

interface Message {
    id: string
    role: 'user' | 'assistant'
    text: string
    timestamp: string // Changed to string for serialization
}

export default function AssistantPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [lecturas, setLecturas] = useState<any>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [showPremiumModal, setShowPremiumModal] = useState(false)
    const [roleLoading, setRoleLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Redirigir si no hay usuario
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    // Verificar rol del usuario
    useEffect(() => {
        if (!user) return

        const roleRef = ref(db, `users/${user.uid}/role`)
        const unsubscribe = onValue(roleRef, (snapshot) => {
            const role = snapshot.val()
            if (role === 'cliente') {
                setShowPremiumModal(true)
            }
            setRoleLoading(false)
        })

        return () => unsubscribe()
    }, [user])

    // Cargar datos de sensores
    useEffect(() => {
        const lecturasRef = ref(db, 'sensor_status/actual')
        const unsubscribe = onValue(lecturasRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                setLecturas(data)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Cargar historial de chat
    useEffect(() => {
        if (!user) return

        const chatRef = ref(db, `users/${user.uid}/chatHistory`)
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                // Convert object to array if necessary and sort by timestamp
                const loadedMessages = Object.values(data) as Message[]
                setMessages(loadedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
            } else {
                setMessages([
                    {
                        id: '1',
                        role: 'assistant',
                        text: 'Hola, soy AquaGuard AI. Estoy analizando los datos de tu piscina. ¿En qué puedo ayudarte hoy?',
                        timestamp: new Date().toISOString()
                    }
                ])
            }
        })

        return () => unsubscribe()
    }, [user])

    // Auto-scroll al final del chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isTyping])

    const saveMessageToFirebase = async (message: Message) => {
        if (!user) return
        try {
            await set(ref(db, `users/${user.uid}/chatHistory/${message.id}`), message)
        } catch (error) {
            console.error("Error saving message:", error)
        }
    }

    const clearHistory = async () => {
        if (!user) return
        if (confirm('¿Estás seguro de que quieres borrar todo el historial de chat?')) {
            try {
                await remove(ref(db, `users/${user.uid}/chatHistory`))
                // The onValue listener will handle resetting the state
            } catch (error) {
                console.error("Error clearing history:", error)
            }
        }
    }

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || isTyping) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date().toISOString()
        }

        // Optimistic update
        setMessages(prev => [...prev, userMessage])
        saveMessageToFirebase(userMessage)

        setInput('')
        setIsTyping(true)

        try {
            const response = await sendMessageToGemini(userMessage.text, lecturas)

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: response.text || response.error || 'Lo siento, hubo un error al procesar tu mensaje.',
                timestamp: new Date().toISOString()
            }

            setMessages(prev => [...prev, botMessage])
            saveMessageToFirebase(botMessage)
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setIsTyping(false)
        }
    }

    const generateReport = async () => {
        if (isTyping) return

        const prompt = "Genera un reporte completo del estado actual de la piscina basándote en los datos de los sensores. Incluye recomendaciones si es necesario."

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: "Generar reporte de estado",
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        saveMessageToFirebase(userMessage)
        setIsTyping(true)

        try {
            const response = await sendMessageToGemini(prompt, lecturas)

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: response.text || response.error || 'Lo siento, hubo un error al generar el reporte.',
                timestamp: new Date().toISOString()
            }

            setMessages(prev => [...prev, botMessage])
            saveMessageToFirebase(botMessage)
        } catch (error) {
            console.error('Error generating report:', error)
        } finally {
            setIsTyping(false)
        }
    }

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            router.push('/dashboard')
        }
        setShowPremiumModal(open)
    }

    if (loading || roleLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
            <PremiumModal open={showPremiumModal} onOpenChange={handleModalOpenChange} />
            <DashboardHeader title="Asistente IA" />

            <main className={`flex-1 container mx-auto px-4 py-6 flex flex-col max-h-[calc(100vh-64px)] ${showPremiumModal ? 'blur-sm pointer-events-none' : ''}`}>
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">

                    {/* Header del chat */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-slate-800/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-800 dark:text-gray-100">AquaGuard AI</h2>
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                                    En línea
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearHistory}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Borrar Historial"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={generateReport}
                                disabled={isTyping || !lecturas}
                                className="hidden sm:flex gap-2 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Generar Reporte
                            </Button>
                        </div>
                    </div>

                    {/* Área de mensajes */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {msg.text}
                                        </div>
                                        <p className={`text-[10px] mt-1 opacity-70 text-right ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200 dark:border-gray-700">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Input area */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={generateReport}
                                disabled={isTyping || !lecturas}
                                className="sm:hidden text-blue-600 dark:text-blue-400"
                                title="Generar Reporte"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </Button>

                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu pregunta sobre la piscina..."
                                className="flex-1 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 text-gray-900 dark:text-gray-100"
                                disabled={isTyping}
                            />

                            <Button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                                <span className="sr-only">Enviar</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
