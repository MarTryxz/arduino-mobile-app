"use client"

import { useRef, useEffect } from 'react'
import Spline from '@splinetool/react-spline'

interface PoolSceneProps {
    sensorActivo: string | null
    temperatura: number // <--- 1. Nuevo Prop
}

export default function PoolScene({ sensorActivo, temperatura }: PoolSceneProps) {
    const splineRef = useRef<any>(null)

    function onLoad(splineApp: any) {
        splineRef.current = splineApp
    }

    // Efecto 1: Control de CÁMARA (Zoom)
    useEffect(() => {
        if (splineRef.current) {
            const valorCamara = sensorActivo ? 'zoom' : 'default';
            try {
                splineRef.current.setVariable('sensor', valorCamara);
            } catch (e) { }
        }
    }, [sensorActivo])

    // Efecto 2: Control de COLOR DEL AGUA
    useEffect(() => {
        if (splineRef.current) {
            let estado = 'normal';

            if (temperatura < 22) {
                estado = 'frio';    // <--- CAMBIO: Antes era 'fria', ahora coincide con tu estado Spline
            } else if (temperatura > 28) {
                estado = 'calor';   // <--- CAMBIO: Antes era 'caliente', ahora coincide con tu estado Spline
            }

            try {
                // Asegúrate que en Spline la variable se llame "estado_agua" (o ajusta aquí si le pusiste otro nombre)
                splineRef.current.setVariable('estado_agua', estado);
                console.log(`Enviando a Spline: ${estado}`);
            } catch (e) {
                console.error(e);
            }
        }
    }, [temperatura])

    return (
        <div className="w-full h-[400px] lg:h-full min-h-[400px] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 shadow-inner">
            <Spline
                scene="https://prod.spline.design/FLOnYaK9MwC3pcu6/scene.splinecode"
                onLoad={onLoad}
                className="w-full h-full"
            />
        </div>
    )
}