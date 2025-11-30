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
import { Search, Shield, User, Crown, Trash2, MoreHorizontal, Copy, Calendar, Filter, Users, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    const [roleFilter, setRoleFilter] = useState("all")
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [newRole, setNewRole] = useState("")

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

    const openRoleDialog = (user: UserData) => {
        setSelectedUser(user)
        setNewRole(user.role)
        setIsRoleDialogOpen(true)
    }

    const handleSaveRole = async () => {
        if (!selectedUser || !newRole) return

        try {
            await update(ref(db, `users/${selectedUser.uid}`), {
                role: newRole
            })
            toast.success("Rol actualizado correctamente")
            setIsRoleDialogOpen(false)
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = roleFilter === 'all' || u.role === roleFilter
        return matchesSearch && matchesFilter
    })

    const totalUsers = users.length
    const premiumUsers = users.filter(u => u.role === 'cliente_premium').length
    const adminUsers = users.filter(u => u.role === 'admin').length

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

            <main className="container mx-auto px-4 py-8 space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsers}</div>
                            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Usuarios Premium</CardTitle>
                            <Crown className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{premiumUsers}</div>
                            <p className="text-xs text-muted-foreground">Suscripciones activas</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                            <Shield className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{adminUsers}</div>
                            <p className="text-xs text-muted-foreground">Con acceso total</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-2xl font-bold">Usuarios Registrados</CardTitle>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Buscar usuario..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4" />
                                            <SelectValue placeholder="Filtrar por rol" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los roles</SelectItem>
                                        <SelectItem value="cliente">Clientes</SelectItem>
                                        <SelectItem value="cliente_premium">Premium</SelectItem>
                                        <SelectItem value="admin">Administradores</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Fecha Registro</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((userData) => {
                                        const isCurrentUser = user?.uid === userData.uid
                                        return (
                                            <TableRow key={userData.uid}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src="" alt={userData.displayName} />
                                                            <AvatarFallback>{getInitials(userData.displayName || 'U')}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{userData.displayName}</span>
                                                            <span className="text-sm text-gray-500">{userData.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <Calendar className="mr-2 h-3 w-3" />
                                                        No disponible
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
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Abrir menú</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => {
                                                                navigator.clipboard.writeText(userData.uid)
                                                                toast.success("ID copiado al portapapeles")
                                                            }}>
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                Copiar ID
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => openRoleDialog(userData)} disabled={isCurrentUser}>
                                                                <Shield className="mr-2 h-4 w-4" />
                                                                Cambiar Rol
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                                                onClick={() => handleDeleteUser(userData.uid, userData.displayName)}
                                                                disabled={isCurrentUser}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
                        <DialogDescription>
                            Selecciona el nuevo rol para <strong>{selectedUser?.displayName}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Rol
                            </Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cliente">Cliente</SelectItem>
                                    <SelectItem value="cliente_premium">Premium</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveRole}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
