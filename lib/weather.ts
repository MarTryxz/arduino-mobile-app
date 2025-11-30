export interface WeatherData {
    current: {
        temperature: number
        weatherCode: number
    }
    daily: {
        maxTemp: number
        minTemp: number
    }
}

export const DEFAULT_LOCATION = {
    lat: -33.4489, // Santiago de Chile
    lon: -70.6693
}

export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherData | null> {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`

        const response = await fetch(url)
        if (!response.ok) throw new Error('Weather API failed')

        const data = await response.json()

        return {
            current: {
                temperature: data.current.temperature_2m,
                weatherCode: data.current.weather_code
            },
            daily: {
                maxTemp: data.daily.temperature_2m_max[0],
                minTemp: data.daily.temperature_2m_min[0]
            }
        }
    } catch (error) {
        console.error('Error fetching weather:', error)
        return null
    }
}

export function getWeatherIcon(code: number): string {
    // WMO Weather interpretation codes (WW)
    // 0: Clear sky
    // 1, 2, 3: Mainly clear, partly cloudy, and overcast
    // 45, 48: Fog and depositing rime fog
    // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
    // 61, 63, 65: Rain: Slight, moderate and heavy intensity
    // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
    // 95: Thunderstorm: Slight or moderate

    if (code <= 3) return "☀️" // Clear/Cloudy
    if (code <= 48) return "🌫️" // Fog
    if (code <= 67) return "🌧️" // Rain
    if (code <= 77) return "❄️" // Snow
    if (code <= 82) return "🌧️" // Rain showers
    if (code <= 86) return "❄️" // Snow showers
    if (code <= 99) return "⚡" // Thunderstorm

    return "🌤️" // Default
}

export function getWeatherDescription(code: number): string {
    if (code === 0) return "Despejado"
    if (code <= 3) return "Parcialmente nublado"
    if (code <= 48) return "Neblina"
    if (code <= 67) return "Lluvia"
    if (code <= 77) return "Nieve"
    if (code <= 99) return "Tormenta"
    return "Normal"
}
