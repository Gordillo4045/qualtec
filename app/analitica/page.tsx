'use client'
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart,
    ScatterChart,
    Scatter,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    ComposedChart,
    ReferenceLine
} from "recharts"
import {
    TrendingUp,
    TrendingDown,
    Users,
    AlertTriangle,
    BookOpen,
    Target,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Activity,
    Download,
    Filter,
    Calendar,
    GraduationCap,
    BrainCog,
    DollarSign,
    Home,
    Stethoscope,
    Building,
    Laptop,
    BarChart,
    Circle,
    BarChart2,
    Fish,
    TrendingUp as ControlChart,
    Zap
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

// Colores para gráficos
const COLORS = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    gray: '#6b7280'
}

const CATEGORIA_COLORS = {
    'Académico': '#3b82f6',
    'Psicosocial': '#ec4899',
    'Económico': '#10b981',
    'Familiar': '#f59e0b',
    'Salud': '#ef4444',
    'Institucional': '#8b5cf6',
    'Tecnológico': '#06b6d4',
    'Otro': '#6b7280'
}

export default function AnaliticaPage() {
    const [loading, setLoading] = useState(true)
    const [selectedPeriod, setSelectedPeriod] = useState('all')
    const [selectedCarrera, setSelectedCarrera] = useState('all')
    const [periodos, setPeriodos] = useState<any[]>([])
    const [carreras, setCarreras] = useState<any[]>([])
    const [estudianteFactores, setEstudianteFactores] = useState<any[]>([])
    const [inscripciones, setInscripciones] = useState<any[]>([])
    const [estudiantes, setEstudiantes] = useState<any[]>([])

    // Estados para diálogos de configuración de gráficos
    const [paretoDialogOpen, setParetoDialogOpen] = useState(false)
    const [histogramDialogOpen, setHistogramDialogOpen] = useState(false)
    const [scatterDialogOpen, setScatterDialogOpen] = useState(false)
    const [controlDialogOpen, setControlDialogOpen] = useState(false)

    // Configuraciones de gráficos
    const [paretoConfig, setParetoConfig] = useState({
        periodo: '',
        variable: 'factores'
    })
    const [histogramConfig, setHistogramConfig] = useState({
        periodo: '',
        carrera: '',
        variable: 'calificaciones'
    })
    const [scatterConfig, setScatterConfig] = useState({
        periodo: '',
        variableX: 'asistencia',
        variableY: 'promedio'
    })
    const [controlConfig, setControlConfig] = useState({
        periodo: '',
        carrera: '',
        variable: 'reprobacion'
    })

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            await Promise.all([
                fetchPeriodos(),
                fetchCarreras(),
                fetchEstudianteFactores(),
                fetchInscripciones(),
                fetchEstudiantes()
            ])
            setLoading(false)
        } catch (error) {
            console.error('Error al cargar datos:', error)
            toast.error('Error al cargar datos de analítica')
            setLoading(false)
        }
    }

    const fetchPeriodos = async () => {
        try {
            const { data, error } = await supabase
                .from('periodo')
                .select('*')
                .order('anio', { ascending: false })
                .order('etiqueta', { ascending: true })

            if (error) throw error
            setPeriodos(data || [])
        } catch (error) {
            console.error('Error al cargar períodos:', error)
        }
    }

    const fetchCarreras = async () => {
        try {
            const { data, error } = await supabase
                .from('carrera')
                .select(`
                    *,
                    departamento:departamento(*)
                `)
                .order('nombre')

            if (error) throw error
            setCarreras(data || [])
        } catch (error) {
            console.error('Error al cargar carreras:', error)
        }
    }

    const fetchEstudianteFactores = async () => {
        try {
            const { data, error } = await supabase
                .from('estudiante_factor')
                .select(`
                    *,
                    estudiante:estudiante(*),
                    periodo:periodo(*),
                    factor:factor(*),
                    subfactor:subfactor(*)
                `)
                .order('fecha_registro', { ascending: false })

            if (error) throw error
            setEstudianteFactores(data || [])
        } catch (error) {
            console.error('Error al cargar factores de estudiantes:', error)
        }
    }

    const fetchInscripciones = async () => {
        try {
            const { data, error } = await supabase
                .from('inscripcion')
                .select(`
                    *,
                    estudiante:estudiante(*),
                    oferta:oferta(
                        *,
                        materia:materia(*),
                        periodo:periodo(*),
                        grupo:grupo(*)
                    )
                `)

            if (error) throw error
            setInscripciones(data || [])
        } catch (error) {
            console.error('Error al cargar inscripciones:', error)
        }
    }

    const fetchEstudiantes = async () => {
        try {
            const { data, error } = await supabase
                .from('estudiante')
                .select(`
                    *,
                    carrera:carrera(*)
                `)

            if (error) throw error
            setEstudiantes(data || [])
        } catch (error) {
            console.error('Error al cargar estudiantes:', error)
        }
    }

    // Filtrar datos según selección
    const getFilteredData = () => {
        let filteredFactores = estudianteFactores
        let filteredInscripciones = inscripciones
        let filteredEstudiantes = estudiantes

        if (selectedPeriod !== 'all') {
            const periodoId = parseInt(selectedPeriod)
            filteredFactores = filteredFactores.filter(ef => ef.id_periodo === periodoId)
            filteredInscripciones = filteredInscripciones.filter(ins =>
                ins.oferta?.id_periodo === periodoId
            )
        }

        if (selectedCarrera !== 'all') {
            const carreraId = parseInt(selectedCarrera)
            filteredFactores = filteredFactores.filter(ef =>
                ef.estudiante?.id_carrera === carreraId
            )
            filteredInscripciones = filteredInscripciones.filter(ins =>
                ins.estudiante?.id_carrera === carreraId
            )
            filteredEstudiantes = filteredEstudiantes.filter(est =>
                est.id_carrera === carreraId
            )
        }

        return { filteredFactores, filteredInscripciones, filteredEstudiantes }
    }

    const { filteredFactores, filteredInscripciones, filteredEstudiantes } = getFilteredData()

    // Datos para gráficos
    const getFactoresPorCategoria = () => {
        const categorias = filteredFactores.reduce((acc: any, ef) => {
            const categoria = ef.factor?.categoria || 'Sin categoría'
            if (!acc[categoria]) {
                acc[categoria] = { categoria, cantidad: 0, severidadPromedio: 0, total: 0 }
            }
            acc[categoria].cantidad += 1
            acc[categoria].total += ef.severidad || 0
            acc[categoria].severidadPromedio = acc[categoria].total / acc[categoria].cantidad
            return acc
        }, {})

        return Object.values(categorias).map((cat: any) => ({
            categoria: cat.categoria,
            cantidad: cat.cantidad,
            severidadPromedio: Number(cat.severidadPromedio.toFixed(1))
        }))
    }

    const getFactoresPorSeveridad = () => {
        const severidades = [1, 2, 3, 4, 5]
        return severidades.map(sev => ({
            severidad: sev,
            cantidad: filteredFactores.filter(ef => ef.severidad === sev).length,
            porcentaje: filteredFactores.length > 0
                ? ((filteredFactores.filter(ef => ef.severidad === sev).length / filteredFactores.length) * 100).toFixed(1)
                : 0
        }))
    }

    const getRendimientoPorCarrera = () => {
        const carrerasData = carreras.map(carrera => {
            const estudiantesCarrera = filteredEstudiantes.filter(est => est.id_carrera === carrera.id_carrera)
            const inscripcionesCarrera = filteredInscripciones.filter(ins =>
                ins.estudiante?.id_carrera === carrera.id_carrera
            )

            const aprobados = inscripcionesCarrera.filter(ins => ins.aprobado).length
            const total = inscripcionesCarrera.length
            const porcentajeAprobacion = total > 0 ? (aprobados / total) * 100 : 0

            return {
                carrera: carrera.nombre,
                estudiantes: estudiantesCarrera.length,
                inscripciones: total,
                aprobados,
                porcentajeAprobacion: Number(porcentajeAprobacion.toFixed(1))
            }
        })

        return carrerasData.filter(c => c.estudiantes > 0)
    }

    const getTendenciaTemporal = () => {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        return meses.map((mes, index) => ({
            mes,
            factores: Math.floor(Math.random() * 20) + 5, // Datos simulados
            inscripciones: Math.floor(Math.random() * 50) + 20,
            aprobados: Math.floor(Math.random() * 30) + 15
        }))
    }

    // Análisis de Pareto - Factores que más afectan por grupo
    const getAnalisisPareto = () => {
        // Filtrar datos según configuración
        let dataToAnalyze = inscripciones

        // Filtrar por periodo si está seleccionado
        if (paretoConfig.periodo && paretoConfig.periodo !== 'all') {
            dataToAnalyze = dataToAnalyze.filter(ins => ins.oferta?.periodo?.id_periodo.toString() === paretoConfig.periodo)
        }

        // Filtrar por carrera si está seleccionado
        if (selectedCarrera !== 'all') {
            dataToAnalyze = dataToAnalyze.filter(ins => ins.estudiante?.id_carrera.toString() === selectedCarrera)
        }

        let result = []

        switch (paretoConfig.variable) {
            case 'factores':
                // Análisis por factores de riesgo
                const factoresData = estudianteFactores.reduce((acc: any, ef) => {
                    const factor = ef.factor?.nombre || 'Sin factor'
                    if (!acc[factor]) {
                        acc[factor] = { factor, count: 0, severidad: 0 }
                    }
                    acc[factor].count += 1
                    acc[factor].severidad += ef.severidad
                    return acc
                }, {})

                result = Object.values(factoresData)
                    .map((f: any) => ({
                        grupo: f.factor,
                        reprobados: f.count,
                        total: f.count,
                        porcentaje: f.count > 0 ? ((f.severidad / f.count) * 20).toFixed(1) : 0 // Normalizar severidad
                    }))
                    .sort((a: any, b: any) => b.reprobados - a.reprobados)
                    .slice(0, 10)
                break

            case 'materias':
                // Análisis por materias reprobadas
                const materiasData = dataToAnalyze.reduce((acc: any, ins) => {
                    const materia = ins.oferta?.materia?.nombre || 'Sin materia'
                    if (!acc[materia]) {
                        acc[materia] = { materia, reprobados: 0, total: 0 }
                    }
                    acc[materia].total += 1
                    if (!ins.aprobado) acc[materia].reprobados += 1
                    return acc
                }, {})

                result = Object.values(materiasData)
                    .map((m: any) => ({
                        grupo: m.materia,
                        reprobados: m.reprobados,
                        total: m.total,
                        porcentaje: m.total > 0 ? ((m.reprobados / m.total) * 100).toFixed(1) : 0
                    }))
                    .sort((a: any, b: any) => b.reprobados - a.reprobados)
                    .slice(0, 10)
                break

            case 'carreras':
                // Análisis por carreras con problemas
                const carrerasData = dataToAnalyze.reduce((acc: any, ins) => {
                    const carrera = ins.estudiante?.carrera?.nombre || 'Sin carrera'
                    if (!acc[carrera]) {
                        acc[carrera] = { carrera, reprobados: 0, total: 0 }
                    }
                    acc[carrera].total += 1
                    if (!ins.aprobado) acc[carrera].reprobados += 1
                    return acc
                }, {})

                result = Object.values(carrerasData)
                    .map((c: any) => ({
                        grupo: c.carrera,
                        reprobados: c.reprobados,
                        total: c.total,
                        porcentaje: c.total > 0 ? ((c.reprobados / c.total) * 100).toFixed(1) : 0
                    }))
                    .sort((a: any, b: any) => b.reprobados - a.reprobados)
                    .slice(0, 10)
                break

            case 'grupos':
            default:
                // Análisis por grupos (comportamiento original)
                const grupos = dataToAnalyze.reduce((acc: any, ins) => {
                    const grupo = ins.oferta?.grupo?.clave || 'Sin grupo'
                    if (!acc[grupo]) {
                        acc[grupo] = { grupo, factores: 0, reprobados: 0, total: 0 }
                    }
                    acc[grupo].total += 1
                    if (!ins.aprobado) acc[grupo].reprobados += 1
                    return acc
                }, {})

                result = Object.values(grupos)
                    .map((g: any) => ({
                        grupo: g.grupo,
                        reprobados: g.reprobados,
                        total: g.total,
                        porcentaje: g.total > 0 ? ((g.reprobados / g.total) * 100).toFixed(1) : 0
                    }))
                    .sort((a: any, b: any) => b.reprobados - a.reprobados)
                    .slice(0, 10)
                break
        }

        return result
    }

    // Histograma de calificaciones
    const getHistogramaCalificaciones = () => {
        // Filtrar datos según configuración
        let dataToAnalyze = inscripciones

        // Filtrar por periodo si está seleccionado
        if (histogramConfig.periodo && histogramConfig.periodo !== 'all') {
            dataToAnalyze = dataToAnalyze.filter(ins => ins.oferta?.periodo?.id_periodo.toString() === histogramConfig.periodo)
        }

        // Filtrar por carrera si está seleccionado
        if (histogramConfig.carrera && histogramConfig.carrera !== 'all') {
            dataToAnalyze = dataToAnalyze.filter(ins => ins.estudiante?.id_carrera.toString() === histogramConfig.carrera)
        }

        let rangos = []
        let dataKey = 'frecuencia'

        switch (histogramConfig.variable) {
            case 'calificaciones':
                rangos = [
                    { rango: '0-20', min: 0, max: 20 },
                    { rango: '21-40', min: 21, max: 40 },
                    { rango: '41-60', min: 41, max: 60 },
                    { rango: '61-80', min: 61, max: 80 },
                    { rango: '81-100', min: 81, max: 100 }
                ]
                return rangos.map(rango => ({
                    rango: rango.rango,
                    frecuencia: dataToAnalyze.filter(ins =>
                        ins.cal_final >= rango.min && ins.cal_final <= rango.max
                    ).length
                }))

            case 'asistencia':
                rangos = [
                    { rango: '0-20%', min: 0, max: 20 },
                    { rango: '21-40%', min: 21, max: 40 },
                    { rango: '41-60%', min: 41, max: 60 },
                    { rango: '61-80%', min: 61, max: 80 },
                    { rango: '81-100%', min: 81, max: 100 }
                ]
                return rangos.map(rango => ({
                    rango: rango.rango,
                    frecuencia: dataToAnalyze.filter(ins =>
                        ins.asistencia_pct >= rango.min && ins.asistencia_pct <= rango.max
                    ).length
                }))

            case 'edad':
                rangos = [
                    { rango: '16-20', min: 16, max: 20 },
                    { rango: '21-25', min: 21, max: 25 },
                    { rango: '26-30', min: 26, max: 30 },
                    { rango: '31-35', min: 31, max: 35 },
                    { rango: '36+', min: 36, max: 100 }
                ]
                return rangos.map(rango => ({
                    rango: rango.rango,
                    frecuencia: dataToAnalyze.filter(ins => {
                        if (!ins.estudiante?.fecha_nacimiento) return false
                        const edad = new Date().getFullYear() - new Date(ins.estudiante.fecha_nacimiento).getFullYear()
                        return edad >= rango.min && edad <= rango.max
                    }).length
                }))

            case 'factores':
                // Contar estudiantes por número de factores de riesgo
                const factoresCount = dataToAnalyze.map(ins => {
                    const estudianteId = ins.estudiante?.id_estudiante
                    const factores = estudianteFactores.filter(ef => ef.id_estudiante === estudianteId).length
                    return factores
                })

                rangos = [
                    { rango: '0 factores', min: 0, max: 0 },
                    { rango: '1-2 factores', min: 1, max: 2 },
                    { rango: '3-4 factores', min: 3, max: 4 },
                    { rango: '5-6 factores', min: 5, max: 6 },
                    { rango: '7+ factores', min: 7, max: 20 }
                ]
                return rangos.map(rango => ({
                    rango: rango.rango,
                    frecuencia: factoresCount.filter(count =>
                        count >= rango.min && count <= rango.max
                    ).length
                }))

            default:
                // Comportamiento por defecto (calificaciones)
                rangos = [
                    { rango: '0-20', min: 0, max: 20 },
                    { rango: '21-40', min: 21, max: 40 },
                    { rango: '41-60', min: 41, max: 60 },
                    { rango: '61-80', min: 61, max: 80 },
                    { rango: '81-100', min: 81, max: 100 }
                ]
                return rangos.map(rango => ({
                    rango: rango.rango,
                    frecuencia: dataToAnalyze.filter(ins =>
                        ins.cal_final >= rango.min && ins.cal_final <= rango.max
                    ).length
                }))
        }
    }

    // Diagrama de dispersión - Variables configurables
    const getDispersionEstudio = () => {
        // Filtrar datos según configuración
        let dataToAnalyze = inscripciones

        // Filtrar por periodo si está seleccionado
        if (scatterConfig.periodo && scatterConfig.periodo !== 'all') {
            dataToAnalyze = dataToAnalyze.filter(ins => ins.oferta?.periodo?.id_periodo.toString() === scatterConfig.periodo)
        }

        return dataToAnalyze.map(ins => {
            let xValue = 0
            let yValue = 0
            let xLabel = ''
            let yLabel = ''

            // Calcular valor X según configuración
            switch (scatterConfig.variableX) {
                case 'asistencia':
                    xValue = ins.asistencia_pct || 0
                    xLabel = 'Asistencia (%)'
                    break
                case 'horas_estudio':
                    xValue = Math.floor(Math.random() * 40) + 5 // Simulado
                    xLabel = 'Horas de Estudio'
                    break
                case 'factores_riesgo':
                    const factoresX = estudianteFactores.filter(ef => ef.id_estudiante === ins.estudiante?.id_estudiante).length
                    xValue = factoresX
                    xLabel = 'Factores de Riesgo'
                    break
                case 'edad':
                    if (ins.estudiante?.fecha_nacimiento) {
                        xValue = new Date().getFullYear() - new Date(ins.estudiante.fecha_nacimiento).getFullYear()
                    }
                    xLabel = 'Edad'
                    break
                case 'semestre':
                    xValue = ins.oferta?.periodo?.anio || 0
                    xLabel = 'Año'
                    break
                default:
                    xValue = ins.asistencia_pct || 0
                    xLabel = 'Asistencia (%)'
            }

            // Calcular valor Y según configuración
            switch (scatterConfig.variableY) {
                case 'promedio':
                    yValue = ins.cal_final || 0
                    yLabel = 'Promedio Notas'
                    break
                case 'calificacion':
                    yValue = ins.cal_final || 0
                    yLabel = 'Calificación Final'
                    break
                case 'asistencia':
                    yValue = ins.asistencia_pct || 0
                    yLabel = 'Asistencia (%)'
                    break
                case 'reprobacion':
                    yValue = ins.aprobado ? 0 : 1
                    yLabel = 'Reprobación'
                    break
                case 'desercion':
                    yValue = ins.estudiante?.estatus === 'desertor' ? 1 : 0
                    yLabel = 'Deserción'
                    break
                default:
                    yValue = ins.cal_final || 0
                    yLabel = 'Promedio Notas'
            }

            return {
                [scatterConfig.variableX]: xValue,
                [scatterConfig.variableY]: yValue,
                estudiante: ins.estudiante?.nombres?.split(' ')[0] || 'Estudiante',
                xLabel,
                yLabel
            }
        }).slice(0, 50) // Limitar para mejor visualización
    }

    // Gráfico de control - Variables configurables
    const getControlReprobacion = () => {
        // Filtrar datos según configuración
        let dataToAnalyze = inscripciones

        // Filtrar por carrera si está seleccionado
        if (controlConfig.carrera && controlConfig.carrera !== 'all') {
            dataToAnalyze = dataToAnalyze.filter(ins => ins.estudiante?.id_carrera.toString() === controlConfig.carrera)
        }

        const periodosData = periodos.slice(0, 6) // Últimos 6 períodos

        return periodosData.map((periodo: any) => {
            const inscripcionesPeriodo = dataToAnalyze.filter(ins =>
                ins.oferta?.id_periodo === periodo.id_periodo
            )

            let value = 0
            let label = ''
            let total = inscripcionesPeriodo.length

            switch (controlConfig.variable) {
                case 'reprobacion':
                    const reprobados = inscripcionesPeriodo.filter(ins => !ins.aprobado).length
                    value = total > 0 ? ((reprobados / total) * 100) : 0
                    label = 'Tasa de Reprobación (%)'
                    break

                case 'desercion':
                    const desertores = inscripcionesPeriodo.filter(ins => ins.estudiante?.estatus === 'desertor').length
                    value = total > 0 ? ((desertores / total) * 100) : 0
                    label = 'Tasa de Deserción (%)'
                    break

                case 'asistencia':
                    const asistenciaPromedio = inscripcionesPeriodo.reduce((sum, ins) => sum + (ins.asistencia_pct || 0), 0)
                    value = total > 0 ? (asistenciaPromedio / total) : 0
                    label = 'Promedio de Asistencia (%)'
                    break

                case 'calificacion':
                    const calificacionPromedio = inscripcionesPeriodo.reduce((sum, ins) => sum + (ins.cal_final || 0), 0)
                    value = total > 0 ? (calificacionPromedio / total) : 0
                    label = 'Promedio de Calificaciones'
                    break

                default:
                    const reprobadosDefault = inscripcionesPeriodo.filter(ins => !ins.aprobado).length
                    value = total > 0 ? ((reprobadosDefault / total) * 100) : 0
                    label = 'Tasa de Reprobación (%)'
            }

            return {
                periodo: `${periodo.anio}-${periodo.etiqueta}`,
                [controlConfig.variable]: Number(value.toFixed(1)),
                total,
                label
            }
        })
    }

    // Datos para Diagrama de Ishikawa (simplificado)
    const getCausasDesercion = () => {
        return {
            causas: [
                { categoria: 'Académicas', causas: ['Bajo rendimiento', 'Dificultad en materias', 'Falta de estudio'] },
                { categoria: 'Económicas', causas: ['Falta de recursos', 'Trabajo', 'Gastos escolares'] },
                { categoria: 'Personales', causas: ['Problemas familiares', 'Salud', 'Motivación'] },
                { categoria: 'Institucionales', causas: ['Horarios', 'Docentes', 'Infraestructura'] }
            ]
        }
    }

    const getTopFactoresRiesgo = () => {
        const factoresCount = filteredFactores.reduce((acc: any, ef) => {
            const factor = ef.factor?.nombre || 'Sin factor'
            if (!acc[factor]) {
                acc[factor] = { factor, cantidad: 0, severidadPromedio: 0, total: 0 }
            }
            acc[factor].cantidad += 1
            acc[factor].total += ef.severidad || 0
            acc[factor].severidadPromedio = acc[factor].total / acc[factor].cantidad
            return acc
        }, {})

        return Object.values(factoresCount)
            .sort((a: any, b: any) => b.cantidad - a.cantidad)
            .slice(0, 10)
            .map((f: any) => ({
                factor: f.factor,
                cantidad: f.cantidad,
                severidadPromedio: Number(f.severidadPromedio.toFixed(1))
            }))
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Cargando analítica...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Analítica de Calidad</h1>
                        <p className="text-muted-foreground">
                            Análisis de factores de riesgo y rendimiento académico
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros de Análisis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="w-full">
                                <label className="text-sm font-medium mb-2 block">Período</label>
                                <Select value={selectedPeriod} onValueChange={setSelectedPeriod} >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Todos los períodos" />
                                    </SelectTrigger>
                                    <SelectContent className="w-full">
                                        <SelectItem value="all">Todos los períodos</SelectItem>
                                        {periodos.map((periodo) => (
                                            <SelectItem key={periodo.id_periodo} value={periodo.id_periodo.toString()}>
                                                {periodo.anio} - {periodo.etiqueta}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium mb-2 block">Carrera</label>
                                <Select value={selectedCarrera} onValueChange={setSelectedCarrera}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Todas las carreras" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las carreras</SelectItem>
                                        {carreras.map((carrera) => (
                                            <SelectItem key={carrera.id_carrera} value={carrera.id_carrera.toString()}>
                                                {carrera.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={fetchData} className="w-full">
                                    <Activity className="h-4 w-4 mr-2" />
                                    Actualizar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* KPIs */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredEstudiantes.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Estudiantes activos
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Factores de Riesgo</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredFactores.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Registros identificados
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inscripciones</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredInscripciones.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Total de inscripciones
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">% Aprobación</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {filteredInscripciones.length > 0
                                    ? ((filteredInscripciones.filter(ins => ins.aprobado).length / filteredInscripciones.length) * 100).toFixed(1)
                                    : '0.0'
                                }%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Tasa de aprobación
                            </p>
                        </CardContent>
                    </Card>
                </div>
                {/* Análisis Específicos de Calidad */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight">Análisis Específicos de Calidad</h2>

                    {/* Gráficos de Análisis Específicos */}
                    <div className="grid gap-6 lg:grid-cols-2 ">
                        {/* Análisis de Pareto */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        <CardTitle>Análisis de Pareto</CardTitle>
                                    </div>
                                    <Dialog open={paretoDialogOpen} onOpenChange={setParetoDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Configurar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Configurar Análisis de Pareto</DialogTitle>
                                                <DialogDescription>
                                                    Selecciona los parámetros para generar el gráfico de Pareto
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="pareto-periodo">Seleccionar semestre</Label>
                                                    <Select value={paretoConfig.periodo} onValueChange={(value) => setParetoConfig(prev => ({ ...prev, periodo: value }))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un periodo" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Todos los periodos</SelectItem>
                                                            {periodos.map((periodo) => (
                                                                <SelectItem key={periodo.id_periodo} value={periodo.id_periodo.toString()}>
                                                                    {periodo.etiqueta} {periodo.anio}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="pareto-variable">Variable a analizar</Label>
                                                    <Select value={paretoConfig.variable} onValueChange={(value) => setParetoConfig(prev => ({ ...prev, variable: value }))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona variable" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="factores">Factores de riesgo</SelectItem>
                                                            <SelectItem value="materias">Materias reprobadas</SelectItem>
                                                            <SelectItem value="carreras">Carreras con problemas</SelectItem>
                                                            <SelectItem value="grupos">Grupos problemáticos</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setParetoDialogOpen(false)}>
                                                        Cancelar
                                                    </Button>
                                                    <Button onClick={() => {
                                                        setParetoDialogOpen(false)
                                                        toast.success('Configuración de Pareto aplicada')
                                                    }}>
                                                        Generar Gráfico
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <CardDescription>
                                    Factores que más afectan por grupo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        grupo: {
                                            label: "Grupo",
                                        },
                                        reprobados: {
                                            label: "Reprobados",
                                        },
                                    }}
                                    className="h-[300px] w-full"
                                >
                                    <RechartsBarChart data={getAnalisisPareto()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="grupo" angle={-45} textAnchor="end" height={100} />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="reprobados" fill={COLORS.danger} />
                                    </RechartsBarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Gráfico de Control */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ControlChart className="h-5 w-5" />
                                        <CardTitle>Gráfico de Control</CardTitle>
                                    </div>
                                    <Dialog open={controlDialogOpen} onOpenChange={setControlDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Configurar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Configurar Gráfico de Control</DialogTitle>
                                                <DialogDescription>
                                                    Selecciona los parámetros para generar el gráfico de control
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="control-periodo">Seleccionar semestre</Label>
                                                    <Select value={controlConfig.periodo} onValueChange={(value) => setControlConfig(prev => ({ ...prev, periodo: value }))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un periodo" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Todos los periodos</SelectItem>
                                                            {periodos.map((periodo) => (
                                                                <SelectItem key={periodo.id_periodo} value={periodo.id_periodo.toString()}>
                                                                    {periodo.etiqueta} {periodo.anio}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="control-carrera">Carrera</Label>
                                                    <Select value={controlConfig.carrera} onValueChange={(value) => setControlConfig(prev => ({ ...prev, carrera: value }))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona una carrera" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Todas las carreras</SelectItem>
                                                            {carreras.map((carrera) => (
                                                                <SelectItem key={carrera.id_carrera} value={carrera.id_carrera.toString()}>
                                                                    {carrera.nombre}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="control-variable">Variable a controlar</Label>
                                                    <Select value={controlConfig.variable} onValueChange={(value) => setControlConfig(prev => ({ ...prev, variable: value }))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona variable" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="reprobacion">Tasa de Reprobación</SelectItem>
                                                            <SelectItem value="desercion">Tasa de Deserción</SelectItem>
                                                            <SelectItem value="asistencia">Promedio de Asistencia</SelectItem>
                                                            <SelectItem value="calificacion">Promedio de Calificaciones</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setControlDialogOpen(false)}>
                                                        Cancelar
                                                    </Button>
                                                    <Button onClick={() => {
                                                        setControlDialogOpen(false)
                                                        toast.success('Configuración de control aplicada')
                                                    }}>
                                                        Generar Gráfico
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <CardDescription>
                                    Evolución de reprobación por semestre
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        periodo: {
                                            label: "Período",
                                        },
                                        [controlConfig.variable]: {
                                            label: controlConfig.variable === 'reprobacion' ? '% Reprobación' :
                                                controlConfig.variable === 'desercion' ? '% Deserción' :
                                                    controlConfig.variable === 'asistencia' ? '% Asistencia' :
                                                        controlConfig.variable === 'calificacion' ? 'Calificación Promedio' : 'Variable',
                                        },
                                    }}
                                    className="h-[300px] w-full"
                                >
                                    <LineChart data={getControlReprobacion()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="periodo" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <ReferenceLine y={50} stroke={COLORS.danger} strokeDasharray="5 5" label="Límite Crítico (50%)" />
                                        <Line type="monotone" dataKey={controlConfig.variable} stroke={COLORS.warning} strokeWidth={3} />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Diagrama de Dispersión */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Circle className="h-5 w-5" />
                                        <CardTitle>Diagrama de Dispersión</CardTitle>
                                    </div>
                                    <Dialog open={scatterDialogOpen} onOpenChange={setScatterDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Configurar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Configurar Diagrama de Dispersión</DialogTitle>
                                                <DialogDescription>
                                                    Selecciona las variables para los ejes X e Y
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="scatter-periodo">Semestre</Label>
                                                    <Select value={scatterConfig.periodo} onValueChange={(value) => setScatterConfig(prev => ({ ...prev, periodo: value }))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un periodo" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Todos los periodos</SelectItem>
                                                            {periodos.map((periodo) => (
                                                                <SelectItem key={periodo.id_periodo} value={periodo.id_periodo.toString()}>
                                                                    {periodo.etiqueta} {periodo.anio}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="scatter-x">Variable X</Label>
                                                        <Select value={scatterConfig.variableX} onValueChange={(value) => setScatterConfig(prev => ({ ...prev, variableX: value }))}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Eje X" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="asistencia">Asistencia</SelectItem>
                                                                <SelectItem value="horas_estudio">Horas de Estudio</SelectItem>
                                                                <SelectItem value="factores_riesgo">Factores de Riesgo</SelectItem>
                                                                <SelectItem value="edad">Edad</SelectItem>
                                                                <SelectItem value="semestre">Semestre</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="scatter-y">Variable Y</Label>
                                                        <Select value={scatterConfig.variableY} onValueChange={(value) => setScatterConfig(prev => ({ ...prev, variableY: value }))}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Eje Y" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="promedio">Promedio Notas</SelectItem>
                                                                <SelectItem value="calificacion">Calificación Final</SelectItem>
                                                                <SelectItem value="asistencia">Asistencia</SelectItem>
                                                                <SelectItem value="reprobacion">Tasa Reprobación</SelectItem>
                                                                <SelectItem value="desercion">Tasa Deserción</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setScatterDialogOpen(false)}>
                                                        Cancelar
                                                    </Button>
                                                    <Button onClick={() => {
                                                        setScatterDialogOpen(false)
                                                        toast.success('Configuración de dispersión aplicada')
                                                    }}>
                                                        Exportar gráfico
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <CardDescription>
                                    Relación entre horas de estudio y calificación
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        [scatterConfig.variableX]: {
                                            label: scatterConfig.variableX === 'asistencia' ? 'Asistencia (%)' :
                                                scatterConfig.variableX === 'horas_estudio' ? 'Horas de Estudio' :
                                                    scatterConfig.variableX === 'factores_riesgo' ? 'Factores de Riesgo' :
                                                        scatterConfig.variableX === 'edad' ? 'Edad' :
                                                            scatterConfig.variableX === 'semestre' ? 'Año' : 'Variable X',
                                        },
                                        [scatterConfig.variableY]: {
                                            label: scatterConfig.variableY === 'promedio' ? 'Promedio Notas' :
                                                scatterConfig.variableY === 'calificacion' ? 'Calificación Final' :
                                                    scatterConfig.variableY === 'asistencia' ? 'Asistencia (%)' :
                                                        scatterConfig.variableY === 'reprobacion' ? 'Reprobación' :
                                                            scatterConfig.variableY === 'desercion' ? 'Deserción' : 'Variable Y',
                                        },
                                    }}
                                    className="h-full w-full"
                                >
                                    <ScatterChart data={getDispersionEstudio()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey={scatterConfig.variableX} name={scatterConfig.variableX === 'asistencia' ? 'Asistencia (%)' : 'Variable X'} />
                                        <YAxis dataKey={scatterConfig.variableY} name={scatterConfig.variableY === 'promedio' ? 'Promedio Notas' : 'Variable Y'} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Scatter dataKey={scatterConfig.variableY} fill={COLORS.success} />
                                    </ScatterChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Histograma de Calificaciones */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BarChart2 className="h-5 w-5" />
                                        <CardTitle>Histograma de Calificaciones</CardTitle>
                                    </div>
                                    <Dialog open={histogramDialogOpen} onOpenChange={setHistogramDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Configurar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Configurar Histograma</DialogTitle>
                                                <DialogDescription>
                                                    Selecciona los parámetros para generar el histograma
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="histogram-periodo">Seleccionar semestre</Label>
                                                    <Select value={histogramConfig.periodo} onValueChange={(value) => setHistogramConfig(prev => ({ ...prev, periodo: value }))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un periodo" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Todos los periodos</SelectItem>
                                                            {periodos.map((periodo) => (
                                                                <SelectItem key={periodo.id_periodo} value={periodo.id_periodo.toString()}>
                                                                    {periodo.etiqueta} {periodo.anio}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="histogram-carrera">Carrera</Label>
                                                    <Select value={histogramConfig.carrera} onValueChange={(value) => setHistogramConfig(prev => ({ ...prev, carrera: value }))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona una carrera" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Todas las carreras</SelectItem>
                                                            {carreras.map((carrera) => (
                                                                <SelectItem key={carrera.id_carrera} value={carrera.id_carrera.toString()}>
                                                                    {carrera.nombre}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="histogram-variable">Variable a analizar</Label>
                                                    <Select value={histogramConfig.variable} onValueChange={(value) => setHistogramConfig(prev => ({ ...prev, variable: value }))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona variable" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="calificaciones">Calificaciones</SelectItem>
                                                            <SelectItem value="asistencia">Asistencia</SelectItem>
                                                            <SelectItem value="edad">Edad</SelectItem>
                                                            <SelectItem value="factores">Factores de Riesgo</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setHistogramDialogOpen(false)}>
                                                        Cancelar
                                                    </Button>
                                                    <Button onClick={() => {
                                                        setHistogramDialogOpen(false)
                                                        toast.success('Configuración de histograma aplicada')
                                                    }}>
                                                        Generar Gráfico
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <CardDescription>
                                    Distribución de calificaciones por rangos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        rango: {
                                            label: "Rango de Calificación",
                                        },
                                        frecuencia: {
                                            label: "Frecuencia",
                                        },
                                    }}
                                    className="h-[300px] w-full"
                                >
                                    <RechartsBarChart data={getHistogramaCalificaciones()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="rango" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="frecuencia" fill={COLORS.primary} />
                                    </RechartsBarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                    </div>

                    <h2 className="text-2xl font-bold tracking-tight">Análisis de Datos</h2>
                    {/* Gráficos Principales */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Factores por Categoría */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5" />
                                    Factores por Categoría
                                </CardTitle>
                                <CardDescription>
                                    Distribución de factores de riesgo por categoría
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        categoria: {
                                            label: "Categoría",
                                        },
                                        cantidad: {
                                            label: "Cantidad",
                                        },
                                    }}
                                    className="h-[300px] w-full"
                                >
                                    <PieChart>
                                        <Pie
                                            data={getFactoresPorCategoria()}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            dataKey="cantidad"
                                            nameKey="categoria"
                                        >
                                            {getFactoresPorCategoria().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={Object.values(CATEGORIA_COLORS)[index % Object.keys(CATEGORIA_COLORS).length]} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Severidad de Factores */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Distribución por Severidad
                                </CardTitle>
                                <CardDescription>
                                    Cantidad de factores por nivel de severidad
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        severidad: {
                                            label: "Severidad",
                                        },
                                        cantidad: {
                                            label: "Cantidad",
                                        },
                                    }}
                                    className="h-full w-full"
                                >
                                    <RechartsBarChart data={getFactoresPorSeveridad()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="severidad" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="cantidad" fill={COLORS.primary} />
                                    </RechartsBarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Rendimiento por Carrera */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Rendimiento por Carrera
                                </CardTitle>
                                <CardDescription>
                                    Porcentaje de aprobación por carrera
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        carrera: {
                                            label: "Carrera",
                                        },
                                        porcentajeAprobacion: {
                                            label: "% Aprobación",
                                        },
                                    }}
                                    className="h-full w-full"
                                >
                                    <RechartsBarChart data={getRendimientoPorCarrera()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="carrera" angle={-45} textAnchor="end" height={100} />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="porcentajeAprobacion" fill={COLORS.success} />
                                    </RechartsBarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Top Factores de Riesgo */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Top Factores de Riesgo
                                </CardTitle>
                                <CardDescription>
                                    Los factores más frecuentemente identificados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        factor: {
                                            label: "Factor",
                                        },
                                        cantidad: {
                                            label: "Cantidad",
                                        },
                                    }}
                                    className="h-full w-full"
                                >
                                    <RechartsBarChart data={getTopFactoresRiesgo()} layout="horizontal">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="factor" type="category" width={120} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="cantidad" fill={COLORS.danger} />
                                    </RechartsBarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>



                    </div>

                    {/* Gráfico de Tendencia Temporal */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LineChartIcon className="h-5 w-5" />
                                Tendencia Temporal
                            </CardTitle>
                            <CardDescription>
                                Evolución de factores e inscripciones a lo largo del tiempo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    mes: {
                                        label: "Mes",
                                    },
                                    factores: {
                                        label: "Factores",
                                    },
                                    inscripciones: {
                                        label: "Inscripciones",
                                    },
                                    aprobados: {
                                        label: "Aprobados",
                                    },
                                }}
                                className="h-[300px] w-full"
                            >
                                <LineChart data={getTendenciaTemporal()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="factores" stroke={COLORS.danger} strokeWidth={2} />
                                    <Line type="monotone" dataKey="inscripciones" stroke={COLORS.primary} strokeWidth={2} />
                                    <Line type="monotone" dataKey="aprobados" stroke={COLORS.success} strokeWidth={2} />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>



                    {/* Diagrama de Ishikawa - Ancho completo
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Fish className="h-5 w-5" />
                                Diagrama de Ishikawa - Causas de Deserción
                            </CardTitle>
                            <CardDescription>
                                Análisis de causas principales y secundarias de deserción/reprobación
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {getCausasDesercion().causas.map((categoria, index) => (
                                    <div key={categoria.categoria} className="border rounded-lg p-4">
                                        <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-red-500' :
                                                index === 1 ? 'bg-orange-500' :
                                                    index === 2 ? 'bg-yellow-500' : 'bg-blue-500'
                                                }`}></div>
                                            {categoria.categoria}
                                        </h4>
                                        <div className="space-y-2">
                                            {categoria.causas.map((causa, causaIndex) => (
                                                <div key={causaIndex} className="flex items-center gap-2 p-2 bg-muted rounded">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                    <span className="text-sm">{causa}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card> */}
                </div>
            </div>
        </Layout>
    )
}