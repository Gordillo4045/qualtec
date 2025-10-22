import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileText,
    Download,
    Calendar,
    Filter,
    BarChart3,
    PieChart,
    Users,
    BookOpen,
    AlertTriangle,
    Clock,
    CheckCircle,
    Eye
} from "lucide-react"

export default function ReportesPage() {
    const reportes = [
        {
            id: 1,
            nombre: "Reporte de Rendimiento Académico",
            tipo: "Académico",
            periodo: "2024-1",
            fechaGeneracion: "2024-01-20",
            estado: "Completado",
            tamaño: "2.3 MB"
        },
        {
            id: 2,
            nombre: "Análisis de Factores de Riesgo",
            tipo: "Riesgo",
            periodo: "2024-1",
            fechaGeneracion: "2024-01-19",
            estado: "Completado",
            tamaño: "1.8 MB"
        },
        {
            id: 3,
            nombre: "Estadísticas por Carrera",
            tipo: "Estadístico",
            periodo: "2024-1",
            fechaGeneracion: "2024-01-18",
            estado: "Generando",
            tamaño: "-"
        },
        {
            id: 4,
            nombre: "Reporte de Asistencia",
            tipo: "Asistencia",
            periodo: "2024-1",
            fechaGeneracion: "2024-01-17",
            estado: "Completado",
            tamaño: "1.2 MB"
        }
    ]

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case "Completado":
                return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>
            case "Generando":
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Generando</Badge>
            case "Error":
                return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>
            default:
                return <Badge variant="outline">Pendiente</Badge>
        }
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
                        <p className="text-muted-foreground">
                            Generación y exportación de reportes del sistema
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                        <Button size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Nuevo Reporte
                        </Button>
                    </div>
                </div>

                {/* Plantillas de reportes */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <BarChart3 className="h-8 w-8 text-blue-600" />
                                <Badge variant="outline">Académico</Badge>
                            </div>
                            <CardTitle className="text-lg">Rendimiento Académico</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Análisis de calificaciones, promedios y tendencias por carrera
                            </p>
                            <Button size="sm" className="w-full">
                                <FileText className="h-4 w-4 mr-2" />
                                Generar
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                                <Badge variant="outline">Riesgo</Badge>
                            </div>
                            <CardTitle className="text-lg">Factores de Riesgo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Identificación y análisis de factores que afectan el rendimiento
                            </p>
                            <Button size="sm" className="w-full">
                                <FileText className="h-4 w-4 mr-2" />
                                Generar
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <PieChart className="h-8 w-8 text-green-600" />
                                <Badge variant="outline">Estadístico</Badge>
                            </div>
                            <CardTitle className="text-lg">Estadísticas Generales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Métricas generales del sistema y comparativas
                            </p>
                            <Button size="sm" className="w-full">
                                <FileText className="h-4 w-4 mr-2" />
                                Generar
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Users className="h-8 w-8 text-purple-600" />
                                <Badge variant="outline">Asistencia</Badge>
                            </div>
                            <CardTitle className="text-lg">Reporte de Asistencia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Análisis de asistencia por materia, grupo y periodo
                            </p>
                            <Button size="sm" className="w-full">
                                <FileText className="h-4 w-4 mr-2" />
                                Generar
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de reportes generados */}
                <Card>
                    <CardHeader>
                        <CardTitle>Reportes Generados</CardTitle>
                        <CardDescription>
                            Historial de reportes creados en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reportes.map((reporte) => (
                                <div key={reporte.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-muted rounded-lg">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{reporte.nombre}</h4>
                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                <span>Tipo: {reporte.tipo}</span>
                                                <span>Periodo: {reporte.periodo}</span>
                                                <span>Fecha: {reporte.fechaGeneracion}</span>
                                                {reporte.tamaño !== "-" && <span>Tamaño: {reporte.tamaño}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getStatusBadge(reporte.estado)}
                                        {reporte.estado === "Completado" && (
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Descargar
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Configuración de reportes */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración de Reportes</CardTitle>
                            <CardDescription>
                                Personaliza la generación automática de reportes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Reportes Automáticos</p>
                                        <p className="text-sm text-muted-foreground">Generar reportes semanalmente</p>
                                    </div>
                                    <Button variant="outline" size="sm">Configurar</Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Notificaciones</p>
                                        <p className="text-sm text-muted-foreground">Recibir alertas cuando se completen</p>
                                    </div>
                                    <Button variant="outline" size="sm">Configurar</Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Formato de Exportación</p>
                                        <p className="text-sm text-muted-foreground">PDF, Excel, CSV</p>
                                    </div>
                                    <Button variant="outline" size="sm">Configurar</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Estadísticas de Uso</CardTitle>
                            <CardDescription>
                                Métricas sobre la generación de reportes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total de Reportes</span>
                                    <span className="text-2xl font-bold">{reportes.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Completados</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {reportes.filter(r => r.estado === "Completado").length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">En Proceso</span>
                                    <span className="text-2xl font-bold text-yellow-600">
                                        {reportes.filter(r => r.estado === "Generando").length}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
