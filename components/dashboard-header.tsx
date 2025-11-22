"use client"

import Link from "next/link"
import { Home, History, Bell, Info, Menu, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { UserButton } from "@/components/ui/user-button"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardHeaderProps {
    title: string
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
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
                                <Link href="/dashboard" className="flex items-center gap-2 py-2 font-medium">
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
                                <Link href="/info" className="flex items-center gap-2 py-2">
                                    <Info className="h-5 w-5" />
                                    Información
                                </Link>
                                <Link href="/assistant" className="flex items-center gap-2 py-2 text-blue-600 dark:text-blue-400 font-medium">
                                    <Sparkles className="h-5 w-5" />
                                    Asistente IA
                                </Link>
                                <Link href="/profile" className="flex items-center gap-2 py-2">
                                    <User className="h-5 w-5" />
                                    Mi Perfil
                                </Link>
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
        </header>
    )
}
