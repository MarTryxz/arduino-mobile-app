import { Metadata } from "next"
import { SharedDashboardClient } from "@/components/shared-dashboard-client"

interface Props {
    params: { token: string }
}

// Dynamic Metadata for Link Previews
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: "Estado de la Piscina - Vista de Invitado",
        description: "Monitoreo en tiempo real de temperatura y calidad del agua.",
        openGraph: {
            title: "Estado de la Piscina - Vista de Invitado",
            description: "Consulta la temperatura actual y el estado del agua en tiempo real.",
            images: ['/og-pool.png'],
        },
    }
}

export default function SharedDashboardPage({ params }: Props) {
    return <SharedDashboardClient token={params.token} />
}
