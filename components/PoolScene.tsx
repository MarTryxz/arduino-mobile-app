'use client';

import Spline from '@splinetool/react-spline';
import { useState, useRef, useEffect } from 'react';

interface PoolSceneProps {
    sensorActivo?: string | null;
}

export default function PoolScene({ sensorActivo }: PoolSceneProps) {
    const [isLoading, setIsLoading] = useState(true);
    const splineRef = useRef<any>(null);

    useEffect(() => {
        if (sensorActivo && splineRef.current) {
            console.log('Triggering Spline event for:', sensorActivo);
            try {
                // Simular un clic completo (Mouse Down + Mouse Up)
                splineRef.current.emitEvent('mouseDown', 'pool');
                setTimeout(() => {
                    splineRef.current.emitEvent('mouseUp', 'pool');
                }, 100);
            } catch (error) {
                console.error('Error emitting event:', error);
            }
        }
    }, [sensorActivo]);

    return (
        <div className="w-full h-[500px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-xl">
            {/* Spinner de carga */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none z-10 bg-slate-900">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">Cargando piscina...</span>
                    </div>
                </div>
            )}

            <Spline
                scene="https://prod.spline.design/FLOnYaK9MwC3pcu6/scene.splinecode"
                className="w-full h-full"
                onLoad={(spline) => {
                    setIsLoading(false);
                    splineRef.current = spline;
                }}
            />
        </div>
    );
}
