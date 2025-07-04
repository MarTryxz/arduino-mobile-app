"use client"
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export function SignInPersonalizado() {
  return (
    <SignInButton mode="modal" appearance={{baseTheme: dark}}>
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
Iniciar sesion</button>
    </SignInButton>
  )
}

export function SignUpPersonalizado() {
  return (
    <SignUpButton mode="modal" appearance={{baseTheme: dark}}>
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Registrarse</button>
    </SignUpButton>
  )
}
