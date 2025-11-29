"use client"

import { useEffect, useRef } from 'react';
import { db } from '@/firebase';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';
import { SENSOR_RANGES } from '@/constants/ranges';
import { toast } from '@/components/ui/use-toast';

interface SensorData {
    tempAgua: number;
    tempAire: number;
    humedadAire: number;
    phVoltaje: number;
    rssi: number;
    uptime: number;
}

const ALERT_COOLDOWN = 60 * 60 * 1000; // 1 hour in milliseconds

export function useAlertMonitoring() {
    const lastAlertTimeRef = useRef<Record<string, number>>({});

    useEffect(() => {
        const lecturasRef = ref(db, 'sensor_status/actual');

        const unsubscribe = onValue(lecturasRef, async (snapshot) => {
            const data = snapshot.val() as SensorData;
            if (!data) return;

            const checkAndAlert = async (
                key: string,
                value: number,
                range: { min: number; max: number; label: string; unit: string }
            ) => {
                const isOutOfRange = value < range.min || value > range.max;

                if (isOutOfRange) {
                    const now = Date.now();
                    const lastAlert = lastAlertTimeRef.current[key] || 0;

                    if (now - lastAlert > ALERT_COOLDOWN) {
                        // Create alert message
                        const message = `${range.label} fuera de rango: ${value}${range.unit}`;

                        // Push to Firebase
                        try {
                            await push(ref(db, 'alerts'), {
                                type: key,
                                message,
                                value,
                                timestamp: serverTimestamp(),
                                read: false
                            });

                            // Local notification
                            toast({
                                title: "Alerta detectada",
                                description: `${message}. Rango seguro: ${range.min}-${range.max}${range.unit}`,
                                variant: "destructive",
                            });

                            // Update last alert time
                            lastAlertTimeRef.current[key] = now;
                        } catch (error) {
                            console.error("Error saving alert:", error);
                        }
                    }
                }
            };

            // Calculate pH from voltage if needed, or use raw if that's what we monitor. 
            // Dashboard calculates pH from voltage: 7 - (voltaje - 2.5) * 3.5
            const phValue = 7 - (data.phVoltaje - 2.5) * 3.5;

            checkAndAlert('tempAgua', data.tempAgua, SENSOR_RANGES.tempAgua);
            checkAndAlert('tempAire', data.tempAire, SENSOR_RANGES.tempAire);
            checkAndAlert('humedadAire', data.humedadAire, SENSOR_RANGES.humedadAire);
            checkAndAlert('ph', phValue, SENSOR_RANGES.ph);
            checkAndAlert('rssi', data.rssi, SENSOR_RANGES.rssi);

        });

        return () => unsubscribe();
    }, []);
}
