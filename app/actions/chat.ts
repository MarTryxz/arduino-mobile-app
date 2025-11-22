'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || '')

export async function sendMessageToGemini(message: string, contextData: any) {
    try {
        if (!process.env.GEMINI_API) {
            return { error: 'API Key no configurada' }
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

        const systemPrompt = `
      Eres un asistente inteligente experto en mantenimiento de piscinas llamado "AquaGuard AI".
      Tu objetivo es ayudar al usuario a mantener su piscina en óptimas condiciones basándote en los datos de los sensores.
      
      Datos actuales de la piscina:
      ${JSON.stringify(contextData, null, 2)}
      
      Instrucciones:
      1. Analiza los datos proporcionados (pH, temperatura, humedad).
      2. Si se te pide un reporte, da un resumen del estado actual y recomendaciones específicas si algo está fuera de rango.
      3. Rangos ideales:
         - pH: 7.2 - 7.6
         - Temperatura del agua: 26°C - 29°C
         - Humedad: 40% - 60%
      4. Sé amable, conciso y profesional.
      5. Si te preguntan algo fuera del contexto de piscinas, responde amablemente que solo puedes ayudar con temas de AquaGuard.
    `

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Entendido. Soy AquaGuard AI, listo para ayudar con el mantenimiento de la piscina basándome en los datos proporcionados.' }],
                },
            ],
        })

        const result = await chat.sendMessage(message)
        const response = result.response
        const text = response.text()

        return { text }
    } catch (error: any) {
        console.error('Error en Gemini AI:', error)
        return { error: 'Error al comunicarse con el asistente. Por favor intenta más tarde.' }
    }
}
