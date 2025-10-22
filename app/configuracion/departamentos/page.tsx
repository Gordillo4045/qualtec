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
    Building,
    Users,
    BookMarked,
    GraduationCap,
    Phone,
    Mail,
    MapPin
} from "lucide-react"

export default function DepartamentosPage() {
    const departamentos = [
        {
            id: 1,
            nombre: "Sistemas y Computación",
            clave: "SYC",
            director: "Dr. Juan Pérez García",
            telefono: "664-123-4567",
            email: "syc@itt.edu.mx",
            ubicacion: "Edificio A, 2do piso",
            carreras: 2,
            materias: 25,
            docentes: 15,
            estatus: "Activo"
        },
        {
            id: 2,
            nombre: "Industrial",
            clave: "IND",
            director: "Dra. María García López",
            telefono: "664-234-5678",
            email: "industrial@itt.edu.mx",
            ubicacion: "Edificio B, 1er piso",
            carreras: 1,
            materias: 18,
            docentes: 12,
            estatus: "Activo"
        },
        {
            id: 3,
            nombre: "Mecánica",
            clave: "MEC",
            director: "Dr. Carlos López Martínez",
            telefono: "664-345-6789",
            email: "mecanica@itt.edu.mx",
            ubicacion: "Edificio C, 3er piso",
            carreras: 1,
            materias: 20,
            docentes: 10,
            estatus: "Activo"
        },
        {
            id: 4,
            nombre: "Química",
            clave: "QUI",
            director: "Dra. Ana Martínez Rodríguez",
            telefono: "664-456-7890",
            email: "quimica@itt.edu.mx",
            ubicacion: "Edificio D, 1er piso",
            carreras: 1,
            materias: 15,
            docentes: 8,
            estatus: "Activo"
        },
        {
            id: 5,
            nombre: "Electrónica",
            clave: "ELE",
            director: "Dr. Luis Hernández Silva",
            telefono: "664-567-8901",
            email: "electronica@itt.edu.mx",
            ubicacion: "Edificio E, 2do piso",
            carreras: 1,
            materias: 22,
            docentes: 14,
            estatus: "Activo"
        },
        {
            id: 6,
            nombre: "Matemáticas",
            clave: "MAT",
            director: "Dr. Roberto Sánchez Díaz",
            telefono: "664-678-9012",
            email: "matematicas@itt.edu.mx",
            ubicacion: "Edificio F, 1er piso",
            carreras: 0,
            materias: 12,
            docentes: 6,
            estatus: "Activo"
        }
    ]

    const getStatusBadge = (estatus: string) => {
        switch (estatus) {
            case "Activo":
                return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>
            case "Inactivo":
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactivo</Badge>
            case "En Reorganización":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En Reorganización</Badge>
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
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Departamentos</h1>
                        <p className="text-muted-foreground">
                            Configura los departamentos académicos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Departamento
                        </Button>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros y Búsqueda</CardTitle>
                        <CardDescription>
                            Busca y filtra departamentos por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, clave o director..."
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
                                    Estatus
                                </Button>
                                <Button variant="outline" size="sm">
                                    Ubicación
                                </Button>
                                <Button variant="outline" size="sm">
                                    Carreras
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de departamentos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Departamentos</CardTitle>
                        <CardDescription>
                            {departamentos.length} departamentos registrados en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Departamento</TableHead>
                                        <TableHead>Director</TableHead>
                                        <TableHead>Contacto</TableHead>
                                        <TableHead>Ubicación</TableHead>
                                        <TableHead>Carreras</TableHead>
                                        <TableHead>Materias</TableHead>
                                        <TableHead>Docentes</TableHead>
                                        <TableHead>Estatus</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departamentos.map((departamento) => (
                                        <TableRow key={departamento.id}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Building className="h-4 w-4 text-indigo-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{departamento.nombre}</div>
                                                        <div className="text-sm text-muted-foreground">{departamento.clave}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {departamento.director}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm">
                                                        <Phone className="h-3 w-3 text-muted-foreground mr-1" />
                                                        {departamento.telefono}
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <Mail className="h-3 w-3 text-muted-foreground mr-1" />
                                                        {departamento.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {departamento.ubicacion}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <GraduationCap className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {departamento.carreras}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <BookMarked className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {departamento.materias}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {departamento.docentes}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(departamento.estatus)}</TableCell>
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
                                                            <GraduationCap className="mr-2 h-4 w-4" />
                                                            Ver carreras
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <BookMarked className="mr-2 h-4 w-4" />
                                                            Ver materias
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Users className="mr-2 h-4 w-4" />
                                                            Ver docentes
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
                            <CardTitle className="text-sm font-medium">Total Departamentos</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departamentos.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Departamentos Activos</CardTitle>
                            <Building className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departamentos.filter(d => d.estatus === "Activo").length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Docentes</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departamentos.reduce((acc, curr) => acc + curr.docentes, 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Materias</CardTitle>
                            <BookMarked className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departamentos.reduce((acc, curr) => acc + curr.materias, 0)}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
