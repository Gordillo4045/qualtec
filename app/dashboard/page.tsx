'use client'
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
    Calendar
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from "recharts"

export default function DashboardPage() {
    // Paleta de colores solicitada
    const PALETTE = ['#1B3C53', '#234C6A', '#456882', '#D2C1B6']
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState({
        totalEstudiantes: 0,
        totalInscripciones: 0,
        totalFactores: 0,
        estudiantesConRiesgo: 0
    })
    const [estudiantesRiesgo, setEstudiantesRiesgo] = useState<any[]>([])
    const [aprobacionCarreras, setAprobacionCarreras] = useState<any[]>([])
    const [distribucionCarreras, setDistribucionCarreras] = useState<any[]>([])
    const [actividadReciente, setActividadReciente] = useState<any[]>([])
    const [datosGraficoBarras, setDatosGraficoBarras] = useState<any[]>([])
    const [datosGraficoCircular, setDatosGraficoCircular] = useState<any[]>([])

    const supabase = createClient()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Obtener métricas principales
            const [estudiantesResult, inscripcionesResult, factoresResult, estudiantesRiesgoResult] = await Promise.all([
                supabase.from('estudiante').select('id_estudiante', { count: 'exact' }),
                supabase.from('inscripcion').select('id_inscripcion', { count: 'exact' }),
                supabase.from('estudiante_factor').select('id_estudiante_factor', { count: 'exact' }),
                supabase.from('estudiante_factor').select(`
                    id_estudiante,
                    severidad,
                    estudiante:estudiante(id_estudiante, numero_control, nombres, ap_paterno, ap_materno, carrera:carrera(nombre))
                `).gte('severidad', 3).limit(5)
            ])

            // Obtener inscripciones con carrera para calcular aprobación por carrera
            const inscripcionesPorCarreraResult = await supabase
                .from('inscripcion')
                .select(`
                    aprobado,
                    estudiante:estudiante(id_carrera, carrera:carrera(nombre))
                `)

            // Obtener distribución de estudiantes por carrera
            const carrerasResult = await supabase
                .from('estudiante')
                .select(`
                    carrera:carrera(nombre),
                    id_estudiante
                `)
                .not('id_carrera', 'is', null)

            // Obtener actividad reciente (últimas inscripciones)
            const actividadResult = await supabase
                .from('inscripcion')
                .select(`
                    id_inscripcion,
                    estudiante:estudiante(nombres, ap_paterno),
                    oferta:oferta(materia:materia(nombre))
                `)
                .order('id_inscripcion', { ascending: false })
                .limit(5)

            // Procesar datos
            const totalEstudiantes = estudiantesResult.count || 0
            const totalInscripciones = inscripcionesResult.count || 0
            const totalFactores = factoresResult.count || 0
            const estudiantesConRiesgo = estudiantesRiesgoResult.data?.length || 0

            // Procesar aprobación por carrera
            const carreraToStats = new Map<string, { total: number; aprobadas: number }>()
            inscripcionesPorCarreraResult.data?.forEach((ins: any) => {
                const carrera = ins.estudiante?.carrera?.nombre || 'Sin carrera'
                const stats = carreraToStats.get(carrera) || { total: 0, aprobadas: 0 }
                stats.total += 1
                stats.aprobadas += ins.aprobado ? 1 : 0
                carreraToStats.set(carrera, stats)
            })
            const aprobacion = Array.from(carreraToStats.entries()).map(([nombre, s]) => ({
                carrera: nombre,
                tasaAprobacion: s.total > 0 ? Number(((s.aprobadas / s.total) * 100).toFixed(1)) : 0,
                total: s.total
            })).sort((a, b) => b.tasaAprobacion - a.tasaAprobacion)

            // Procesar distribución por carreras
            const carrerasMap = new Map<string, number>()
            carrerasResult.data?.forEach((estudiante: any) => {
                const carrera = estudiante.carrera?.nombre || 'Sin carrera'
                carrerasMap.set(carrera, (carrerasMap.get(carrera) || 0) + 1)
            })
            const distribucion = Array.from(carrerasMap.entries()).map(([nombre, cantidad]) => ({
                nombre,
                cantidad
            }))

            // Procesar actividad reciente
            const actividad = actividadResult.data?.map((inscripcion: any) => ({
                action: `Inscripción de ${inscripcion.estudiante?.nombres} ${inscripcion.estudiante?.ap_paterno}`,
                time: 'Reciente',
                type: 'success'
            })) || []

            // Preparar datos para gráficos
            const datosBarras = aprobacion.map(c => ({
                carrera: c.carrera.length > 15 ? c.carrera.substring(0, 15) + '...' : c.carrera,
                tasaAprobacion: c.tasaAprobacion
            }))

            const datosCircular = distribucion.map((carrera, index) => ({
                name: carrera.nombre,
                value: carrera.cantidad,
                fill: PALETTE[index % PALETTE.length]
            }))

            setMetrics({
                totalEstudiantes,
                totalInscripciones,
                totalFactores,
                estudiantesConRiesgo
            })
            setEstudiantesRiesgo(estudiantesRiesgoResult.data || [])
            setAprobacionCarreras(aprobacion)
            setDistribucionCarreras(distribucion)
            setActividadReciente(actividad)
            setDatosGraficoBarras(datosBarras)
            setDatosGraficoCircular(datosCircular)

        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error)
            toast.error('Error al cargar los datos del dashboard')
        } finally {
            setLoading(false)
        }
    }


    const getSeveridadBadge = (severidad: number) => {
        if (severidad >= 4) {
            return <Badge variant="destructive">Alto</Badge>
        } else if (severidad >= 3) {
            return <Badge variant="default">Medio</Badge>
        } else {
            return <Badge variant="secondary">Bajo</Badge>
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Cargando dashboard...</p>
                    </div>
                </div>
            </Layout>
        )
    }

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
                        <Button size="sm" onClick={fetchDashboardData}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Actualizar
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
                            <div className="text-2xl font-bold">{metrics.totalEstudiantes}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Estudiantes registrados
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
                            <div className="text-2xl font-bold">{metrics.totalInscripciones}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Inscripciones totales
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
                            <div className="text-2xl font-bold">{metrics.totalFactores}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-red-600 flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Factores registrados
                                </span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estudiantes con Riesgo</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.estudiantesConRiesgo}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-orange-600 flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Con riesgo alto/medio
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficos y análisis */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Aprobación por Carrera</CardTitle>
                            <CardDescription>
                                Porcentaje de aprobación por carrera
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {datosGraficoBarras.length > 0 ? (
                                <>
                                    <div id="descripcion-aprobacion-carrera" className="sr-only">
                                        Gráfico de barras mostrando la tasa de aprobación por carrera. 
                                        {aprobacionCarreras.map((c) => {
                                            const aprobados = Math.round((c.tasaAprobacion / 100) * c.total);
                                            return ` ${c.carrera}: ${c.tasaAprobacion}% de aprobación (${aprobados} aprobados de ${c.total} total).`;
                                        }).join('')}
                                        La carrera con mayor tasa de aprobación es {aprobacionCarreras[0]?.carrera || 'N/A'} con {aprobacionCarreras[0]?.tasaAprobacion || 0}%.
                                    </div>
                                    <ChartContainer
                                        config={{
                                            carrera: { label: "Carrera" },
                                            tasaAprobacion: { label: "% Aprobación" },
                                        }}
                                        className="h-[300px] w-full"
                                        role="img"
                                        aria-label="Gráfico de barras de tasa de aprobación por carrera"
                                        aria-describedby="descripcion-aprobacion-carrera"
                                    >
                                        <BarChart data={datosGraficoBarras}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="carrera"
                                                tick={{ fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent
                                                        formatter={(value) => [`${value}%`, '% Aprobación']}
                                                    />
                                                }
                                            />
                                            <Bar dataKey="tasaAprobacion" fill={PALETTE[1]} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ChartContainer>
                                </>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                    <div className="text-center">
                                        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No hay datos para mostrar</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Distribución por Carrera</CardTitle>
                            <CardDescription>
                                Porcentaje de estudiantes por carrera
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {datosGraficoCircular.length > 0 ? (
                                <>
                                    <div id="descripcion-distribucion-carrera" className="sr-only">
                                        Gráfico circular mostrando la distribución de estudiantes por carrera. 
                                        {distribucionCarreras.map((c, idx) => {
                                            const porcentaje = datosGraficoCircular[idx] ? 
                                                ((datosGraficoCircular[idx].value / distribucionCarreras.reduce((sum, car) => sum + car.cantidad, 0)) * 100).toFixed(1) : '0';
                                            return ` ${c.nombre}: ${c.cantidad} estudiantes (${porcentaje}% del total).`;
                                        }).join('')}
                                        Total de estudiantes: {distribucionCarreras.reduce((sum, c) => sum + c.cantidad, 0)}.
                                    </div>
                                    <ChartContainer
                                        config={{
                                            name: { label: "Carrera" },
                                            value: { label: "Estudiantes" },
                                        }}
                                        className="h-[300px] w-full"
                                        role="img"
                                        aria-label="Gráfico circular de distribución de estudiantes por carrera"
                                        aria-describedby="descripcion-distribucion-carrera"
                                    >
                                        <RechartsPieChart>
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent
                                                        formatter={(value, name) => [
                                                            `${value} estudiantes`,
                                                            name
                                                        ]}
                                                    />
                                                }
                                            />
                                            <Pie
                                                data={datosGraficoCircular}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                dataKey="value"
                                                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {datosGraficoCircular.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                        </RechartsPieChart>
                                    </ChartContainer>
                                </>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                    <div className="text-center">
                                        <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No hay datos para mostrar</p>
                                    </div>
                                </div>
                            )}
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
                                {estudiantesRiesgo.length > 0 ? (
                                    estudiantesRiesgo.map((estudiante, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">
                                                    {estudiante.estudiante?.nombres} {estudiante.estudiante?.ap_paterno}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {estudiante.estudiante?.carrera?.nombre || 'Sin carrera'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {getSeveridadBadge(estudiante.severidad)}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Severidad: {estudiante.severidad}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                                        <p>No hay estudiantes con riesgo identificado</p>
                                    </div>
                                )}
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
                                {actividadReciente.length > 0 ? (
                                    actividadReciente.map((activity, index) => (
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
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-8 w-8 mx-auto mb-2" />
                                        <p>No hay actividad reciente</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
