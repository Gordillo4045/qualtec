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
    BookMarked,
    Building,
    Users,
    Clock,
    BookOpen
} from "lucide-react"

export default function MateriasPage() {
    const materias = [
        {
            id: 1,
            nombre: "Cálculo Diferencial",
            clave: "CAL-001",
            departamento: "Matemáticas",
            carrera: "Ing. Sistemas",
            creditos: 4,
            horasTeoria: 3,
            horasPractica: 2,
            semestre: 1,
            estatus: "Activa"
        },
        {
            id: 2,
            nombre: "Programación I",
            clave: "PRO-001",
            departamento: "Sistemas y Computación",
            carrera: "Ing. Sistemas",
            creditos: 5,
            horasTeoria: 2,
            horasPractica: 4,
            semestre: 2,
            estatus: "Activa"
        },
        {
            id: 3,
            nombre: "Física I",
            clave: "FIS-001",
            departamento: "Física",
            carrera: "Ing. Industrial",
            creditos: 4,
            horasTeoria: 3,
            horasPractica: 2,
            semestre: 1,
            estatus: "Activa"
        },
        {
            id: 4,
            nombre: "Química General",
            clave: "QUI-001",
            departamento: "Química",
            carrera: "Ing. Química",
            creditos: 4,
            horasTeoria: 3,
            horasPractica: 2,
            semestre: 1,
            estatus: "Activa"
        },
        {
            id: 5,
            nombre: "Matemáticas Discretas",
            clave: "MAT-002",
            departamento: "Matemáticas",
            carrera: "Ing. Sistemas",
            creditos: 4,
            horasTeoria: 3,
            horasPractica: 2,
            semestre: 3,
            estatus: "Activa"
        }
    ]

    const getStatusBadge = (estatus: string) => {
        switch (estatus) {
            case "Activa":
                return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>
            case "Inactiva":
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactiva</Badge>
            case "En Revisión":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En Revisión</Badge>
            default:
                return <Badge variant="outline">Desconocido</Badge>
        }
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Materias</h1>
                        <p className="text-muted-foreground">
                            Administra las materias y sus contenidos curriculares
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Materia
                        </Button>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros y Búsqueda</CardTitle>
                        <CardDescription>
                            Busca y filtra materias por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, clave o departamento..."
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
                                    Departamento
                                </Button>
                                <Button variant="outline" size="sm">
                                    Carrera
                                </Button>
                                <Button variant="outline" size="sm">
                                    Semestre
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de materias */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Materias</CardTitle>
                        <CardDescription>
                            {materias.length} materias registradas en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Clave</TableHead>
                                        <TableHead>Departamento</TableHead>
                                        <TableHead>Carrera</TableHead>
                                        <TableHead>Créditos</TableHead>
                                        <TableHead>Horas</TableHead>
                                        <TableHead>Semestre</TableHead>
                                        <TableHead>Estatus</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {materias.map((materia) => (
                                        <TableRow key={materia.id}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <BookMarked className="h-4 w-4 text-green-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{materia.nombre}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{materia.clave}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Building className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {materia.departamento}
                                                </div>
                                            </TableCell>
                                            <TableCell>{materia.carrera}</TableCell>
                                            <TableCell>{materia.creditos}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {materia.horasTeoria}T/{materia.horasPractica}P
                                                </div>
                                            </TableCell>
                                            <TableCell>{materia.semestre}</TableCell>
                                            <TableCell>{getStatusBadge(materia.estatus)}</TableCell>
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
                                                            <BookOpen className="mr-2 h-4 w-4" />
                                                            Ver contenido
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
                            <CardTitle className="text-sm font-medium">Total Materias</CardTitle>
                            <BookMarked className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{materias.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Materias Activas</CardTitle>
                            <BookMarked className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{materias.filter(m => m.estatus === "Activa").length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
                            <Building className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Set(materias.map(m => m.departamento)).size}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Promedio Créditos</CardTitle>
                            <BookOpen className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Math.round(materias.reduce((acc, curr) => acc + curr.creditos, 0) / materias.length)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
