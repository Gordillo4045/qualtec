import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    Download,
    Filter,
    Calendar,
    Users,
    BookOpen,
    AlertTriangle,
    Target,
    Activity
} from "lucide-react"

export default function AnaliticaPage() {
    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Analítica</h1>
                        <p className="text-muted-foreground">
                            Análisis estadístico y visualización de datos académicos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                        <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Periodo
                        </Button>
                        <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </div>

                {/* Métricas principales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">78.5%</div>
                            <p className="text-xs text-green-600 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +5.2% vs periodo anterior
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                            <BookOpen className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">82.3</div>
                            <p className="text-xs text-green-600 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +2.1 puntos
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estudiantes en Riesgo</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">23</div>
                            <p className="text-xs text-red-600 flex items-center">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                -3 estudiantes
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Asistencia Promedio</CardTitle>
                            <Users className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">89.2%</div>
                            <p className="text-xs text-green-600 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +1.8%
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficos principales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Distribución de Calificaciones</CardTitle>
                            <CardDescription>
                                Histograma de calificaciones por rango
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Gráfico de barras</p>
                                    <p className="text-sm text-muted-foreground">Se integrará con librería de gráficos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Factores de Riesgo</CardTitle>
                            <CardDescription>
                                Distribución por categoría
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

                {/* Análisis por carrera */}
                <Card>
                    <CardHeader>
                        <CardTitle>Análisis por Carrera</CardTitle>
                        <CardDescription>
                            Comparativa de rendimiento académico por programa
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { carrera: "Ing. Sistemas", aprobacion: 85, promedio: 88.2, riesgo: 5, tendencia: "up" },
                                { carrera: "Ing. Industrial", aprobacion: 82, promedio: 85.1, riesgo: 8, tendencia: "up" },
                                { carrera: "Ing. Mecánica", aprobacion: 78, promedio: 82.3, riesgo: 12, tendencia: "down" },
                                { carrera: "Ing. Química", aprobacion: 91, promedio: 89.5, riesgo: 3, tendencia: "up" },
                                { carrera: "Ing. Electrónica", aprobacion: 79, promedio: 83.7, riesgo: 7, tendencia: "stable" }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">{item.carrera}</h4>
                                            <Badge variant={item.tendencia === "up" ? "default" : item.tendencia === "down" ? "destructive" : "secondary"}>
                                                {item.tendencia === "up" ? "↗" : item.tendencia === "down" ? "↘" : "→"}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Aprobación:</span>
                                                <span className="ml-1 font-medium">{item.aprobacion}%</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Promedio:</span>
                                                <span className="ml-1 font-medium">{item.promedio}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">En riesgo:</span>
                                                <span className="ml-1 font-medium text-red-600">{item.riesgo}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Análisis de tendencias */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tendencia de Rendimiento</CardTitle>
                            <CardDescription>
                                Evolución del rendimiento académico por periodo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                <div className="text-center">
                                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Gráfico de líneas</p>
                                    <p className="text-sm text-muted-foreground">Se integrará con librería de gráficos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Análisis de Correlación</CardTitle>
                            <CardDescription>
                                Relación entre factores de riesgo y rendimiento
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                <div className="text-center">
                                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Gráfico de dispersión</p>
                                    <p className="text-sm text-muted-foreground">Se integrará con librería de gráficos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
