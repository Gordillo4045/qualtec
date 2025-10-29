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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    Zap,
    FileText,
    Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Canvg } from 'canvg'

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

// Utilidades para exportar gráficos (Recharts genera SVG)
const getChartSvgFromContainer = (element: HTMLElement | null): SVGSVGElement | null => {
    if (!element) return null
    const svg = element.querySelector('svg') as SVGSVGElement | null
    return svg
}

const svgToPngDataUrl = async (svg: SVGSVGElement, targetWidth = 1000): Promise<string> => {
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)

    // Preparar canvas respetando aspecto
    const bbox = svg.getBBox()
    const aspectRatio = bbox && bbox.width > 0 ? bbox.height / bbox.width : 0.6
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = Math.round(targetWidth * aspectRatio)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Contexto 2D no disponible')

    const v = await Canvg.from(ctx, svgString)
    await v.render()
    return canvas.toDataURL('image/png')
}

// Utilidad sencilla para dibujar tablas sin dependencias externas
const drawTable = (
    pdf: jsPDF,
    headers: string[],
    rows: Array<Array<string | number>>,
    startY: number,
    options?: { columnWidths?: number[]; rowHeight?: number }
): number => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const leftMargin = 20
    const rightMargin = 20
    const usableWidth = pageWidth - leftMargin - rightMargin

    const rowHeight = options?.rowHeight ?? 7
    const columnWidths = options?.columnWidths ?? new Array(headers.length).fill(Math.floor(usableWidth / headers.length))

    let currentY = startY

    const ensureSpace = (needed: number) => {
        const pageHeight = pdf.internal.pageSize.getHeight()
        if (currentY + needed > pageHeight - 20) {
            pdf.addPage()
            currentY = 20
        }
    }

    // Header
    pdf.setFontSize(9)
    pdf.setTextColor(255, 255, 255)
    pdf.setFillColor(31, 41, 55) // gris oscuro
    ensureSpace(rowHeight)
    let x = leftMargin
    headers.forEach((h, idx) => {
        pdf.rect(x, currentY, columnWidths[idx], rowHeight, 'F')
        const text = pdf.splitTextToSize(String(h), columnWidths[idx] - 2)
        pdf.text(text as any, x + 1, currentY + 5)
        x += columnWidths[idx]
    })
    currentY += rowHeight

    // Body
    pdf.setTextColor(0, 0, 0)
    rows.forEach((row, rIndex) => {
        ensureSpace(rowHeight)
        let bx = leftMargin
        // zebra
        if (rIndex % 2 === 0) {
            pdf.setFillColor(243, 244, 246) // gris claro
            pdf.rect(bx, currentY, usableWidth, rowHeight, 'F')
        }
        row.forEach((cell, idx) => {
            pdf.rect(bx, currentY, columnWidths[idx], rowHeight)
            const text = pdf.splitTextToSize(String(cell ?? ''), columnWidths[idx] - 2)
            pdf.text(text as any, bx + 1, currentY + 5)
            bx += columnWidths[idx]
        })
        currentY += rowHeight
    })

    return currentY
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

    // Estados para generación de reportes
    const [generatingReport, setGeneratingReport] = useState(false)
    const [reportType, setReportType] = useState('')

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

    // Funciones para generar reportes Excel
    const generarReporteCompleto = async () => {
        try {
            setGeneratingReport(true)

            // Crear workbook
            const wb = XLSX.utils.book_new()

            // 1. Resumen Ejecutivo
            const resumenEjecutivo = [
                { 'Métrica': 'Total Estudiantes', 'Valor': filteredEstudiantes.length },
                { 'Métrica': 'Total Factores de Riesgo', 'Valor': filteredFactores.length },
                { 'Métrica': 'Total Inscripciones', 'Valor': filteredInscripciones.length },
                { 'Métrica': 'Tasa de Aprobación (%)', 'Valor': filteredInscripciones.length > 0 ? ((filteredInscripciones.filter(ins => ins.aprobado).length / filteredInscripciones.length) * 100).toFixed(1) : '0.0' },
                { 'Métrica': 'Periodo Analizado', 'Valor': selectedPeriod === 'all' ? 'Todos los periodos' : periodos.find(p => p.id_periodo.toString() === selectedPeriod)?.etiqueta + ' ' + periodos.find(p => p.id_periodo.toString() === selectedPeriod)?.anio },
                { 'Métrica': 'Carrera Analizada', 'Valor': selectedCarrera === 'all' ? 'Todas las carreras' : carreras.find(c => c.id_carrera.toString() === selectedCarrera)?.nombre }
            ]

            const wsResumen = XLSX.utils.json_to_sheet(resumenEjecutivo)
            XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo')

            // 2. Análisis de Pareto
            const paretoData = getAnalisisPareto()
            const wsPareto = XLSX.utils.json_to_sheet(paretoData)
            XLSX.utils.book_append_sheet(wb, wsPareto, 'Análisis de Pareto')

            // 3. Histograma de Calificaciones
            const histogramData = getHistogramaCalificaciones()
            const wsHistogram = XLSX.utils.json_to_sheet(histogramData)
            XLSX.utils.book_append_sheet(wb, wsHistogram, 'Histograma Calificaciones')

            // 4. Diagrama de Dispersión
            const scatterData = getDispersionEstudio()
            const wsScatter = XLSX.utils.json_to_sheet(scatterData)
            XLSX.utils.book_append_sheet(wb, wsScatter, 'Diagrama de Dispersión')

            // 5. Gráfico de Control
            const controlData = getControlReprobacion()
            const wsControl = XLSX.utils.json_to_sheet(controlData)
            XLSX.utils.book_append_sheet(wb, wsControl, 'Gráfico de Control')

            // 6. Factores por Categoría
            const factoresCategoria = getFactoresPorCategoria()
            const wsFactoresCategoria = XLSX.utils.json_to_sheet(factoresCategoria)
            XLSX.utils.book_append_sheet(wb, wsFactoresCategoria, 'Factores por Categoría')

            // 7. Distribución por Severidad
            const severidadData = getFactoresPorSeveridad()
            const wsSeveridad = XLSX.utils.json_to_sheet(severidadData)
            XLSX.utils.book_append_sheet(wb, wsSeveridad, 'Distribución por Severidad')

            // 8. Rendimiento por Carrera
            const rendimientoData = getRendimientoPorCarrera()
            const wsRendimiento = XLSX.utils.json_to_sheet(rendimientoData)
            XLSX.utils.book_append_sheet(wb, wsRendimiento, 'Rendimiento por Carrera')

            // 9. Top Factores de Riesgo
            const topFactores = getTopFactoresRiesgo()
            const wsTopFactores = XLSX.utils.json_to_sheet(topFactores)
            XLSX.utils.book_append_sheet(wb, wsTopFactores, 'Top Factores de Riesgo')

            // 10. Tendencia Temporal
            const tendenciaData = getTendenciaTemporal()
            const wsTendencia = XLSX.utils.json_to_sheet(tendenciaData)
            XLSX.utils.book_append_sheet(wb, wsTendencia, 'Tendencia Temporal')

            // 11. Datos Detallados de Factores
            const factoresDetallados = filteredFactores.map(ef => ({
                'Número Control': ef.estudiante?.numero_control || '',
                'Nombre Completo': `${ef.estudiante?.nombres || ''} ${ef.estudiante?.ap_paterno || ''} ${ef.estudiante?.ap_materno || ''}`,
                'Carrera': ef.estudiante?.carrera?.nombre || '',
                'Factor': ef.factor?.nombre || '',
                'Subfactor': ef.subfactor?.nombre || '',
                'Categoría': ef.factor?.categoria || '',
                'Severidad': ef.severidad || 0,
                'Observación': ef.observacion || '',
                'Periodo': `${ef.periodo?.anio || ''}-${ef.periodo?.etiqueta || ''}`,
                'Fecha Registro': ef.fecha_registro || ''
            }))

            const wsFactoresDetallados = XLSX.utils.json_to_sheet(factoresDetallados)
            XLSX.utils.book_append_sheet(wb, wsFactoresDetallados, 'Factores Detallados')

            // 12. Datos Detallados de Inscripciones
            const inscripcionesDetalladas = filteredInscripciones.map(ins => ({
                'Número Control': ins.estudiante?.numero_control || '',
                'Nombre Completo': `${ins.estudiante?.nombres || ''} ${ins.estudiante?.ap_paterno || ''} ${ins.estudiante?.ap_materno || ''}`,
                'Carrera': ins.estudiante?.carrera?.nombre || '',
                'Materia': ins.oferta?.materia?.nombre || '',
                'Grupo': ins.oferta?.grupo?.clave || '',
                'Periodo': `${ins.oferta?.periodo?.anio || ''}-${ins.oferta?.periodo?.etiqueta || ''}`,
                'Calificación Final': ins.cal_final || 0,
                'Asistencia (%)': ins.asistencia_pct || 0,
                'Aprobado': ins.aprobado ? 'Sí' : 'No',
                'Intentos': ins.intentos || 1
            }))

            const wsInscripcionesDetalladas = XLSX.utils.json_to_sheet(inscripcionesDetalladas)
            XLSX.utils.book_append_sheet(wb, wsInscripcionesDetalladas, 'Inscripciones Detalladas')

            // Generar nombre de archivo
            const periodo = selectedPeriod !== 'all' ? periodos.find(p => p.id_periodo.toString() === selectedPeriod) : null
            const carrera = selectedCarrera !== 'all' ? carreras.find(c => c.id_carrera.toString() === selectedCarrera) : null

            let nombreArchivo = 'Reporte_Analitica_Completo'
            if (periodo) nombreArchivo += `_${periodo.anio}-${periodo.etiqueta}`
            if (carrera) nombreArchivo += `_${carrera.nombre.replace(/\s+/g, '_')}`
            nombreArchivo += `_${new Date().toISOString().split('T')[0]}.xlsx`

            // Descargar archivo
            XLSX.writeFile(wb, nombreArchivo)

            toast.success('Reporte completo de analítica generado exitosamente')

        } catch (error) {
            console.error('Error al generar reporte completo:', error)
            toast.error('Error al generar el reporte completo')
        } finally {
            setGeneratingReport(false)
        }
    }

    const generarReportePareto = async () => {
        try {
            setGeneratingReport(true)

            const wb = XLSX.utils.book_new()

            // Datos del análisis de Pareto
            const paretoData = getAnalisisPareto()
            const wsPareto = XLSX.utils.json_to_sheet(paretoData)
            XLSX.utils.book_append_sheet(wb, wsPareto, 'Análisis de Pareto')

            // Configuración utilizada
            const configData = [
                { 'Parámetro': 'Variable Analizada', 'Valor': paretoConfig.variable },
                { 'Parámetro': 'Periodo', 'Valor': paretoConfig.periodo === 'all' ? 'Todos' : periodos.find(p => p.id_periodo.toString() === paretoConfig.periodo)?.etiqueta + ' ' + periodos.find(p => p.id_periodo.toString() === paretoConfig.periodo)?.anio },
                { 'Parámetro': 'Carrera', 'Valor': selectedCarrera === 'all' ? 'Todas' : carreras.find(c => c.id_carrera.toString() === selectedCarrera)?.nombre },
                { 'Parámetro': 'Fecha Generación', 'Valor': new Date().toLocaleString() }
            ]

            const wsConfig = XLSX.utils.json_to_sheet(configData)
            XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuración')

            let nombreArchivo = `Reporte_Pareto_${paretoConfig.variable}_${new Date().toISOString().split('T')[0]}.xlsx`
            XLSX.writeFile(wb, nombreArchivo)

            toast.success('Reporte de análisis de Pareto generado exitosamente')

        } catch (error) {
            console.error('Error al generar reporte Pareto:', error)
            toast.error('Error al generar el reporte de Pareto')
        } finally {
            setGeneratingReport(false)
        }
    }

    const generarReporteHistograma = async () => {
        try {
            setGeneratingReport(true)

            const wb = XLSX.utils.book_new()

            // Datos del histograma
            const histogramData = getHistogramaCalificaciones()
            const wsHistogram = XLSX.utils.json_to_sheet(histogramData)
            XLSX.utils.book_append_sheet(wb, wsHistogram, 'Histograma')

            // Configuración utilizada
            const configData = [
                { 'Parámetro': 'Variable Analizada', 'Valor': histogramConfig.variable },
                { 'Parámetro': 'Periodo', 'Valor': histogramConfig.periodo === 'all' ? 'Todos' : periodos.find(p => p.id_periodo.toString() === histogramConfig.periodo)?.etiqueta + ' ' + periodos.find(p => p.id_periodo.toString() === histogramConfig.periodo)?.anio },
                { 'Parámetro': 'Carrera', 'Valor': histogramConfig.carrera === 'all' ? 'Todas' : carreras.find(c => c.id_carrera.toString() === histogramConfig.carrera)?.nombre },
                { 'Parámetro': 'Fecha Generación', 'Valor': new Date().toLocaleString() }
            ]

            const wsConfig = XLSX.utils.json_to_sheet(configData)
            XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuración')

            let nombreArchivo = `Reporte_Histograma_${histogramConfig.variable}_${new Date().toISOString().split('T')[0]}.xlsx`
            XLSX.writeFile(wb, nombreArchivo)

            toast.success('Reporte de histograma generado exitosamente')

        } catch (error) {
            console.error('Error al generar reporte histograma:', error)
            toast.error('Error al generar el reporte de histograma')
        } finally {
            setGeneratingReport(false)
        }
    }

    const generarReporteDispersion = async () => {
        try {
            setGeneratingReport(true)

            const wb = XLSX.utils.book_new()

            // Datos del diagrama de dispersión
            const scatterData = getDispersionEstudio()
            const wsScatter = XLSX.utils.json_to_sheet(scatterData)
            XLSX.utils.book_append_sheet(wb, wsScatter, 'Diagrama de Dispersión')

            // Configuración utilizada
            const configData = [
                { 'Parámetro': 'Variable X', 'Valor': scatterConfig.variableX },
                { 'Parámetro': 'Variable Y', 'Valor': scatterConfig.variableY },
                { 'Parámetro': 'Periodo', 'Valor': scatterConfig.periodo === 'all' ? 'Todos' : periodos.find(p => p.id_periodo.toString() === scatterConfig.periodo)?.etiqueta + ' ' + periodos.find(p => p.id_periodo.toString() === scatterConfig.periodo)?.anio },
                { 'Parámetro': 'Fecha Generación', 'Valor': new Date().toLocaleString() }
            ]

            const wsConfig = XLSX.utils.json_to_sheet(configData)
            XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuración')

            let nombreArchivo = `Reporte_Dispersion_${scatterConfig.variableX}_vs_${scatterConfig.variableY}_${new Date().toISOString().split('T')[0]}.xlsx`
            XLSX.writeFile(wb, nombreArchivo)

            toast.success('Reporte de diagrama de dispersión generado exitosamente')

        } catch (error) {
            console.error('Error al generar reporte dispersión:', error)
            toast.error('Error al generar el reporte de dispersión')
        } finally {
            setGeneratingReport(false)
        }
    }

    const generarReporteControl = async () => {
        try {
            setGeneratingReport(true)

            const wb = XLSX.utils.book_new()

            // Datos del gráfico de control
            const controlData = getControlReprobacion()
            const wsControl = XLSX.utils.json_to_sheet(controlData)
            XLSX.utils.book_append_sheet(wb, wsControl, 'Gráfico de Control')

            // Configuración utilizada
            const configData = [
                { 'Parámetro': 'Variable Controlada', 'Valor': controlConfig.variable },
                { 'Parámetro': 'Periodo', 'Valor': controlConfig.periodo === 'all' ? 'Todos' : periodos.find(p => p.id_periodo.toString() === controlConfig.periodo)?.etiqueta + ' ' + periodos.find(p => p.id_periodo.toString() === controlConfig.periodo)?.anio },
                { 'Parámetro': 'Carrera', 'Valor': controlConfig.carrera === 'all' ? 'Todas' : carreras.find(c => c.id_carrera.toString() === controlConfig.carrera)?.nombre },
                { 'Parámetro': 'Fecha Generación', 'Valor': new Date().toLocaleString() }
            ]

            const wsConfig = XLSX.utils.json_to_sheet(configData)
            XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuración')

            let nombreArchivo = `Reporte_Control_${controlConfig.variable}_${new Date().toISOString().split('T')[0]}.xlsx`
            XLSX.writeFile(wb, nombreArchivo)

            toast.success('Reporte de gráfico de control generado exitosamente')

        } catch (error) {
            console.error('Error al generar reporte control:', error)
            toast.error('Error al generar el reporte de control')
        } finally {
            setGeneratingReport(false)
        }
    }

    // Estilos de marca y utilidades visuales para PDF
    const BRAND = {
        primary: [240, 245, 255] as [number, number, number], // azul 600
        dark: [31, 41, 55] as [number, number, number],
        light: [243, 244, 246] as [number, number, number]
    }

    const drawHeaderBar = (pdf: jsPDF, title: string) => {
        const pageWidth = pdf.internal.pageSize.getWidth()
        pdf.setFillColor(...BRAND.primary)
        pdf.rect(0, 0, pageWidth, 18, 'F')
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(14)
        pdf.text(title, 20, 12)
        pdf.setTextColor(0, 0, 0)
    }

    const drawChips = (pdf: jsPDF, items: Array<{ label: string; value: string }>, startY: number): number => {
        let x = 20
        let y = startY
        const pageWidth = pdf.internal.pageSize.getWidth()
        const maxX = pageWidth - 20
        pdf.setFontSize(9)
        items.forEach(({ label, value }) => {
            const text = `${label}: ${value}`
            const width = pdf.getTextWidth(text) + 10
            if (x + width > maxX) {
                x = 20
                y += 8
            }
            pdf.setDrawColor(229, 231, 235)
            pdf.setFillColor(...BRAND.light)
            pdf.roundedRect(x, y - 5, width, 8, 2, 2, 'FD')
            pdf.text(text, x + 5, y)
            x += width + 6
        })
        return y + 6
    }

    const drawDivider = (pdf: jsPDF, y: number): number => {
        const pageWidth = pdf.internal.pageSize.getWidth()
        pdf.setDrawColor(229, 231, 235)
        pdf.line(20, y, pageWidth - 20, y)
        return y + 6
    }

    const drawFooter = (pdf: jsPDF) => {
        const pages = pdf.getNumberOfPages()
        for (let i = 1; i <= pages; i++) {
            pdf.setPage(i)
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            pdf.setFontSize(8)
            pdf.setTextColor(107, 114, 128)
            pdf.text(`Página ${i} de ${pages}` as any, pageWidth - 20, pageHeight - 10, { align: 'right' })
        }
        pdf.setTextColor(0, 0, 0)
    }

    // Funciones para generar PDFs
    const generarPDFCompleto = async () => {
        try {
            setGeneratingReport(true)

            // Esperar un poco para asegurar que los elementos estén renderizados
            await new Promise(resolve => setTimeout(resolve, 1000))

            const pdf = new jsPDF('p', 'mm', 'a4')
            drawHeaderBar(pdf, 'Reporte de Analítica Académica')
            let yPosition = 26

            // Información del reporte como chips
            const periodo = selectedPeriod !== 'all' ? periodos.find(p => p.id_periodo.toString() === selectedPeriod) : null
            const carrera = selectedCarrera !== 'all' ? carreras.find(c => c.id_carrera.toString() === selectedCarrera) : null

            yPosition = drawChips(pdf, [
                { label: 'Periodo', value: periodo ? `${periodo.anio}-${periodo.etiqueta}` : 'Todos' },
                { label: 'Carrera', value: carrera ? carrera.nombre : 'Todas' },
                { label: 'Fecha', value: new Date().toLocaleDateString() }
            ], yPosition)
            yPosition = drawDivider(pdf, yPosition)

            // Resumen ejecutivo
            pdf.setFontSize(16)
            pdf.text('Resumen Ejecutivo', 20, yPosition)
            yPosition += 10

            pdf.setFontSize(10)
            pdf.text(`Total Estudiantes: ${filteredEstudiantes.length}`, 20, yPosition)
            yPosition += 6
            pdf.text(`Total Factores de Riesgo: ${filteredFactores.length}`, 20, yPosition)
            yPosition += 6
            pdf.text(`Total Inscripciones: ${filteredInscripciones.length}`, 20, yPosition)
            yPosition += 6
            const tasaAprobacion = filteredInscripciones.length > 0 ? ((filteredInscripciones.filter(ins => ins.aprobado).length / filteredInscripciones.length) * 100).toFixed(1) : '0.0'
            pdf.text(`Tasa de Aprobación: ${tasaAprobacion}%`, 20, yPosition)
            yPosition += 15

            // Capturar gráficos como imágenes
            const chartElements = [
                { id: 'pareto-chart', title: 'Análisis de Pareto' },
                { id: 'control-chart', title: 'Gráfico de Control' },
                { id: 'scatter-chart', title: 'Diagrama de Dispersión' },
                { id: 'histogram-chart', title: 'Histograma de Calificaciones' }
            ]

            // Buscar todos los ChartContainers disponibles
            const chartContainers = document.querySelectorAll('.recharts-wrapper')
            console.log('ChartContainers encontrados para PDF completo:', chartContainers.length)

            for (let i = 0; i < chartElements.length; i++) {
                const chart = chartElements[i]
                let element = document.getElementById(chart.id)
                console.log(`Buscando elemento con ID: ${chart.id}`, element)

                // Si no se encuentra por ID, usar por posición
                if (!element && i < chartContainers.length) {
                    element = chartContainers[i] as HTMLElement
                    console.log(`Usando ChartContainer en posición ${i} para ${chart.title}:`, element)
                }

                if (element) {
                    // Nueva página si es necesario
                    if (yPosition > 200) {
                        pdf.addPage()
                        yPosition = 20
                    }

                    pdf.setFontSize(14)
                    pdf.setTextColor(...BRAND.dark)
                    pdf.text(chart.title, 20, yPosition)
                    yPosition += 10

                    try {
                        const svg = getChartSvgFromContainer(element)
                        if (!svg) {
                            pdf.text(`No se encontró SVG para ${chart.title}`, 20, yPosition)
                            yPosition += 10
                        } else {
                            const imgData = await svgToPngDataUrl(svg, 1000)
                            const imgWidth = 170
                            // Calcular altura manteniendo proporción del PNG generado (A4 ~ 210mm ancho - márgenes)
                            const tempImg = new Image()
                            await new Promise<void>((resolve) => { tempImg.onload = () => resolve(); tempImg.src = imgData })
                            const imgHeight = (tempImg.height * imgWidth) / tempImg.width

                            pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight)
                            yPosition += imgHeight + 8

                            // Tabla de datos del gráfico
                            pdf.setFontSize(12)
                            pdf.text('Datos del análisis', 20, yPosition)
                            yPosition += 6

                            switch (chart.title) {
                                case 'Análisis de Pareto': {
                                    const data = getAnalisisPareto().slice(0, 12)
                                    const headers = ['Categoría', 'Reprobados', '% acumulado']
                                    const rows = data.map(d => [d.grupo, d.reprobados, `${d.porcentaje}%`])
                                    yPosition = drawTable(pdf, headers, rows, yPosition)
                                    break
                                }
                                case 'Gráfico de Control': {
                                    const data = getControlReprobacion()
                                    const headers = ['Periodo', controlConfig.variable]
                                    const rows = data.map(d => [d.periodo, `${d[controlConfig.variable]}%`])
                                    yPosition = drawTable(pdf, headers, rows, yPosition)
                                    break
                                }
                                case 'Diagrama de Dispersión': {
                                    const data = getDispersionEstudio().slice(0, 20)
                                    const headers = ['Estudiante', scatterConfig.variableX, scatterConfig.variableY]
                                    const rows = data.map(d => [d.estudiante, d[scatterConfig.variableX], d[scatterConfig.variableY]])
                                    yPosition = drawTable(pdf, headers, rows, yPosition)
                                    break
                                }
                                case 'Histograma de Calificaciones': {
                                    const data = getHistogramaCalificaciones()
                                    const headers = ['Rango', 'Frecuencia']
                                    const rows = data.map(d => [d.rango, d.frecuencia])
                                    yPosition = drawTable(pdf, headers, rows, yPosition)
                                    break
                                }
                            }

                            yPosition = drawDivider(pdf, yPosition)
                        }
                    } catch (error) {
                        console.error(`Error capturando ${chart.title}:`, error)
                        pdf.text(`Error al capturar ${chart.title}`, 20, yPosition)
                        yPosition += 10
                    }
                }
            }

            // Datos tabulares
            pdf.addPage()
            drawHeaderBar(pdf, 'Datos Detallados')
            yPosition = 26

            pdf.setFontSize(16)
            pdf.text('Datos Detallados', 20, yPosition)
            yPosition += 12

            // Top factores de riesgo (tabla)
            pdf.setFontSize(12)
            pdf.text('Top Factores de Riesgo', 20, yPosition)
            yPosition += 6
            {
                const topFactores = getTopFactoresRiesgo().slice(0, 15)
                const headers = ['Factor', 'Cantidad', 'Severidad prom.']
                const rows = topFactores.map(f => [f.factor, f.cantidad, f.severidadPromedio.toFixed(1)])
                yPosition = drawTable(pdf, headers, rows, yPosition)
            }

            yPosition = drawDivider(pdf, yPosition)

            // Rendimiento por carrera (tabla)
            pdf.setFontSize(12)
            pdf.text('Rendimiento por Carrera', 20, yPosition)
            yPosition += 6
            {
                const rendimiento = getRendimientoPorCarrera()
                const headers = ['Carrera', '% Aprobación', 'Inscripciones']
                const rows = rendimiento.map(r => [r.carrera, `${r.porcentajeAprobacion}%`, r.inscripciones])
                yPosition = drawTable(pdf, headers, rows, yPosition)
            }

            // Pie de página
            drawFooter(pdf)

            // Generar nombre de archivo
            let nombreArchivo = 'Reporte_Analitica_Completo'
            if (periodo) nombreArchivo += `_${periodo.anio}-${periodo.etiqueta}`
            if (carrera) nombreArchivo += `_${carrera.nombre.replace(/\s+/g, '_')}`
            nombreArchivo += `_${new Date().toISOString().split('T')[0]}.pdf`

            // Descargar PDF
            pdf.save(nombreArchivo)

            toast.success('Reporte PDF completo generado exitosamente')

        } catch (error) {
            console.error('Error al generar PDF completo:', error)
            toast.error('Error al generar el reporte PDF')
        } finally {
            setGeneratingReport(false)
        }
    }

    const generarPDFIndividual = async (chartType: string) => {
        try {
            setGeneratingReport(true)

            // Esperar un poco para asegurar que los elementos estén renderizados
            await new Promise(resolve => setTimeout(resolve, 1000))

            const pdf = new jsPDF('p', 'mm', 'a4')
            drawHeaderBar(pdf, `Reporte de ${chartType}`)
            let yPosition = 26

            // Información del reporte como chips
            const periodo = selectedPeriod !== 'all' ? periodos.find(p => p.id_periodo.toString() === selectedPeriod) : null
            const carrera = selectedCarrera !== 'all' ? carreras.find(c => c.id_carrera.toString() === selectedCarrera) : null

            yPosition = drawChips(pdf, [
                { label: 'Periodo', value: periodo ? `${periodo.anio}-${periodo.etiqueta}` : 'Todos' },
                { label: 'Carrera', value: carrera ? carrera.nombre : 'Todas' },
                { label: 'Fecha', value: new Date().toLocaleDateString() }
            ], yPosition)
            yPosition = drawDivider(pdf, yPosition)

            // Capturar gráfico específico
            let chartId = ''
            switch (chartType) {
                case 'Análisis de Pareto':
                    chartId = 'pareto-chart'
                    break
                case 'Gráfico de Control':
                    chartId = 'control-chart'
                    break
                case 'Diagrama de Dispersión':
                    chartId = 'scatter-chart'
                    break
                case 'Histograma de Calificaciones':
                    chartId = 'histogram-chart'
                    break
                default:
                    chartId = `${chartType.toLowerCase().replace(/\s+/g, '-')}-chart`
            }

            let element = document.getElementById(chartId)
            console.log(`Buscando elemento con ID: ${chartId}`, element)
            console.log('Todos los elementos con ID que contienen "chart":',
                Array.from(document.querySelectorAll('[id*="chart"]')).map(el => el.id))

            // Si no se encuentra por ID, buscar por posición en el DOM
            if (!element) {
                console.log('Elemento no encontrado por ID, buscando por posición...')

                // Buscar todos los ChartContainers
                const chartContainers = document.querySelectorAll('.recharts-wrapper')
                console.log('ChartContainers encontrados:', chartContainers.length)

                // Mapear por posición (asumiendo orden específico)
                let chartIndex = -1
                switch (chartType) {
                    case 'Análisis de Pareto':
                        chartIndex = 0
                        break
                    case 'Gráfico de Control':
                        chartIndex = 1
                        break
                    case 'Diagrama de Dispersión':
                        chartIndex = 2
                        break
                    case 'Histograma de Calificaciones':
                        chartIndex = 3
                        break
                }

                if (chartIndex >= 0 && chartIndex < chartContainers.length) {
                    element = chartContainers[chartIndex] as HTMLElement
                    console.log(`Usando ChartContainer en posición ${chartIndex}:`, element)
                } else {
                    console.log('No se pudo encontrar el gráfico por posición')
                }
            }

            if (element) {
                try {
                    const svg = getChartSvgFromContainer(element)
                    if (!svg) {
                        pdf.text(`No se encontró SVG para ${chartType}`, 20, yPosition)
                    } else {
                        const imgData = await svgToPngDataUrl(svg, 1000)
                        const imgWidth = 170
                        const tempImg = new Image()
                        await new Promise<void>((resolve) => { tempImg.onload = () => resolve(); tempImg.src = imgData })
                        const imgHeight = (tempImg.height * imgWidth) / tempImg.width

                        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight)
                        yPosition += imgHeight + 15
                    }

                    // Agregar datos tabulares
                    pdf.setFontSize(12)
                    pdf.text('Datos del Análisis', 20, yPosition)
                    yPosition += 6

                    switch (chartType) {
                        case 'Análisis de Pareto': {
                            const data = getAnalisisPareto().slice(0, 15)
                            const headers = ['Categoría', 'Reprobados', '% acumulado']
                            const rows = data.map(d => [d.grupo, d.reprobados, `${d.porcentaje}%`])
                            yPosition = drawTable(pdf, headers, rows, yPosition)
                            break
                        }
                        case 'Gráfico de Control': {
                            const data = getControlReprobacion()
                            const headers = ['Periodo', controlConfig.variable]
                            const rows = data.map(d => [d.periodo, `${d[controlConfig.variable]}%`])
                            yPosition = drawTable(pdf, headers, rows, yPosition)
                            break
                        }
                        case 'Diagrama de Dispersión': {
                            const data = getDispersionEstudio().slice(0, 20)
                            const headers = ['Estudiante', scatterConfig.variableX, scatterConfig.variableY]
                            const rows = data.map(d => [d.estudiante, d[scatterConfig.variableX], d[scatterConfig.variableY]])
                            yPosition = drawTable(pdf, headers, rows, yPosition)
                            break
                        }
                        case 'Histograma de Calificaciones': {
                            const data = getHistogramaCalificaciones()
                            const headers = ['Rango', 'Frecuencia']
                            const rows = data.map(d => [d.rango, d.frecuencia])
                            yPosition = drawTable(pdf, headers, rows, yPosition)
                            break
                        }
                    }

                } catch (error) {
                    console.error(`Error capturando ${chartType}:`, error)
                    pdf.text(`Error al capturar ${chartType}`, 20, yPosition)
                }
            } else {
                pdf.text(`No se encontró el gráfico ${chartType}`, 20, yPosition)
            }

            // Pie de página y nombre de archivo
            drawFooter(pdf)

            // Generar nombre de archivo
            let nombreArchivo = `Reporte_${chartType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

            // Descargar PDF
            pdf.save(nombreArchivo)

            toast.success(`Reporte PDF de ${chartType} generado exitosamente`)

        } catch (error) {
            console.error(`Error al generar PDF de ${chartType}:`, error)
            toast.error(`Error al generar el reporte PDF de ${chartType}`)
        } finally {
            setGeneratingReport(false)
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={generatingReport}>
                                    <Download className="h-4 w-4 mr-2" />
                                    {generatingReport ? 'Generando...' : 'Exportar Reportes'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={generarPDFCompleto}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Reporte PDF Completo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => generarPDFIndividual('Análisis de Pareto')}>
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    PDF Análisis de Pareto
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => generarPDFIndividual('Histograma de Calificaciones')}>
                                    <BarChart2 className="h-4 w-4 mr-2" />
                                    PDF Histograma
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => generarPDFIndividual('Diagrama de Dispersión')}>
                                    <Circle className="h-4 w-4 mr-2" />
                                    PDF Diagrama de Dispersión
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => generarPDFIndividual('Gráfico de Control')}>
                                    <ControlChart className="h-4 w-4 mr-2" />
                                    PDF Gráfico de Control
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Lanzadores de análisis (cards) */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Helper invisible para scroll */}
                    {null}

                    {/* Card: Rendimiento Académico */}
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
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    setHistogramDialogOpen(true)
                                    document.getElementById('histogram-chart')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Generar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Card: Factores de Riesgo */}
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
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    setParetoDialogOpen(true)
                                    document.getElementById('pareto-chart')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Generar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Card: Estadísticas Generales */}
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <PieChartIcon className="h-8 w-8 text-green-600" />
                                <Badge variant="outline">Estadístico</Badge>
                            </div>
                            <CardTitle className="text-lg">Estadísticas Generales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Métricas generales del sistema y comparativas
                            </p>
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    setControlDialogOpen(true)
                                    document.getElementById('control-chart')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Generar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Card: Reporte de Asistencia */}
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
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    setControlConfig(prev => ({ ...prev, variable: 'asistencia' }))
                                    setControlDialogOpen(true)
                                    document.getElementById('control-chart')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Generar
                            </Button>
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
                                    <div className="flex gap-2">
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
                                                        <Button
                                                            disabled={generatingReport}
                                                            onClick={async () => {
                                                                setParetoDialogOpen(false)
                                                                toast.success('Configuración de Pareto aplicada')
                                                                await generarPDFCompleto()
                                                            }}
                                                        >
                                                            {generatingReport ? 'Generando PDF...' : 'Generar'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => generarPDFIndividual('Análisis de Pareto')}
                                            disabled={generatingReport}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            PDF
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>
                                    Factores que más afectan por grupo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    id="pareto-chart"
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
                                    <div className="flex gap-2">
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
                                                        <Button
                                                            disabled={generatingReport}
                                                            onClick={async () => {
                                                                setControlDialogOpen(false)
                                                                toast.success('Configuración de control aplicada')
                                                                await generarPDFCompleto()
                                                            }}
                                                        >
                                                            {generatingReport ? 'Generando PDF...' : 'Generar'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => generarPDFIndividual('Gráfico de Control')}
                                            disabled={generatingReport}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            PDF
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>
                                    Evolución de reprobación por semestre
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    id="control-chart"
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
                                    <div className="flex gap-2">
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
                                                        <Button
                                                            disabled={generatingReport}
                                                            onClick={async () => {
                                                                setScatterDialogOpen(false)
                                                                toast.success('Configuración de dispersión aplicada')
                                                                await generarPDFCompleto()
                                                            }}
                                                        >
                                                            {generatingReport ? 'Generando PDF...' : 'Generar'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => generarPDFIndividual('Diagrama de Dispersión')}
                                            disabled={generatingReport}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            PDF
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>
                                    Relación entre horas de estudio y calificación
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    id="scatter-chart"
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
                                    className="h-[300px] w-full"
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
                                    <div className="flex gap-2">
                                        <Dialog open={histogramDialogOpen} onOpenChange={setHistogramDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    Configurar
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogTitle>Configurar Histograma</DialogTitle>
                                                <DialogDescription>
                                                    Selecciona los parámetros para generar el histograma
                                                </DialogDescription>
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
                                                        <Button
                                                            disabled={generatingReport}
                                                            onClick={async () => {
                                                                setHistogramDialogOpen(false)
                                                                toast.success('Configuración de histograma aplicada')
                                                                await generarPDFCompleto()
                                                            }}
                                                        >
                                                            {generatingReport ? 'Generando PDF...' : 'Generar'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => generarPDFIndividual('Histograma de Calificaciones')}
                                            disabled={generatingReport}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            PDF
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>
                                    Distribución de calificaciones por rangos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    id="histogram-chart"
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
                                    className="h-[300px] w-full"
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
                                    className="h-[300px] w-full"
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
                                    className="h-[300px] w-full"
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