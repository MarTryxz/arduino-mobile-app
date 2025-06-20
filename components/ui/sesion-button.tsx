"use client"
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export function SignInPersonalizado() {
  return (
    <SignInButton mode="modal" appearance={{baseTheme: dark}}>
      <button style={{ minWidth: 120, position: 'relative', cursor: 'pointer', padding: '12px 17px', border: 0, borderRadius: 7, boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)', background: 'radial-gradient(ellipse at bottom, rgba(71, 81, 92, 1) 0%, rgba(11, 21, 30, 1) 45%)', color: 'rgb(255, 255, 255, 0.66)', transition: 'all 1s cubic-bezier(0.15, 0.83, 0.66, 1)',
}}>
Iniciar sesion</button>
    </SignInButton>
  )
}

export function SignUpPersonalizado() {
  return (
    <SignUpButton mode="modal" appearance={{baseTheme: dark}}>
      <button style={{ minWidth: 120, position: 'relative', cursor: 'pointer', padding: '12px 17px', border: 0, borderRadius: 7, boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)', background: 'radial-gradient(ellipse at bottom, rgba(71, 81, 92, 1) 0%, rgba(11, 21, 30, 1) 45%)', color: 'rgb(255, 255, 255, 0.66)', transition: 'all 1s cubic-bezier(0.15, 0.83, 0.66, 1)',
}}>Registrarse</button>
    </SignUpButton>
  )
}
