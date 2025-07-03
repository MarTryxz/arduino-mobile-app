"use client"

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { SignInPersonalizado, SignUpPersonalizado } from '@/components/ui/sesion-button'

export default function HomePage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  const carouselRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const images = [
      '/landing-page/arduino.png',
      '/landing-page/control.jpg',
      '/landing-page/piscina.jpg',
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
  if (!isLoaded || isSignedIn) {
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
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/landing-page/logo aquaguard.png" alt="Logo AquaGuard" className="h-20 w-auto" />
            <h1 className="text-2xl font-bold text-blue-600">AquaGuard</h1>
          </div>
          <nav className="space-x-4">
            <a href="#features" className="text-gray-600 hover:text-blue-500">Características</a>
            <a href="#quienes-somos" className="text-gray-600 hover:text-blue-500">¿Quiénes somos?</a>
            <a href="#contacto" className="text-gray-600 hover:text-blue-500">Contacto</a>
            <SignInPersonalizado/>
            <SignUpPersonalizado/>
          </nav>
        </div>
      </header>

      {/* HERO + CARRUSEL */}
      <div className="relative w-full overflow-hidden bg-white rounded-xl shadow-lg max-w-screen-xl mx-auto mt-6">
        <div className="h-80 sm:h-[24rem] md:h-[28rem] flex items-center justify-center">
          <img
            ref={carouselRef}
            src="/landing-page/arduino.png"
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
              <img src="/landing-page/romo.jpg" alt="Miembro 1" className="w-full h-64 object-cover rounded-xl shadow-md" />
              <p className="mt-2 text-blue-700 font-semibold">Martin Romo</p>
              <p className="mt-2 text-black-500 font-semibold">Backend</p>
            </div>

            {/* Miembro 2 */}
            <div className="transform transition duration-500 hover:scale-105 hover:shadow-lg">
              <img src="/landing-page/nico.png" alt="Miembro 2" className="w-full h-64 object-cover rounded-xl shadow-md" />
              <p className="mt-2 text-blue-700 font-semibold">Nicolás Guerra</p>
              <p className="mt-2 text-black-500 font-semibold">Frontend</p>
            </div>

            {/* Miembro 3 */}
            <div className="transform transition duration-500 hover:scale-105 hover:shadow-lg">
              <img src="/landing-page/m.jpg" alt="Miembro 3" className="w-full h-64 object-cover rounded-xl shadow-md" />
              <p className="mt-2 text-blue-700 font-semibold">Matias Maldonado</p>
              <p className="mt-2 text-black-500 font-semibold">QA</p>
            </div>

            {/* Miembro 4 */}
            <div className="transform transition duration-500 hover:scale-105 hover:shadow-lg">
              <img src="/landing-page/orellana.png" alt="Miembro 4" className="w-full h-64 object-cover rounded-xl shadow-md" />
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
