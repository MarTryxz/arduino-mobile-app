"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { db } from "@/firebase"
import { ref, onValue, set, remove, query, limitToLast } from "firebase/database"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles, Trash2, Paperclip, Mic, Droplet, Thermometer, Activity, Wind } from "lucide-react"
import { sendMessageToGemini } from "@/app/actions/chat"
import { PremiumModal } from "@/components/premium-modal"
import ReactMarkdown from 'react-markdown'

interface Message {
    id: string
    role: 'user' | 'assistant'
    text: string
    timestamp: string
}

const EmptyStateSuggestions = ({ onSelect }: { onSelect: (text: string) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full mx-auto mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {[
            { icon: <Thermometer className="w-4 h-4" />, text: "¿Está el agua lista para nadar?" },
            { icon: <Activity className="w-4 h-4" />, text: "Analizar últimas 24 horas" },
            { icon: <Droplet className="w-4 h-4" />, text: "¿Necesito agregar cloro?" },
            { icon: <Wind className="w-4 h-4" />, text: "Generar reporte de estado" },
        ].map((prompt, idx) => (
            <button
                key={idx}
                onClick={() => onSelect(prompt.text)}
                className="flex items-center gap-3 p-3 text-left bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all group shadow-sm"
            >
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors bg-gray-100 dark:bg-slate-700 p-2 rounded-full">
                    {prompt.icon}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {prompt.text}
                </span>
            </button>
        ))}
    </div>
);

const ContextBar = ({ lecturas }: { lecturas: any }) => {
    if (!lecturas) return null;
    return (
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 py-2 px-4 flex items-center gap-4 overflow-x-auto text-xs sm:text-sm whitespace-nowrap shadow-sm z-10 sticky top-0">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <Droplet className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-medium">Agua:</span>
                <span>{lecturas.tempAgua?.toFixed(1)}°C</span>
            </div>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-medium">Aire:</span>
                <span>{lecturas.tempAire?.toFixed(1)}°C</span>
            </div>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <Activity className="w-3.5 h-3.5 text-green-500" />
                <span className="font-medium">pH:</span>
                <span>{lecturas.phVoltaje ? (7 - (lecturas.phVoltaje - 2.5) * 3.5).toFixed(1) : '--'}</span>
            </div>
        </div>
    )
}

export default function AssistantPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [lecturas, setLecturas] = useState<any>(null)
    const [historyData, setHistoryData] = useState<any>(null)
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
            } catch (error) {
                console.error("Error clearing history:", error)
            }
        }
    }

    // Cargar historial de sensores
    useEffect(() => {
        const historyRef = query(ref(db, 'sensor_status/historial'), limitToLast(48)) // Approx 24h if 30min interval, or adjust as needed. 48 points is safe.
        const unsubscribe = onValue(historyRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                setHistoryData(data)
            }
        })
        return () => unsubscribe()
    }, [])

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isTyping) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: text,
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        saveMessageToFirebase(userMessage)

        setInput('')
        setIsTyping(true)

        try {
            const response = await sendMessageToGemini(userMessage.text, { current: lecturas, history: historyData })

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSendMessage(input)
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
        <div className="h-[100dvh] bg-gray-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col overflow-hidden">
            <PremiumModal open={showPremiumModal} onOpenChange={handleModalOpenChange} />
            <DashboardHeader title="Asistente IA" />

            {/* Context Bar */}
            <ContextBar lecturas={lecturas} />

            <main className={`flex-1 container mx-auto px-4 pt-4 pb-24 flex flex-col h-full overflow-hidden ${showPremiumModal ? 'blur-sm pointer-events-none' : ''}`}>
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 relative h-full">

                    {/* Header del chat */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-slate-800/50 flex justify-between items-center z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-800">
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

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearHistory}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Borrar Historial"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Área de mensajes */}
                    <ScrollArea className="flex-1 p-4 bg-gray-50/50 dark:bg-slate-950/50">
                        <div className="space-y-6 pb-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm mr-2 shrink-0 mt-1">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        <div className="text-sm leading-relaxed">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                                    li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                        <p className={`text-[10px] mt-1.5 opacity-70 text-right ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm mr-2 shrink-0 mt-1">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="flex space-x-1.5 h-5 items-center">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Suggestions (Zero State) */}
                            {!isTyping && messages.length <= 1 && (
                                <div className="mt-8">
                                    <p className="text-center text-gray-400 dark:text-gray-500 mb-4 text-sm font-medium">O prueba una de estas consultas:</p>
                                    <EmptyStateSuggestions onSelect={handleSendMessage} />
                                </div>
                            )}

                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Input area */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
                        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                            <div className="absolute left-2 flex gap-1">
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-500 rounded-full" disabled>
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-500 rounded-full" disabled>
                                    <Mic className="w-4 h-4" />
                                </Button>
                            </div>

                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pregúntame sobre la temperatura, químicos..."
                                className="flex-1 pl-20 pr-12 py-6 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 text-gray-900 dark:text-gray-100 rounded-full shadow-sm"
                                disabled={isTyping}
                            />

                            <Button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="absolute right-1.5 h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform active:scale-95 p-0 flex items-center justify-center"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                                <span className="sr-only">Enviar</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
