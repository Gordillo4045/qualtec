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
    AlertTriangle,
    BookOpen,
    Heart,
    DollarSign,
    Building,
    TrendingUp,
    Users,
    Target
} from "lucide-react"

export default function FactoresPage() {
    const factores = [
        {
            id: 1,
            nombre: "Bajo rendimiento académico",
            categoria: "Académico",
            severidad: 5,
            descripcion: "Calificaciones por debajo del promedio",
            estudiantes: 15,
            periodo: "2024-1",
            fechaRegistro: "2024-01-15"
        },
        {
            id: 2,
            nombre: "Problemas familiares",
            categoria: "Psicosocial",
            severidad: 4,
            descripcion: "Conflictos familiares que afectan el rendimiento",
            estudiantes: 8,
            periodo: "2024-1",
            fechaRegistro: "2024-01-16"
        },
        {
            id: 3,
            nombre: "Dificultades económicas",
            categoria: "Económico",
            severidad: 3,
            descripcion: "Falta de recursos para materiales y transporte",
            estudiantes: 12,
            periodo: "2024-1",
            fechaRegistro: "2024-01-17"
        },
        {
            id: 4,
            nombre: "Falta de infraestructura",
            categoria: "Institucional",
            severidad: 2,
            descripcion: "Laboratorios y equipos insuficientes",
            estudiantes: 25,
            periodo: "2024-1",
            fechaRegistro: "2024-01-18"
        },
        {
            id: 5,
            nombre: "Problemas de salud mental",
            categoria: "Psicosocial",
            severidad: 4,
            descripcion: "Ansiedad y depresión estudiantil",
            estudiantes: 6,
            periodo: "2024-1",
            fechaRegistro: "2024-01-19"
        }
    ]

    const getSeverityBadge = (severidad: number) => {
        if (severidad >= 4) {
            return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Alto</Badge>
        } else if (severidad >= 3) {
            return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medio</Badge>
        } else {
            return <Badge variant="secondary" className="bg-green-100 text-green-800">Bajo</Badge>
        }
    }

    const getCategoryIcon = (categoria: string) => {
        switch (categoria) {
            case "Académico":
                return <BookOpen className="h-4 w-4 text-blue-600" />
            case "Psicosocial":
                return <Heart className="h-4 w-4 text-pink-600" />
            case "Económico":
                return <DollarSign className="h-4 w-4 text-green-600" />
            case "Institucional":
                return <Building className="h-4 w-4 text-purple-600" />
            default:
                return <Target className="h-4 w-4 text-gray-600" />
        }
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Factores de Riesgo</h1>
                        <p className="text-muted-foreground">
                            Análisis y gestión de factores que afectan la calidad académica
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Factor
                        </Button>
                    </div>
                </div>

                {/* Categorías de factores */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Académicos</CardTitle>
                            <BookOpen className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{factores.filter(f => f.categoria === "Académico").length}</div>
                            <p className="text-xs text-muted-foreground">
                                Factores relacionados con el rendimiento académico
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Psicosociales</CardTitle>
                            <Heart className="h-4 w-4 text-pink-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{factores.filter(f => f.categoria === "Psicosocial").length}</div>
                            <p className="text-xs text-muted-foreground">
                                Factores emocionales y sociales
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Económicos</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{factores.filter(f => f.categoria === "Económico").length}</div>
                            <p className="text-xs text-muted-foreground">
                                Factores relacionados con recursos económicos
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Institucionales</CardTitle>
                            <Building className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{factores.filter(f => f.categoria === "Institucional").length}</div>
                            <p className="text-xs text-muted-foreground">
                                Factores relacionados con la institución
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros y búsqueda */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros y Búsqueda</CardTitle>
                        <CardDescription>
                            Busca y filtra factores por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre o descripción..."
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
                                    Categoría
                                </Button>
                                <Button variant="outline" size="sm">
                                    Severidad
                                </Button>
                                <Button variant="outline" size="sm">
                                    Periodo
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de factores */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Factores de Riesgo</CardTitle>
                        <CardDescription>
                            {factores.length} factores identificados en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Factor</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Severidad</TableHead>
                                        <TableHead>Estudiantes Afectados</TableHead>
                                        <TableHead>Periodo</TableHead>
                                        <TableHead>Fecha Registro</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {factores.map((factor) => (
                                        <TableRow key={factor.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{factor.nombre}</div>
                                                    <div className="text-sm text-muted-foreground">{factor.descripcion}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {getCategoryIcon(factor.categoria)}
                                                    <span className="ml-2">{factor.categoria}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getSeverityBadge(factor.severidad)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 text-muted-foreground mr-1" />
                                                    <span className="font-medium">{factor.estudiantes}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{factor.periodo}</TableCell>
                                            <TableCell>{factor.fechaRegistro}</TableCell>
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

                {/* Análisis de tendencias */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Factores por Severidad</CardTitle>
                            <CardDescription>
                                Distribución de factores según su nivel de severidad
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { nivel: "Alto", cantidad: factores.filter(f => f.severidad >= 4).length, color: "bg-red-500" },
                                    { nivel: "Medio", cantidad: factores.filter(f => f.severidad === 3).length, color: "bg-yellow-500" },
                                    { nivel: "Bajo", cantidad: factores.filter(f => f.severidad < 3).length, color: "bg-green-500" }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full ${item.color} mr-2`} />
                                            <span className="text-sm font-medium">{item.nivel}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{item.cantidad} factores</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Estudiantes Afectados</CardTitle>
                            <CardDescription>
                                Total de estudiantes impactados por factores de riesgo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-600">
                                    {factores.reduce((acc, curr) => acc + curr.estudiantes, 0)}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Estudiantes con al menos un factor de riesgo
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
