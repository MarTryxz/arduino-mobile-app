# Arduino Mobile App (Next.js + PWA)

Este proyecto es una aplicación web progresiva (PWA) construida con Next.js 15, TypeScript y TailwindCSS, diseñada para funcionar como una app móvil y de escritorio moderna, rápida y confiable.

## Características principales

- **Next.js 15**: Framework React para aplicaciones modernas, soportando rutas tipo App Router.
- **PWA (Progressive Web App)**: Instalación en dispositivos móviles, funcionamiento offline, y experiencia similar a una app nativa.
- **next-pwa**: Integración automática de Service Worker y caché para recursos estáticos y rutas.
- **TailwindCSS**: Utilidad para estilos rápidos y responsivos.
- **Componentes UI**: Uso de Radix UI, react-day-picker, y otros componentes modernos.

---

## Instalación y desarrollo

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/MarTryxz/arduino-mobile-app.git
   cd arduino-mobile-app
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Desarrolla localmente:**
   ```bash
   npm run dev
   ```
   Accede a `http://localhost:3000` en tu navegador.

---

## Compilación para producción

1. **Configura la exportación estática:**
   El archivo `next.config.js` ya incluye:
   ```js
   output: 'export',
   ```
   Esto habilita la exportación estática compatible con Firebase Hosting y otros proveedores de archivos estáticos.

2. **Construye la aplicación:**
   ```bash
   npm run build
   ```
   Esto generará la carpeta `out/` con los archivos listos para producción.

---

## Despliegue en Firebase Hosting

1. **Instala Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Inicializa Firebase en tu proyecto:**
   ```bash
   firebase login
   firebase init
   ```
   - Elige **Hosting**.
   - Selecciona tu proyecto.
   - Carpeta pública: `out`
   - No sobrescribas `index.html` si te pregunta.

3. **Despliega:**
   ```bash
   firebase deploy
   ```

---

## Uso como PWA en móvil

- Accede a la app desde el navegador móvil.
- El navegador mostrará la opción "Agregar a la pantalla de inicio".
- Una vez agregada, funcionará como una app nativa, incluso offline.

---

## Estructura del proyecto

- `/app` — Rutas y páginas principales (App Router)
- `/components/ui` — Componentes reutilizables de UI
- `/public` — Archivos públicos, imágenes, manifest.json, sw.js
- `/styles` — Estilos globales
- `next.config.js` — Configuración de Next.js y next-pwa
- `package.json` — Dependencias y scripts

---

## Dependencias clave

- **next**: 15.2.4
- **next-pwa**: ^5.6.0
- **react**: ^18
- **react-dom**: ^18
- **tailwindcss**: ^3.4.17
- **react-day-picker**: ^9.6.7
- **radix-ui**: Varios paquetes para UI accesible

---

## Integración con Capacitor

Si quieres empaquetar la aplicación como app móvil (Android/iOS) usando Capacitor, asegúrate de que la configuración apunte a la carpeta correcta donde Next.js exporta los archivos estáticos.

1. Crea o edita el archivo `capacitor.config.ts` en la raíz del proyecto:
   ```ts
   export default {
     webDir: "out",
     appId: "com.tuempresa.arduinomobile",
     appName: "Arduino Mobile App"
   };
   ```
   > **Nota:** `webDir` debe ser `out`, ya que es la carpeta generada por `npm run build`.

2. Después de construir el proyecto (`npm run build`), ejecuta los comandos de Capacitor para sincronizar y abrir la app en la plataforma deseada:
   ```bash
   npx cap sync
   npx cap open android # o ios
   ```

---

## Notas adicionales

- Si usas funcionalidades dinámicas (SSR, API routes), necesitarás un entorno con Node.js (Vercel, etc). Para sitios puramente estáticos, Firebase Hosting es suficiente.
- El Service Worker (`sw.js`) es generado y gestionado automáticamente por `next-pwa` en producción.
- Consulta la documentación oficial de [Next.js](https://nextjs.org/docs) y [next-pwa](https://github.com/shadowwalker/next-pwa) para personalizaciones avanzadas.

---

## Licencia

MIT
<!-- Autor: Martín -->