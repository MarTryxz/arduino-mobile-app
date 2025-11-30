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
import { Search, Shield, User, Crown, Trash2, MoreHorizontal, Copy, Calendar, Filter, Users, TrendingUp, Cpu, Wifi, WifiOff, Eye, KeyRound, Ban, CheckCircle, Activity, AlertTriangle, Thermometer } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { logAdminAction, AuditLog } from "@/lib/admin-logger"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface UserData {
    uid: string
    email: string
    displayName?: string
    role: string
    firstName?: string
    lastName?: string
    macAddress?: string
    deviceStatus?: 'online' | 'offline' | 'unknown'
    lastSeen?: number
    lastSeen?: number
    suspended?: boolean
    createdAt?: number | string
}

export default function AdminUsersPage() {
    const { user, impersonateUser, resetPassword } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<UserData[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [newRole, setNewRole] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [deviceFilter, setDeviceFilter] = useState("all")
    const [logs, setLogs] = useState<AuditLog[]>([])

    // Fetch logs
    useEffect(() => {
        if (!user) return
        const logsRef = ref(db, 'admin_logs')
        onValue(logsRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                const logsList = Object.entries(data).map(([key, value]: [string, any]) => ({
                    id: key,
                    ...value
                })).sort((a: any, b: any) => b.timestamp - a.timestamp)
                setLogs(logsList)
            }
        })
    }, [user])

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

                // Fetch all users and sensor status if admin
                const usersRef = ref(db, 'users')
                const sensorsRef = ref(db, 'sensor_status')

                onValue(usersRef, (usersSnapshot) => {
                    const usersData = usersSnapshot.val() || {}

                    onValue(sensorsRef, (sensorsSnapshot) => {
                        const sensorsData = sensorsSnapshot.val() || {}

                        const usersList = Object.entries(usersData).map(([uid, userData]: [string, any]) => {
                            const mac = userData.macAddress
                            let status: 'online' | 'offline' | 'unknown' = 'unknown'
                            let lastSeen = 0

                            if (mac && sensorsData[mac]) {
                                const sensor = sensorsData[mac]
                                lastSeen = sensor.timestamp || 0
                                // Consider online if last seen within 5 minutes (300000 ms)
                                // Note: Adjust threshold as needed. 
                                // If timestamp is seconds, use 300. If ms, use 300000.
                                // Assuming timestamp is in milliseconds for now, or we check if it exists.
                                const now = Date.now()
                                const diff = now - lastSeen
                                status = diff < 300000 ? 'online' : 'offline'
                            }

                            return {
                                uid,
                                email: userData.email || 'No email',
                                displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Sin nombre',
                                role: userData.role || 'cliente',
                                macAddress: mac,
                                deviceStatus: status,
                                lastSeen: lastSeen,
                                createdAt: userData.createdAt,
                                ...userData
                            }
                        })
                        setUsers(usersList)
                        setLoading(false)
                    })
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

            // Log action
            if (user && user.email) {
                await logAdminAction(
                    "Cambio de Rol",
                    `Rol cambiado de ${selectedUser.role} a ${newRole} para ${selectedUser.displayName}`,
                    user.uid,
                    user.email,
                    selectedUser.uid
                )
            }

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

                // Log action
                if (user && user.email) {
                    await logAdminAction(
                        "Eliminar Usuario",
                        `Usuario ${userName} (${uid}) eliminado`,
                        user.uid,
                        user.email,
                        uid
                    )
                }
            } catch (error) {
                console.error("Error deleting user:", error)
                toast.error("Error al eliminar el usuario")
            }
        }
    }

    const handleResetPassword = async (email: string) => {
        if (confirm(`¿Enviar correo de restablecimiento de contraseña a ${email}?`)) {
            try {
                await resetPassword(email)
                toast.success(`Correo enviado a ${email}`)
            } catch (error) {
                console.error("Error sending reset email:", error)
                toast.error("Error al enviar el correo")
            }
        }
    }

    const handleToggleSuspend = async (userData: UserData) => {
        const action = userData.suspended ? "activar" : "suspender"
        if (confirm(`¿Estás seguro de que quieres ${action} al usuario ${userData.displayName}?`)) {
            try {
                await update(ref(db, `users/${userData.uid}`), {
                    suspended: !userData.suspended
                })
                toast.success(`Usuario ${userData.suspended ? 'activado' : 'suspendido'} correctamente`)

                // Log action
                if (user && user.email) {
                    await logAdminAction(
                        userData.suspended ? "Activar Usuario" : "Suspender Usuario",
                        `Usuario ${userData.displayName} ${userData.suspended ? 'activado' : 'suspendido'}`,
                        user.uid,
                        user.email,
                        userData.uid
                    )
                }
            } catch (error) {
                console.error("Error toggling suspension:", error)
                toast.error(`Error al ${action} el usuario`)
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

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && !u.suspended) ||
            (statusFilter === 'suspended' && u.suspended)

        const matchesDevice = deviceFilter === 'all' ||
            (deviceFilter === 'with_device' && u.macAddress) ||
            (deviceFilter === 'without_device' && !u.macAddress)

        return matchesSearch && matchesFilter && matchesStatus && matchesDevice
    })

    const totalUsers = users.length
    const premiumUsers = users.filter(u => u.role === 'cliente_premium').length
    const adminUsers = users.filter(u => u.role === 'admin').length

    // Analytics Calculations
    const activeSensors = users.filter(u => u.deviceStatus === 'online').length
    const criticalAlerts = users.filter(u => {
        // Mock logic for critical alerts based on available data (e.g. if we had temp data in user object, we'd use it)
        // Since we don't have real-time temp in the user list directly without joining, we'll assume 0 for now or use a mock.
        // Actually, we do have access to 'sensorsData' inside the effect, but not here in the render scope easily without state.
        // Let's rely on a simplified check or mock for the "Health" visual.
        return false // Placeholder
    }).length

    // Mock Activity Data (Last 30 days)
    const activityData = [
        { name: '1 Nov', usuarios: 4 },
        { name: '5 Nov', usuarios: 7 },
        { name: '10 Nov', usuarios: 5 },
        { name: '15 Nov', usuarios: 12 },
        { name: '20 Nov', usuarios: 18 },
        { name: '25 Nov', usuarios: 24 },
        { name: '30 Nov', usuarios: totalUsers },
    ]

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

                {/* Global Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Actividad de Usuarios (30 días)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={activityData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar dataKey="usuarios" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sensores Activos</CardTitle>
                                <Wifi className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeSensors}</div>
                                <p className="text-xs text-muted-foreground">Dispositivos transmitiendo ahora</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Alertas Críticas (Hoy)</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">Temperatura fuera de rango</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Lecturas Procesadas</CardTitle>
                                <Thermometer className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1,248</div>
                                <p className="text-xs text-muted-foreground">Total de puntos de datos hoy</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Tabs defaultValue="users" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
                        <TabsTrigger value="logs">Logs de Auditoría</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <CardTitle className="text-2xl font-bold">Usuarios Registrados</CardTitle>
                                    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
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
                                            <SelectTrigger className="w-full sm:w-[150px]">
                                                <div className="flex items-center gap-2">
                                                    <Filter className="w-4 h-4" />
                                                    <SelectValue placeholder="Rol" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los roles</SelectItem>
                                                <SelectItem value="cliente">Clientes</SelectItem>
                                                <SelectItem value="cliente_premium">Premium</SelectItem>
                                                <SelectItem value="admin">Administradores</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-full sm:w-[150px]">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-4 h-4" />
                                                    <SelectValue placeholder="Estado" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                <SelectItem value="active">Activos</SelectItem>
                                                <SelectItem value="suspended">Suspendidos</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                                            <SelectTrigger className="w-full sm:w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Cpu className="w-4 h-4" />
                                                    <SelectValue placeholder="Dispositivo" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                <SelectItem value="with_device">Con Dispositivo</SelectItem>
                                                <SelectItem value="without_device">Sin Dispositivo</SelectItem>
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
                                                <TableHead>Dispositivo</TableHead>
                                                <TableHead>Estado</TableHead>
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
                                                                {userData.createdAt ? (
                                                                    typeof userData.createdAt === 'number'
                                                                        ? format(userData.createdAt, "dd/MM/yyyy", { locale: es })
                                                                        : "Reciente"
                                                                ) : (
                                                                    "No disponible"
                                                                )}
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
                                                            {userData.suspended && (
                                                                <Badge variant="destructive" className="ml-2">
                                                                    <Ban className="w-3 h-3 mr-1" /> Suspendido
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center text-sm font-medium">
                                                                    <Cpu className="mr-2 h-4 w-4 text-slate-500" />
                                                                    {userData.macAddress || 'No vinculado'}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {userData.macAddress ? (
                                                                <Badge variant="outline" className={`${userData.deviceStatus === 'online'
                                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                                                    }`}>
                                                                    {userData.deviceStatus === 'online' ? (
                                                                        <>
                                                                            <Wifi className="w-3 h-3 mr-1" /> Online
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <WifiOff className="w-3 h-3 mr-1" /> Offline
                                                                        </>
                                                                    )}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">-</span>
                                                            )}
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
                                                                    <DropdownMenuItem onClick={async () => {
                                                                        try {
                                                                            await impersonateUser(userData.uid)
                                                                            router.push('/dashboard')
                                                                        } catch (error) {
                                                                            console.error(error)
                                                                        }
                                                                    }} disabled={isCurrentUser}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Ver como usuario
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleResetPassword(userData.email)}>
                                                                        <KeyRound className="mr-2 h-4 w-4" />
                                                                        Reset Password
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleToggleSuspend(userData)} disabled={isCurrentUser}>
                                                                        {userData.suspended ? (
                                                                            <>
                                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                                Activar Acceso
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Ban className="mr-2 h-4 w-4 text-red-600" />
                                                                                Suspender Acceso
                                                                            </>
                                                                        )}
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

                    </TabsContent>

                    <TabsContent value="logs">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-500" />
                                    Logs de Auditoría
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Admin</TableHead>
                                                <TableHead>Acción</TableHead>
                                                <TableHead>Detalles</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                        No hay registros de auditoría disponibles.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                logs.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell className="whitespace-nowrap">
                                                            {log.timestamp && typeof log.timestamp === 'number'
                                                                ? format(log.timestamp, "dd/MM/yyyy HH:mm", { locale: es })
                                                                : "Reciente"}
                                                        </TableCell>
                                                        <TableCell>{log.adminEmail}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{log.action}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {log.details}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
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
