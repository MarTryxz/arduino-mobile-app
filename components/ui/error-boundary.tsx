"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle } from "lucide-react"

interface Props {
    children?: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 rounded-xl border border-slate-800">
                    <AlertTriangle className="h-10 w-10 mb-4 text-amber-500" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Error al cargar 3D</h3>
                    <p className="text-sm text-center max-w-xs">
                        Hubo un problema al inicializar la vista 3D. Intenta recargar la página.
                    </p>
                </div>
            )
        }

        return this.props.children
    }
}
