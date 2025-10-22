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
    ClipboardList,
    BookMarked,
    Users2,
    Calendar,
    GraduationCap,
    Clock,
    User
} from "lucide-react"

export default function OfertasPage() {
    const ofertas = [
        {
            id: 1,
            materia: "Cálculo Diferencial",
            clave: "CAL-001",
            grupo: "ISC-1A",
            periodo: "2024-1",
            carrera: "Ing. Sistemas",
            docente: "Dr. Juan Pérez",
            horario: "L-M-V 8:00-10:00",
            aula: "A-101",
            cupo: 30,
            inscritos: 28,
            estatus: "Activa"
        },
        {
            id: 2,
            materia: "Programación I",
            clave: "PRO-001",
            grupo: "ISC-1B",
            periodo: "2024-1",
            carrera: "Ing. Sistemas",
            docente: "Dra. María García",
            horario: "M-J 10:00-12:00",
            aula: "L-201",
            cupo: 25,
            inscritos: 23,
            estatus: "Activa"
        },
        {
            id: 3,
            materia: "Física I",
            clave: "FIS-001",
            grupo: "II-1A",
            periodo: "2024-1",
            carrera: "Ing. Industrial",
            docente: "Dr. Carlos López",
            horario: "L-M-V 14:00-16:00",
            aula: "F-301",
            cupo: 35,
            inscritos: 32,
            estatus: "Activa"
        },
        {
            id: 4,
            materia: "Química General",
            clave: "QUI-001",
            grupo: "IQ-1A",
            periodo: "2024-1",
            carrera: "Ing. Química",
            docente: "Dra. Ana Martínez",
            horario: "M-J 8:00-10:00",
            aula: "Q-101",
            cupo: 20,
            inscritos: 18,
            estatus: "Activa"
        },
        {
            id: 5,
            materia: "Matemáticas Discretas",
            clave: "MAT-002",
            grupo: "ISC-3A",
            periodo: "2024-1",
            carrera: "Ing. Sistemas",
            docente: "Dr. Luis Hernández",
            horario: "L-M-V 16:00-18:00",
            aula: "A-205",
            cupo: 30,
            inscritos: 25,
            estatus: "Activa"
        }
    ]

    const getStatusBadge = (estatus: string) => {
        switch (estatus) {
            case "Activa":
                return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>
            case "Completa":
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completa</Badge>
            case "Cancelada":
                return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelada</Badge>
            case "En Espera":
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En Espera</Badge>
            default:
                return <Badge variant="outline">Desconocido</Badge>
        }
    }

    const getCupoPercentage = (inscritos: number, cupo: number) => {
        return Math.round((inscritos / cupo) * 100)
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Ofertas</h1>
                        <p className="text-muted-foreground">
                            Administra las ofertas académicas por periodo
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Oferta
                        </Button>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros y Búsqueda</CardTitle>
                        <CardDescription>
                            Busca y filtra ofertas por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por materia, docente o grupo..."
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
                                    Periodo
                                </Button>
                                <Button variant="outline" size="sm">
                                    Carrera
                                </Button>
                                <Button variant="outline" size="sm">
                                    Estatus
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de ofertas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Ofertas</CardTitle>
                        <CardDescription>
                            {ofertas.length} ofertas registradas en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Materia</TableHead>
                                        <TableHead>Grupo</TableHead>
                                        <TableHead>Docente</TableHead>
                                        <TableHead>Horario</TableHead>
                                        <TableHead>Aula</TableHead>
                                        <TableHead>Cupo</TableHead>
                                        <TableHead>Inscritos</TableHead>
                                        <TableHead>Estatus</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ofertas.map((oferta) => (
                                        <TableRow key={oferta.id}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <BookMarked className="h-4 w-4 text-green-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{oferta.materia}</div>
                                                        <div className="text-sm text-muted-foreground">{oferta.clave}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users2 className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {oferta.grupo}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {oferta.docente}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {oferta.horario}
                                                </div>
                                            </TableCell>
                                            <TableCell>{oferta.aula}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {oferta.cupo}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {oferta.inscritos}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(oferta.estatus)}</TableCell>
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
                                                            <User className="mr-2 h-4 w-4" />
                                                            Ver inscritos
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
                            <CardTitle className="text-sm font-medium">Total Ofertas</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ofertas.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ofertas Activas</CardTitle>
                            <ClipboardList className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ofertas.filter(o => o.estatus === "Activa").length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Inscritos</CardTitle>
                            <User className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ofertas.reduce((acc, curr) => acc + curr.inscritos, 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ofertas.reduce((acc, curr) => acc + curr.cupo, 0)}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
