"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { db } from "@/firebase"
import { ref, onValue, update, remove } from "firebase/database"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, User, Crown, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface UserData {
    uid: string
    email: string
    displayName?: string
    role: string
    firstName?: string
    lastName?: string
}

export default function AdminUsersPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<UserData[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    // Check admin role and fetch users
    useEffect(() => {
        if (!user) return

        const checkRoleAndFetch = async () => {
            const userRoleRef = ref(db, `users/${user.uid}/role`)

            onValue(userRoleRef, (snapshot) => {
                const role = snapshot.val()
                if (role !== 'admin') {
                    router.push('/dashboard')
                    return
                }

                // Fetch all users if admin
                const usersRef = ref(db, 'users')
                onValue(usersRef, (usersSnapshot) => {
                    const data = usersSnapshot.val()
                    if (data) {
                        const usersList = Object.entries(data).map(([uid, userData]: [string, any]) => ({
                            uid,
                            email: userData.email || 'No email', // Fallback if email not directly in node (auth usually handles this, but good to have)
                            displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Sin nombre',
                            role: userData.role || 'cliente',
                            ...userData
                        }))
                        setUsers(usersList)
                    } else {
                        setUsers([])
                    }
                    setLoading(false)
                })
            })
        }

        checkRoleAndFetch()
    }, [user, router])

    const handleRoleChange = async (uid: string, newRole: string) => {
        try {
            await update(ref(db, `users/${uid}`), {
                role: newRole
            })
            toast.success("Rol actualizado correctamente")
        } catch (error) {
            console.error("Error updating role:", error)
            toast.error("Error al actualizar el rol")
        }
    }

    const handleDeleteUser = async (uid: string, userName: string | undefined) => {
        if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${userName}? Esta acción borrará sus datos de la base de datos.`)) {
            try {
                await remove(ref(db, `users/${uid}`))
                toast.success("Usuario eliminado correctamente")
            } catch (error) {
                console.error("Error deleting user:", error)
                toast.error("Error al eliminar el usuario")
            }
        }
    }

    const filteredUsers = users.filter(u =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <DashboardHeader title="Administración de Usuarios" />

            <main className="container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-bold">Usuarios Registrados</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Buscar usuario..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Rol Actual</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((userData) => (
                                        <TableRow key={userData.uid}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{userData.displayName}</span>
                                                    <span className="text-sm text-gray-500">{userData.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={userData.role === 'admin' ? 'destructive' : userData.role === 'cliente_premium' ? 'default' : 'secondary'}
                                                    className={userData.role === 'cliente_premium' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                                                >
                                                    {userData.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                                                    {userData.role === 'cliente_premium' && <Crown className="w-3 h-3 mr-1" />}
                                                    {userData.role === 'cliente' && <User className="w-3 h-3 mr-1" />}
                                                    {userData.role === 'admin' ? 'Administrador' : userData.role === 'cliente_premium' ? 'Premium' : 'Cliente'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    defaultValue={userData.role}
                                                    onValueChange={(value) => handleRoleChange(userData.uid, value)}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Seleccionar rol" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cliente">Cliente</SelectItem>
                                                        <SelectItem value="cliente_premium">Premium</SelectItem>
                                                        <SelectItem value="admin">Administrador</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => handleDeleteUser(userData.uid, userData.displayName)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div >
    )
}
