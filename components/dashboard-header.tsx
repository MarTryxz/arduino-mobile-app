"use client"

import Link from "next/link"
import { Home, History, Bell, Info, Menu, User, Sparkles, Crown, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { UserButton } from "@/components/ui/user-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/firebase"
import { ref, onValue } from "firebase/database"

import { useState, useEffect } from "react"
import { PremiumModal } from "@/components/premium-modal"


interface DashboardHeaderProps {
    title: string
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
    const { user } = useAuth()
    const [showPremiumModal, setShowPremiumModal] = useState(false)

    const [role, setRole] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return

        const roleRef = ref(db, `users/${user.uid}/role`)
        const unsubscribe = onValue(roleRef, (snapshot) => {
            setRole(snapshot.val())
        })

        return () => unsubscribe()
    }, [user])

    const isPremium = role === 'cliente_premium'
    const isAdmin = role === 'admin'
    const hasProPlan = isPremium || isAdmin

    return (
        <header className="bg-app-blue text-white border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold">{title}</h1>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <div className="hidden md:block">
                        <UserButton />
                    </div>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent title="Menu">
                            <SheetHeader>
                                <SheetTitle>Menú de navegación</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-8">
                                {!hasProPlan && (
                                    <div
                                        onClick={() => setShowPremiumModal(true)}
                                        className="flex items-center gap-2 py-3 px-4 font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 mb-2 cursor-pointer"
                                    >
                                        <Crown className="h-5 w-5 fill-current" />
                                        Obtener Premium
                                    </div>
                                )}
                                <Link href="/dashboard" className="flex items-center gap-2 py-2 font-medium text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <Home className="h-5 w-5" />
                                    Panel principal
                                </Link>
                                <Link href="/history" className="flex items-center gap-2 py-2 font-medium text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <History className="h-5 w-5" />
                                    Historial
                                </Link>
                                <Link href="/alerts" className="flex items-center gap-2 py-2 font-medium text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <Bell className="h-5 w-5" />
                                    Alertas
                                </Link>
                                <Link href="/info" className="flex items-center gap-2 py-2 font-medium text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <Info className="h-5 w-5" />
                                    Información
                                </Link>
                                <Link href="/assistant" className="flex items-center gap-2 py-2 font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                    <Sparkles className="h-5 w-5" />
                                    Asistente IA
                                    <Crown className="h-3 w-3 ml-1 text-amber-500 fill-amber-500" />
                                </Link>

                                {isAdmin && (
                                    <Link href="/admin/users" className="flex items-center gap-2 py-2 font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                                        <Shield className="h-5 w-5" />
                                        Administrar Usuarios
                                    </Link>
                                )}
                                <div className="mt-auto pt-4 border-t md:hidden">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Cuenta</span>
                                        <UserButton />
                                    </div>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            <PremiumModal open={showPremiumModal} onOpenChange={setShowPremiumModal} />

        </header >
    )
}
