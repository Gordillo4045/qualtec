import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    BookOpen,
    AlertTriangle,
    FileText,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Calendar,
    Download
} from "lucide-react"

export default function DashboardPage() {
    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Panel principal con métricas y estadísticas del sistema
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Generar Reporte
                        </Button>
                    </div>
                </div>

                {/* Métricas principales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,234</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +12% desde el mes pasado
                                </span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inscripciones Activas</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">856</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +8% desde el mes pasado
                                </span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Factores de Riesgo</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">42</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-red-600 flex items-center">
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                    -3% desde el mes pasado
                                </span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reportes Generados</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">28</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +5 este mes
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficos y análisis */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Tendencia de Inscripciones</CardTitle>
                            <CardDescription>
                                Evolución de inscripciones por mes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Gráfico de tendencias</p>
                                    <p className="text-sm text-muted-foreground">Se integrará con librería de gráficos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Distribución por Carrera</CardTitle>
                            <CardDescription>
                                Estudiantes por programa académico
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                <div className="text-center">
                                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Gráfico circular</p>
                                    <p className="text-sm text-muted-foreground">Se integrará con librería de gráficos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tablas de datos recientes */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estudiantes con Mayor Riesgo</CardTitle>
                            <CardDescription>
                                Últimos estudiantes identificados con factores de riesgo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { name: "Juan Pérez", carrera: "Ing. Sistemas", riesgo: "Alto", factores: 3 },
                                    { name: "María García", carrera: "Ing. Industrial", riesgo: "Medio", factores: 2 },
                                    { name: "Carlos López", carrera: "Ing. Mecánica", riesgo: "Alto", factores: 4 },
                                    { name: "Ana Martínez", carrera: "Ing. Química", riesgo: "Bajo", factores: 1 },
                                ].map((student, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.carrera}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={student.riesgo === "Alto" ? "destructive" : student.riesgo === "Medio" ? "default" : "secondary"}>
                                                {student.riesgo}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">{student.factores} factores</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actividad Reciente</CardTitle>
                            <CardDescription>
                                Últimas acciones realizadas en el sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { action: "Nuevo estudiante registrado", time: "Hace 2 horas", type: "success" },
                                    { action: "Reporte generado", time: "Hace 4 horas", type: "info" },
                                    { action: "Factor de riesgo agregado", time: "Hace 6 horas", type: "warning" },
                                    { action: "Inscripción completada", time: "Hace 8 horas", type: "success" },
                                ].map((activity, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                                        <div className={`w-2 h-2 rounded-full ${activity.type === "success" ? "bg-green-500" :
                                                activity.type === "warning" ? "bg-yellow-500" :
                                                    "bg-blue-500"
                                            }`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{activity.action}</p>
                                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
