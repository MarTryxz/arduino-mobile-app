export const SENSOR_RANGES = {
    tempAgua: { min: 18, max: 28, label: "Temperatura del Agua", unit: "°C" },
    tempAire: { min: 15, max: 40, label: "Temperatura del Aire", unit: "°C" },
    humedadAire: { min: 0, max: 70, label: "Humedad del Aire", unit: "%" },
    ph: { min: 7.0, max: 14, label: "pH", unit: "" },
    rssi: { min: -80, max: 0, label: "Señal WiFi", unit: "dBm" },
} as const;
