import { db } from "@/firebase"
import { ref, push, serverTimestamp } from "firebase/database"

export interface AuditLog {
    id?: string
    action: string
    details: string
    adminUid: string
    adminEmail: string
    targetUid?: string
    timestamp: number | object
}

export const logAdminAction = async (
    action: string,
    details: string,
    adminUid: string,
    adminEmail: string,
    targetUid?: string
) => {
    try {
        const logsRef = ref(db, 'admin_logs')
        await push(logsRef, {
            action,
            details,
            adminUid,
            adminEmail,
            targetUid: targetUid || null,
            timestamp: serverTimestamp()
        })
    } catch (error) {
        console.error("Error logging admin action:", error)
    }
}
