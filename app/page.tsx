"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { SignInPersonalizado, SignUpPersonalizado } from '@/components/ui/sesion-button'
import { useTheme } from 'next-themes'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) return null;

  // Mostrar loader mientras carga o si está autenticado (para evitar parpadeo de la landing)
  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar la landing
  return (
    <div className="bg-white dark:bg-slate-950 text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300">
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-900 shadow-lg dark:shadow-slate-800/50 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center relative">
          {/* Botón hamburguesa solo en móvil */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Abrir menú"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-2 md:space-x-3">
            <img src="/landing-page/logo aquaguard.webp" alt="Logo AquaGuard" className="h-12 md:h-16 w-auto" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">AquaGuard</h1>
              <h4 className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400">Por OpenRakiduam</h4>
            </div>
          </div>
          {/* Navbar escritorio */}
          <nav className="space-x-6 hidden md:flex items-center">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Características</a>
            <a href="#quienes-somos" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">¿Quiénes somos?</a>
            <a href="#contacto" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Contacto</a>
            <div className="flex gap-3">
              <SignInPersonalizado />
              <SignUpPersonalizado />
            </div>
          </nav>

          {/* Sidebar móvil */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside
            className={
              `fixed top-0 right-0 h-full w-2/3 max-w-xs bg-white dark:bg-slate-900 shadow-xl z-30 flex flex-col items-start px-6 py-16 gap-4 transform transition-transform duration-300 md:hidden ` +
              (sidebarOpen ? 'translate-x-0' : 'translate-x-full')
            }
            aria-label="Menú lateral"
          >
            <button
              className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Cerrar menú"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 w-full font-medium transition-colors" onClick={() => setSidebarOpen(false)}>Características</a>
            <a href="#quienes-somos" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 w-full font-medium transition-colors" onClick={() => setSidebarOpen(false)}>¿Quiénes somos?</a>
            <a href="#contacto" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 w-full font-medium transition-colors" onClick={() => setSidebarOpen(false)}>Contacto</a>
            <div className="w-full flex flex-col gap-2 mt-4">
              <SignInPersonalizado />
              <SignUpPersonalizado />
            </div>
          </aside>
        </div>
      </header>

      {/* HERO + CARRUSEL */}
      <section className="relative w-full px-4 py-12 md:py-20 bg-gradient-to-b from-white to-gray-50 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
              Controla tu piscina inteligentemente
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Monitoreo en tiempo real, alertas inteligentes y control total desde tu dispositivo
            </p>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-2xl max-w-4xl mx-auto group">
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            <div className="h-80 sm:h-[24rem] md:h-[32rem] flex items-center justify-center relative z-10">
              <img
                ref={carouselRef}
                src="/landing-page/arduino.webp"
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                alt="Imagen carrusel"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Secciones adicionales de la landing page */}
      <section id="features" className="py-20 md:py-32 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Características Principales</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-16 text-lg">Tecnología avanzada para el cuidado de tu piscina</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Monitoreo en Tiempo Real</h4>
              <p className="text-gray-600 dark:text-gray-300">Consulta los datos de tu piscina en cualquier momento y desde cualquier lugar con actualizaciones al instante.</p>
            </div>
            <div className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Alertas Inteligentes</h4>
              <p className="text-gray-600 dark:text-gray-300">Recibe notificaciones automáticas cuando los parámetros de tu piscina estén fuera de rango seguro.</p>
            </div>
            <div className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Fácil Instalación</h4>
              <p className="text-gray-600 dark:text-gray-300">Diseñado para una integración rápida y sin complicaciones en tu sistema existente.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="quienes-somos" className="bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 py-20 md:py-32 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">¿Quiénes somos?</h3>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-16 max-w-2xl mx-auto">
            Somos un equipo apasionado por la tecnología, la automatización y el confort. AquaGuard nace con la misión de facilitar el monitoreo de piscinas mediante sensores inteligentes y conectividad en tiempo real.
          </p>

          {/* GALERÍA DE MIEMBROS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Miembro 1 */}
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                <img src="/landing-page/romo.webp" alt="Miembro 1" className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <p className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Martin Romo</p>
              <p className="text-blue-600 dark:text-blue-400 font-semibold">Backend</p>
            </div>

            {/* Miembro 2 */}
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                <img src="/landing-page/nico.webp" alt="Miembro 2" className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <p className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Nicolás Guerra</p>
              <p className="text-blue-600 dark:text-blue-400 font-semibold">Frontend</p>
            </div>

            {/* Miembro 3 */}
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                <img src="/landing-page/m.webp" alt="Miembro 3" className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <p className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Matias Maldonado</p>
              <p className="text-blue-600 dark:text-blue-400 font-semibold">QA</p>
            </div>

            {/* Miembro 4 */}
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                <img src="/landing-page/orellana.webp" alt="Miembro 4" className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <p className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Martin Orellana</p>
              <p className="text-blue-600 dark:text-blue-400 font-semibold">Fullstack</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-950 dark:to-slate-900 py-20 md:py-32 transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Contacto</h3>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12">¿Tienes preguntas? Nos encantaría escucharte</p>
          <form className="max-w-lg mx-auto space-y-4">
            <div>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nombre"
              />
            </div>
            <div>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Correo electrónico"
              />
            </div>
            <div>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={4}
                placeholder="Mensaje"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-gray-900 dark:bg-slate-950 text-white py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400 mb-2">© 2024 AquaGuard. Todos los derechos reservados.</p>
          <p className="text-gray-500">Desarrollado por OpenRakiduam</p>
        </div>
      </footer>
    </div>
  );
}
