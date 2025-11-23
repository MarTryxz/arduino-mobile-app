"use client"

import { useRef, useEffect } from 'react'
import Spline from '@splinetool/react-spline'

interface PoolSceneProps {
    sensorActivo: string | null
}

export default function PoolScene({ sensorActivo }: PoolSceneProps) {
    const splineRef = useRef<any>(null)

    function onLoad(splineApp: any) {
        // Guardamos la referencia a la app de Spline para poder controlarla
        splineRef.current = splineApp
    }

    useEffect(() => {
        if (splineRef.current) {
            // LOGICA SIMPLIFICADA:
            // Si hay un sensor activo (cualquiera), enviamos 'zoom'.
            // Si es null (se acabó el tiempo), enviamos 'default'.
            const valorParaSpline = sensorActivo ? 'zoom' : 'default';

            try {
                splineRef.current.setVariable('sensor', valorParaSpline);
            } catch (e) {
                console.error("La variable 'sensor' no existe en la escena de Spline aún.");
            }
        }
    }, [sensorActivo])

    return (
        <div className="w-full h-[400px] lg:h-full min-h-[400px] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 shadow-inner">
            {/* Mensaje de carga simple */}
            <div className="absolute inset-0 flex items-center justify-center text-slate-600 -z-10">
                Cargando Modelo 3D...
            </div>

            <Spline
                scene="https://prod.spline.design/FLOnYaK9MwC3pcu6/scene.splinecode"
                onLoad={onLoad}
                className="w-full h-full"
            />
        </div>
    )
}