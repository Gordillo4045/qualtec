import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Search,
    Plus,
    Filter,
    Download,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Users2,
    GraduationCap,
    Clock,
    Calendar,
    User
} from "lucide-react"

export default function GruposPage() {
    const grupos = [
        {
            id: 1,
            clave: "ISC-1A",
            carrera: "Ing. Sistemas",
            turno: "Matutino",
            semestre: 1,
            capacidad: 30,
            estudiantes: 28,
            periodo: "2024-1",
            estatus: "Activo"
        },
        {
            id: 2,
            clave: "ISC-1B",
            carrera: "Ing. Sistemas",
            turno: "Vespertino",
            semestre: 1,
            capacidad: 30,
            estudiantes: 25,
            periodo: "2024-1",
            estatus: "Activo"
        },
        {
            id: 3,
            clave: "II-1A",
            carrera: "Ing. Industrial",
            turno: "Matutino",
            semestre: 1,
            capacidad: 35,
            estudiantes: 32,
            periodo: "2024-1",
            estatus: "Activo"
        },
        {
            id: 4,
            clave: "IM-3A",
            carrera: "Ing. Mecánica",
            turno: "Matutino",
            semestre: 3,
            capacidad: 25,
            estudiantes: 22,
            periodo: "2024-1",
            estatus: "Activo"
        },
        {
            id: 5,
            clave: "IQ-1A",
            carrera: "Ing. Química",
            turno: "Matutino",
            semestre: 1,
            capacidad: 20,
            estudiantes: 18,
            periodo: "2024-1",
            estatus: "Activo"
        }
    ]

    const getStatusBadge = (estatus: string) => {
        switch (estatus) {
            case "Activo":
                return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>
            case "Inactivo":
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactivo</Badge>
            case "Completo":
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completo</Badge>
            default:
                return <Badge variant="outline">Desconocido</Badge>
        }
    }

    const getTurnoBadge = (turno: string) => {
        switch (turno) {
            case "Matutino":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Matutino</Badge>
            case "Vespertino":
                return <Badge variant="outline" className="bg-orange-100 text-orange-800">Vespertino</Badge>
            case "Nocturno":
                return <Badge variant="outline" className="bg-purple-100 text-purple-800">Nocturno</Badge>
            default:
                return <Badge variant="outline">Mixto</Badge>
        }
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Grupos</h1>
                        <p className="text-muted-foreground">
                            Configura los grupos de estudiantes y sus horarios
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Grupo
                        </Button>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros y Búsqueda</CardTitle>
                        <CardDescription>
                            Busca y filtra grupos por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por clave, carrera o turno..."
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filtros
                                </Button>
                                <Button variant="outline" size="sm">
                                    Carrera
                                </Button>
                                <Button variant="outline" size="sm">
                                    Turno
                                </Button>
                                <Button variant="outline" size="sm">
                                    Semestre
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de grupos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Grupos</CardTitle>
                        <CardDescription>
                            {grupos.length} grupos registrados en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Clave</TableHead>
                                        <TableHead>Carrera</TableHead>
                                        <TableHead>Turno</TableHead>
                                        <TableHead>Semestre</TableHead>
                                        <TableHead>Capacidad</TableHead>
                                        <TableHead>Estudiantes</TableHead>
                                        <TableHead>Periodo</TableHead>
                                        <TableHead>Estatus</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {grupos.map((grupo) => (
                                        <TableRow key={grupo.id}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users2 className="h-4 w-4 text-purple-600 mr-2" />
                                                    <div className="font-medium">{grupo.clave}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <GraduationCap className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {grupo.carrera}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getTurnoBadge(grupo.turno)}</TableCell>
                                            <TableCell>{grupo.semestre}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {grupo.capacidad}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users2 className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {grupo.estudiantes}
                                                </div>
                                            </TableCell>
                                            <TableCell>{grupo.periodo}</TableCell>
                                            <TableCell>{getStatusBadge(grupo.estatus)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver detalles
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Users2 className="mr-2 h-4 w-4" />
                                                            Ver estudiantes
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            Ver horario
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Estadísticas rápidas */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Grupos</CardTitle>
                            <Users2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{grupos.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Grupos Activos</CardTitle>
                            <Users2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{grupos.filter(g => g.estatus === "Activo").length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                            <User className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{grupos.reduce((acc, curr) => acc + curr.estudiantes, 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{grupos.reduce((acc, curr) => acc + curr.capacidad, 0)}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
