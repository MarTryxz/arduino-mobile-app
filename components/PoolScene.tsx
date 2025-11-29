"use client"

import { useRef, useEffect, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { ErrorBoundary } from '@/components/ui/error-boundary'

interface PoolSceneProps {
    sensorActivo: string | null
    temperatura: number
}

export default function PoolScene({ sensorActivo, temperatura }: PoolSceneProps) {
    const splineRef = useRef<any>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    function onLoad(splineApp: any) {
        splineRef.current = splineApp
        updateSplineState()
    }

    function updateSplineState() {
        if (!splineRef.current) return

        // Update Camera
        const valorCamara = sensorActivo ? 'zoom' : 'default';
        try {
            splineRef.current.setVariable('sensor', valorCamara);
        } catch (e) { }

        // Update Water Color
        let estado = 'normal';
        if (temperatura < 22) {
            estado = 'frio';
        } else if (temperatura > 28) {
            estado = 'calor';
        }

        try {
            splineRef.current.setVariable('estado_agua', estado);
        } catch (e) { }
    }

    // Efecto para actualizar cuando cambian las props
    useEffect(() => {
        updateSplineState()
    }, [sensorActivo, temperatura])

    if (!isMounted) {
        return (
            <div className="w-full h-[400px] lg:h-full min-h-[400px] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 shadow-inner flex items-center justify-center text-slate-500">
                <div className="animate-pulse">Cargando 3D...</div>
            </div>
        )
    }

    return (
        <div className="w-full h-[400px] lg:h-full min-h-[400px] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 shadow-inner">
            <ErrorBoundary>
                <Spline
                    scene="https://prod.spline.design/FLOnYaK9MwC3pcu6/scene.splinecode"
                    onLoad={onLoad}
                    className="w-full h-full"
                />
            </ErrorBoundary>
        </div>
    )
}