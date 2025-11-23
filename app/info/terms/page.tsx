"use client";

import Link from "next/link";
import { Home, History, Bell, Info, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserButton } from "@/components/ui/user-button";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DashboardHeader } from "@/components/dashboard-header";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <DashboardHeader title="Términos y Condiciones" />
      <main className="max-w-3xl mx-auto px-4 py-10 text-gray-800 dark:text-gray-100">

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">AquaGuard</h2>
          <p className="mb-4 text-justify">
            AquaGuard es un sistema inteligente diseñado para facilitar y optimizar el mantenimiento de piscinas. Utiliza sensores IoT para monitorear en tiempo real los niveles de pH, cloro y temperatura del agua, enviando alertas automáticas cuando se detectan valores fuera del rango óptimo. A través de una aplicación móvil, AquaGuard permite a los usuarios supervisar su piscina desde cualquier lugar, reducir el trabajo manual y asegurar un entorno limpio y seguro para el uso diario.
          </p>
        </section>

        <section className="mb-8">
          <p className="mb-4 text-justify">
            Este documento establece los términos y condiciones que regulan el uso del sitio web, la aplicación web y cualquier producto o servicio ofrecido por OpenRakiduam SpA, empresa de desarrollo tecnológico responsable de la plataforma AquaGuard. Al acceder a nuestros servicios, el usuario declara haber leído, comprendido y aceptado expresamente este acuerdo. Si no está de acuerdo con alguno de los términos aquí expresados, deberá abstenerse de utilizar nuestros servicios.
          </p>
          <p className="mb-4 text-justify">
            OpenRakiduam SpA es una empresa legalmente constituida en la República de Chile, con domicilio comercial en "Av. Libertador Gral. Bernardo O'Higgins", correo electrónico de contacto contacto@openrakiduam.cl, y responsable del desarrollo, comercialización y soporte del sistema AquaGuard, una solución tecnológica para el monitoreo y automatización del mantenimiento de piscinas mediante sensores IoT, software web y app móvil.
          </p>
          <p className="mb-4 text-justify">
            El acceso al sitio web y a la plataforma está permitido exclusivamente a personas mayores de edad con capacidad legal para contratar. Al registrarse o utilizar el sistema, el usuario se compromete a proporcionar información veraz y a mantener actualizados sus datos personales. Además, será responsable de la custodia de sus credenciales de acceso, asumiendo toda responsabilidad por su uso indebido o por parte de terceros.
          </p>
          <p className="mb-4 text-justify">
            El usuario asume el compromiso de utilizar los servicios conforme a la ley, la moral, el orden público y las presentes condiciones. Cualquier uso que implique un perjuicio a terceros, que vulnere derechos de propiedad intelectual o que comprometa la seguridad de la plataforma será considerado una infracción grave y podrá dar lugar a la suspensión o cancelación de la cuenta, sin perjuicio de las acciones legales que puedan emprenderse.
          </p>
          <p className="mb-4 text-justify">
            Los productos y servicios ofrecidos a través del sitio web estarán disponibles según stock, condiciones técnicas y zona de cobertura. OpenRakiduam se reserva el derecho de modificar precios, condiciones de venta, contenidos y funcionalidades sin previo aviso. Todos los precios se expresan en pesos chilenos (CLP) e incluyen los impuestos legalmente establecidos. Las promociones o descuentos serán debidamente informados, y estarán sujetos a un plazo de vigencia y disponibilidad.
          </p>
          <p className="mb-4 text-justify">
            Se considera uso prohibido cualquier intento de acceder sin autorización a sistemas, servicios o cuentas ajenas, así como la reproducción, ingeniería inversa, distribución o modificación no autorizada del software o del hardware asociado al sistema AquaGuard. Asimismo, se prohíbe manipular sensores, falsificar datos de monitoreo o utilizar la plataforma con fines distintos a los especificados.
          </p>
          <p className="mb-4 text-justify">
            Todos los productos físicos comercializados por OpenRakiduam cuentan con una garantía legal de seis meses por fallas de fabricación, conforme a la Ley del Consumidor de Chile. Esta garantía no cubre daños por uso indebido, instalación incorrecta, intervención de terceros no autorizados o negligencia. Respecto al software y la plataforma web o móvil, OpenRakiduam se compromete a mantener un servicio continuo y seguro, sin embargo, no garantiza la disponibilidad ininterrumpida, ya que puede haber interrupciones programadas o fallos técnicos fuera de su control.
          </p>
          <p className="mb-4 text-justify">
            Este contrato se rige por las leyes de la República de Chile, especialmente por la Ley N° 19.496 sobre protección de los derechos de los consumidores y la Ley N° 19.628 sobre protección de la vida privada. En caso de cualquier controversia relacionada con el uso de los servicios, las partes acuerdan intentar primero una solución amistosa mediante contacto directo con OpenRakiduam. Si no se logra un acuerdo, las partes se someten expresamente a la jurisdicción de los tribunales ordinarios de justicia de la ciudad de Santiago de Chile, renunciando a cualquier otro fuero o jurisdicción.
          </p>
          <p className="mb-4 text-justify">
            En relación con la política de reembolsos, el cliente tendrá derecho a solicitar la devolución de su dinero dentro de un plazo máximo de diez días corridos desde la recepción del producto o desde la activación del servicio digital. Para que un reembolso sea aceptado, el producto físico deberá encontrarse sin uso, completo, en su empaque original y en condiciones óptimas. Los servicios digitales, como suscripciones o software, solo serán reembolsables si no han sido activados. Las instalaciones técnicas o visitas de soporte en terreno no son reembolsables una vez realizadas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Contacto y Soporte</h2>
          <ul className="mb-2 text-gray-800 dark:text-gray-300">
            <li>📧 contacto@openrakiduam.cl</li>
            <li>📦 soporte@openrakiduam.cl</li>
            <li>🌐 www.aquaguard.cl</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
