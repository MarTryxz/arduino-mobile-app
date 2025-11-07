"use client"
import Link from 'next/link'

export function SignInPersonalizado() {
  return (
    <Link href="/login">
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition">
        Iniciar sesión
      </button>
    </Link>
  )
}

export function SignUpPersonalizado() {
  return (
    <Link href="/register">
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition">
        Registrarse
      </button>
    </Link>
  )
}
