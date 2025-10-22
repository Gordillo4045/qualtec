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
    Calendar,
    Clock,
    CheckCircle,
    AlertTriangle,
    Users,
    BookOpen
} from "lucide-react"

export default function PeriodosPage() {
    const periodos = [
        {
            id: 1,
            anio: 2024,
            etiqueta: "2024-1",
            nombre: "Enero - Junio 2024",
            inicio: "2024-01-15",
            fin: "2024-06-15",
            estatus: "Activo",
            inscripciones: 1250,
            materias: 156,
            grupos: 45
        },
        {
            id: 2,
            anio: 2023,
            etiqueta: "2023-2",
            nombre: "Agosto - Diciembre 2023",
            inicio: "2023-08-15",
            fin: "2023-12-15",
            estatus: "Finalizado",
            inscripciones: 1180,
            materias: 142,
            grupos: 42
        },
        {
            id: 3,
            anio: 2023,
            etiqueta: "2023-1",
            nombre: "Enero - Junio 2023",
            inicio: "2023-01-15",
            fin: "2023-06-15",
            estatus: "Finalizado",
            inscripciones: 1100,
            materias: 138,
            grupos: 40
        },
        {
            id: 4,
            anio: 2024,
            etiqueta: "2024-2",
            nombre: "Agosto - Diciembre 2024",
            inicio: "2024-08-15",
            fin: "2024-12-15",
            estatus: "Planificado",
            inscripciones: 0,
            materias: 0,
            grupos: 0
        }
    ]

    const getStatusBadge = (estatus: string) => {
        switch (estatus) {
            case "Activo":
                return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge>
            case "Finalizado":
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Finalizado</Badge>
            case "Planificado":
                return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Calendar className="h-3 w-3 mr-1" />Planificado</Badge>
            case "En Proceso":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />En Proceso</Badge>
            default:
                return <Badge variant="outline">Desconocido</Badge>
        }
    }

    const getDaysRemaining = (fin: string) => {
        const endDate = new Date(fin)
        const today = new Date()
        const diffTime = endDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Periodos</h1>
                        <p className="text-muted-foreground">
                            Gestiona los periodos académicos y fechas importantes
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Periodo
                        </Button>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros y Búsqueda</CardTitle>
                        <CardDescription>
                            Busca y filtra periodos por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por año, etiqueta o nombre..."
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
                                    Año
                                </Button>
                                <Button variant="outline" size="sm">
                                    Estatus
                                </Button>
                                <Button variant="outline" size="sm">
                                    Rango de Fechas
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de periodos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Periodos</CardTitle>
                        <CardDescription>
                            {periodos.length} periodos registrados en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Periodo</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Fechas</TableHead>
                                        <TableHead>Inscripciones</TableHead>
                                        <TableHead>Materias</TableHead>
                                        <TableHead>Grupos</TableHead>
                                        <TableHead>Estatus</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {periodos.map((periodo) => (
                                        <TableRow key={periodo.id}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{periodo.etiqueta}</div>
                                                        <div className="text-sm text-muted-foreground">{periodo.anio}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{periodo.nombre}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="flex items-center">
                                                        <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                                                        {periodo.inicio}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                                                        {periodo.fin}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {periodo.inscripciones}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <BookOpen className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {periodo.materias}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {periodo.grupos}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(periodo.estatus)}</TableCell>
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
                                                            <Users className="mr-2 h-4 w-4" />
                                                            Ver inscripciones
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <BookOpen className="mr-2 h-4 w-4" />
                                                            Ver materias
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
                            <CardTitle className="text-sm font-medium">Total Periodos</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{periodos.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Periodo Activo</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{periodos.filter(p => p.estatus === "Activo").length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Inscripciones</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{periodos.reduce((acc, curr) => acc + curr.inscripciones, 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Días Restantes</CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {periodos.filter(p => p.estatus === "Activo").length > 0
                                    ? getDaysRemaining(periodos.find(p => p.estatus === "Activo")?.fin || "")
                                    : 0
                                }
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
