"use client"

import { useRef, useEffect, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Zap, ZapOff, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PoolSceneProps {
    sensorActivo: string | null
    temperatura: number
    // Opcional: Permitir forzar el modo desde fuera (ej. si detectas móvil antiguo)
    defaultLowPerf?: boolean
}

export default function PoolScene({ sensorActivo, temperatura, defaultLowPerf = false }: PoolSceneProps) {
    const splineRef = useRef<any>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [lowPerfMode, setLowPerfMode] = useState(defaultLowPerf)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    function onLoad(splineApp: any) {
        splineRef.current = splineApp
        setIsLoading(false)
        updateSplineState()
    }

    function updateSplineState() {
        if (!splineRef.current) return

        const valorCamara = sensorActivo ? 'zoom' : 'default';
        try {
            splineRef.current.setVariable('sensor', valorCamara);
        } catch (e) { }

        let estado = 'normal';
        if (temperatura < 22) estado = 'frio';
        else if (temperatura > 28) estado = 'calor';

        try {
            splineRef.current.setVariable('estado_agua', estado);
        } catch (e) { }
    }

    useEffect(() => {
        if (!lowPerfMode) {
            updateSplineState()
        }
    }, [sensorActivo, temperatura, lowPerfMode])

    if (!isMounted) return null;

    // --- VISTA ESTÁTICA (MODO BAJO RENDIMIENTO) ---
    if (lowPerfMode) {
        return (
            <div className="w-full h-[400px] lg:h-full min-h-[400px] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 shadow-inner flex flex-col items-center justify-center p-6 transition-all">

                {/* Fondo decorativo simulando agua */}
                <div className={`absolute inset-0 opacity-30 bg-gradient-to-b ${temperatura < 22 ? 'from-cyan-900 to-slate-900' :
                        temperatura > 28 ? 'from-orange-900 to-slate-900' :
                            'from-blue-900 to-slate-900'
                    }`} />

                {/* Contenido Central 2D */}
                <div className="z-10 text-center space-y-4">
                    <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm">
                        <ImageIcon className="w-12 h-12 text-slate-500 opacity-50" />
                        <span className="absolute text-3xl font-bold text-white">
                            {temperatura}°C
                        </span>
                    </div>
                    <div>
                        <Badge variant="outline" className="text-slate-400 border-slate-600">
                            Modo Ahorro de Energía
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-500 max-w-[200px]">
                        El modelo 3D está desactivado para mejorar el rendimiento.
                    </p>
                </div>

                {/* Botón Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-20 bg-slate-800/80 hover:bg-slate-700 text-yellow-500"
                    onClick={() => {
                        setLowPerfMode(false)
                        setIsLoading(true)
                    }}
                    title="Activar 3D"
                >
                    <ZapOff className="h-5 w-5" />
                </Button>
            </div>
        )
    }

    // --- VISTA 3D COMPLETA ---
    return (
        <div className="w-full h-[400px] lg:h-full min-h-[400px] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 shadow-inner group">

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="text-sm">Cargando Piscina 3D...</span>
                    </div>
                </div>
            )}

            <ErrorBoundary>
                <Spline
                    scene="https://prod.spline.design/FLOnYaK9MwC3pcu6/scene.splinecode"
                    onLoad={onLoad}
                    className="w-full h-full"
                />
            </ErrorBoundary>

            {/* Botón Toggle (Solo visible al hacer hover en desktop para no tapar el 3D, o siempre visible en mobile) */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-20 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white backdrop-blur-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                onClick={() => setLowPerfMode(true)}
                title="Desactivar 3D (Ahorro de energía)"
            >
                <Zap className="h-5 w-5" />
            </Button>

            {/* Indicador de estado para debug o info visual */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-md border-none">
                    {isLoading ? 'Iniciando motor...' : 'Vista 3D Interactiva'}
                </Badge>
            </div>
        </div>
    )
}
<img
    src="/images/pool-placeholder.png"
    alt="Piscina estática"
    className="absolute inset-0 w-full h-full object-cover opacity-50"
/>