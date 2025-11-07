"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { SignInPersonalizado, SignUpPersonalizado } from '@/components/ui/sesion-button'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [loading, user, router])

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const carouselRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const images = [
      '/landing-page/arduino.webp',
      '/landing-page/control.webp',
      '/landing-page/piscina.webp',
    ];
    let current = 0;
    function showImage(i: number) {
      if (!carouselRef.current) return;
      carouselRef.current.src = images[i];
      carouselRef.current.classList.remove('opacity-0');
      setTimeout(() => {
        carouselRef.current?.classList.add('opacity-100');
      }, 50);
    }
    const interval = setInterval(() => {
      current = (current + 1) % images.length;
      showImage(current);
    }, 3500);
    showImage(0);
    return () => clearInterval(interval);
  }, []);

  // Mostrar loader mientras carga o si está autenticado (para evitar parpadeo de la landing)
  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar la landing
  return (
    <div className="bg-blue-50 text-gray-800 min-h-screen">
      {/* HEADER */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center relative">
          {/* Botón hamburguesa solo en móvil */}
          <button
            className="md:hidden absolute right-4 top-6 z-30 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Abrir menú"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <img src="/landing-page/logo aquaguard.webp" alt="Logo AquaGuard" className="h-20 w-auto" />
            <h1 className="text-2xl font-bold text-blue-600">AquaGuard</h1>
            <h4 className="text-lg font-semibold text-blue-600">Por OpenRakiduam</h4>
          </div>
          {/* Navbar escritorio */}
          <nav className="space-x-4 hidden md:flex">
            <a href="#features" className="text-gray-600 hover:text-blue-500">Características</a>
            <a href="#quienes-somos" className="text-gray-600 hover:text-blue-500">¿Quiénes somos?</a>
            <a href="#contacto" className="text-gray-600 hover:text-blue-500">Contacto</a>
            <SignInPersonalizado />
            <SignUpPersonalizado />
          </nav>

          {/* Sidebar móvil */}
          {/* Fondo semitransparente */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-20 md:hidden animate-fade-in"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside
            className={
              `fixed top-0 right-0 h-full w-2/3 max-w-xs bg-white shadow-lg z-30 flex flex-col items-start px-6 py-16 gap-4 transform transition-transform duration-300 md:hidden ` +
              (sidebarOpen ? 'translate-x-0' : 'translate-x-full')
            }
            aria-label="Menú lateral"
          >
            <button
              className="absolute top-4 right-4 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Cerrar menú"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <a href="#features" className="text-gray-600 hover:text-blue-500 py-2 w-full" onClick={() => setSidebarOpen(false)}>Características</a>
            <a href="#quienes-somos" className="text-gray-600 hover:text-blue-500 py-2 w-full" onClick={() => setSidebarOpen(false)}>¿Quiénes somos?</a>
            <a href="#contacto" className="text-gray-600 hover:text-blue-500 py-2 w-full" onClick={() => setSidebarOpen(false)}>Contacto</a>
            <SignInPersonalizado />
            <SignUpPersonalizado />
          </aside>
        </div>
      </header>

      {/* HERO + CARRUSEL */}
      <div className="relative w-full overflow-hidden bg-white rounded-xl shadow-lg max-w-screen-xl mx-auto mt-6">
        <div className="h-80 sm:h-[24rem] md:h-[28rem] flex items-center justify-center">
          <img
            ref={carouselRef}
            src="/landing-page/arduino.webp"
            className="w-full h-full object-cover rounded-xl scale-95 transition-all duration-700"
            alt="Imagen carrusel"
          />
        </div>
      </div>

      {/* Secciones adicionales de la landing page */}
      <section id="features" className="py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-blue-800 mb-10">Características</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in delay-200">
              <h4 className="text-xl font-semibold text-blue-700 mb-2">Monitoreo en Tiempo Real</h4>
              <p className="text-gray-700">Consulta los datos de tu piscina en cualquier momento y desde cualquier lugar.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in delay-400">
              <h4 className="text-xl font-semibold text-blue-700 mb-2">Alertas Inteligentes</h4>
              <p className="text-gray-700">Recibe notificaciones cuando los parámetros estén fuera de rango.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in delay-600">
              <h4 className="text-xl font-semibold text-blue-700 mb-2">Fácil Instalación</h4>
              <p className="text-gray-700">Diseñado para una integración rápida y sin complicaciones.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="quienes-somos" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-blue-800 mb-10">¿Quiénes somos?</h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            Somos un equipo apasionado por la tecnología, la automatización y el confort. AquaGuard nace con la misión de facilitar el monitoreo de piscinas mediante sensores inteligentes y conectividad en tiempo real.
          </p>

          {/* GALERÍA DE MIEMBROS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Miembro 1 */}
            <div className="transform transition duration-500 hover:scale-105 hover:shadow-lg">
              <img src="/landing-page/romo.webp" alt="Miembro 1" className="w-full h-64 object-cover rounded-xl shadow-md" />
              <p className="mt-2 text-blue-700 font-semibold">Martin Romo</p>
              <p className="mt-2 text-black-500 font-semibold">Backend</p>
            </div>

            {/* Miembro 2 */}
            <div className="transform transition duration-500 hover:scale-105 hover:shadow-lg">
              <img src="/landing-page/nico.webp" alt="Miembro 2" className="w-full h-64 object-cover rounded-xl shadow-md" />
              <p className="mt-2 text-blue-700 font-semibold">Nicolás Guerra</p>
              <p className="mt-2 text-black-500 font-semibold">Frontend</p>
            </div>

            {/* Miembro 3 */}
            <div className="transform transition duration-500 hover:scale-105 hover:shadow-lg">
              <img src="/landing-page/m.webp" alt="Miembro 3" className="w-full h-64 object-cover rounded-xl shadow-md" />
              <p className="mt-2 text-blue-700 font-semibold">Matias Maldonado</p>
              <p className="mt-2 text-black-500 font-semibold">QA</p>
            </div>

            {/* Miembro 4 */}
            <div className="transform transition duration-500 hover:scale-105 hover:shadow-lg">
              <img src="/landing-page/orellana.webp" alt="Miembro 4" className="w-full h-64 object-cover rounded-xl shadow-md" />
              <p className="mt-2 text-blue-700 font-semibold">Martin Orellana</p>
              <p className="mt-2 text-black-500 font-semibold">Fullstack</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-blue-800 mb-10">Contacto</h3>
          <p className="text-lg text-gray-700 mb-8">¿Tienes preguntas? ¡Contáctanos!</p>
          <form className="max-w-lg mx-auto">
            <div className="mb-4">
              <input type="text" className="w-full p-3 rounded border border-gray-300" placeholder="Nombre" />
            </div>
            <div className="mb-4">
              <input type="email" className="w-full p-3 rounded border border-gray-300" placeholder="Correo electrónico" />
            </div>
            <div className="mb-4">
              <textarea className="w-full p-3 rounded border border-gray-300" rows={4} placeholder="Mensaje"></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Enviar</button>
          </form>
        </div>
      </section>
    </div>
  );
}
