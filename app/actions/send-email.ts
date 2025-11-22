'use server'

import { Resend } from 'resend'

export async function sendEmail(formData: FormData) {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const message = formData.get('message') as string

    if (!name || !email || !message) {
        return { error: 'Por favor completa todos los campos' }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'AcquaGuard <onboarding@resend.dev>',
            to: ['martin.romoarros224@gmail.com'],
            subject: `Nuevo mensaje de contacto de ${name}`,
            html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
            replyTo: email,
        })

        if (error) {
            console.error('Resend error:', error)
            return { error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Server error:', error)
        return { error: 'Error al enviar el correo' }
    }
}
