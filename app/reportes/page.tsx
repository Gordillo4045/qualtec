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
    Eye,
    Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
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
    PieChart as RechartsPieChart,
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
    ComposedChart
} from "recharts"

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

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6b7280', '#ec4899']

export default function ReportesPage() {
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState<string | null>(null)
    const [reportes, setReportes] = useState<any[]>([])
    const [periodos, setPeriodos] = useState<any[]>([])
    const [carreras, setCarreras] = useState<any[]>([])
    const [selectedPeriodo, setSelectedPeriodo] = useState('')
    const [selectedCarrera, setSelectedCarrera] = useState('')
    const [showDialog, setShowDialog] = useState(false)
    const [reporteType, setReporteType] = useState('')

    // Estados para analítica
    const [inscripciones, setInscripciones] = useState<any[]>([])
    const [estudiantes, setEstudiantes] = useState<any[]>([])
    const [factores, setFactores] = useState<any[]>([])
    const [estudianteFactores, setEstudianteFactores] = useState<any[]>([])
    const [materias, setMaterias] = useState<any[]>([])
    const [grupos, setGrupos] = useState<any[]>([])
    const [departamentos, setDepartamentos] = useState<any[]>([])
    const [modalidades, setModalidades] = useState<any[]>([])
    const [ofertas, setOfertas] = useState<any[]>([])
    const [subfactores, setSubfactores] = useState<any[]>([])

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Obtener todos los datos necesarios para analítica
            const [
                periodosResult,
                carrerasResult,
                inscripcionesResult,
                estudiantesResult,
                factoresResult,
                estudianteFactoresResult,
                materiasResult,
                gruposResult,
                departamentosResult,
                modalidadesResult,
                ofertasResult,
                subfactoresResult
            ] = await Promise.all([
                supabase.from('periodo').select('*').order('anio', { ascending: false }).order('etiqueta', { ascending: true }),
                supabase.from('carrera').select('*').order('nombre'),
                supabase.from('inscripcion').select(`
                    *,
                    estudiante:estudiante(*, carrera:carrera(*)),
                    oferta:oferta(*, materia:materia(*), periodo:periodo(*), grupo:grupo(*))
                `),
                supabase.from('estudiante').select('*, carrera:carrera(*)'),
                supabase.from('factor').select('*'),
                supabase.from('estudiante_factor').select(`
                    *,
                    estudiante:estudiante(*, carrera:carrera(*)),
                    factor:factor(*),
                    subfactor:subfactor(*),
                    periodo:periodo(*)
                `),
                supabase.from('materia').select('*, departamento:departamento(*)'),
                supabase.from('grupo').select('*, carrera:carrera(*)'),
                supabase.from('departamento').select('*'),
                supabase.from('modalidad').select('*'),
                supabase.from('oferta').select(`
                    *,
                    materia:materia(*),
                    periodo:periodo(*),
                    grupo:grupo(*)
                `),
                supabase.from('subfactor').select('*, factor:factor(*)')
            ])

            // Actualizar estados
            setPeriodos(periodosResult.data || [])
            setCarreras(carrerasResult.data || [])
            setInscripciones(inscripcionesResult.data || [])
            setEstudiantes(estudiantesResult.data || [])
            setFactores(factoresResult.data || [])
            setEstudianteFactores(estudianteFactoresResult.data || [])
            setMaterias(materiasResult.data || [])
            setGrupos(gruposResult.data || [])
            setDepartamentos(departamentosResult.data || [])
            setModalidades(modalidadesResult.data || [])
            setOfertas(ofertasResult.data || [])
            setSubfactores(subfactoresResult.data || [])

            // Simular reportes generados (en un sistema real vendrían de una tabla de reportes)
            setReportes([
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
                }
            ])

        } catch (error) {
            console.error('Error al cargar datos:', error)
            toast.error('Error al cargar los datos')
        } finally {
            setLoading(false)
        }
    }

    // Funciones para generar datos de gráficos usando datos reales
    const generarDatosGraficoAcademico = () => {
        // Filtrar datos según selección
        let inscripcionesFiltradas = inscripciones

        if (selectedPeriodo && selectedPeriodo !== 'all') {
            inscripcionesFiltradas = inscripcionesFiltradas.filter(ins =>
                ins.oferta?.id_periodo?.toString() === selectedPeriodo
            )
        }

        if (selectedCarrera && selectedCarrera !== 'all') {
            inscripcionesFiltradas = inscripcionesFiltradas.filter(ins =>
                ins.estudiante?.id_carrera?.toString() === selectedCarrera
            )
        }

        // Gráfico de distribución de calificaciones
        const rangosCalificaciones = [
            { rango: '0-20', min: 0, max: 20 },
            { rango: '21-40', min: 21, max: 40 },
            { rango: '41-60', min: 41, max: 60 },
            { rango: '61-80', min: 61, max: 80 },
            { rango: '81-100', min: 81, max: 100 }
        ]

        const distribucionCalificaciones = rangosCalificaciones.map(rango => ({
            rango: rango.rango,
            cantidad: inscripcionesFiltradas.filter(ins =>
                ins.cal_final >= rango.min && ins.cal_final <= rango.max
            ).length
        }))

        // Gráfico de aprobación por carrera
        const aprobacionPorCarrera = carreras.map(carrera => {
            const inscripcionesCarrera = inscripcionesFiltradas.filter(ins =>
                ins.estudiante?.id_carrera === carrera.id_carrera
            )
            const aprobadas = inscripcionesCarrera.filter(ins => ins.aprobado).length
            const total = inscripcionesCarrera.length
            const tasaAprobacion = total > 0 ? (aprobadas / total * 100) : 0

            return {
                carrera: carrera.nombre,
                aprobadas,
                reprobadas: total - aprobadas,
                tasaAprobacion: Number(tasaAprobacion.toFixed(1))
            }
        }).filter(item => item.aprobadas > 0 || item.reprobadas > 0)

        return {
            distribucionCalificaciones,
            aprobacionPorCarrera
        }
    }

    const generarDatosGraficoFactores = () => {
        // Filtrar datos según selección
        let factoresFiltrados = estudianteFactores

        if (selectedPeriodo && selectedPeriodo !== 'all') {
            factoresFiltrados = factoresFiltrados.filter(ef =>
                ef.id_periodo?.toString() === selectedPeriodo
            )
        }

        if (selectedCarrera && selectedCarrera !== 'all') {
            factoresFiltrados = factoresFiltrados.filter(ef =>
                ef.estudiante?.id_carrera?.toString() === selectedCarrera
            )
        }

        // Gráfico de factores por categoría
        const factoresPorCategoria = factoresFiltrados.reduce((acc: any, ef) => {
            const categoria = ef.factor?.categoria || 'Sin categoría'
            if (!acc[categoria]) {
                acc[categoria] = { categoria, cantidad: 0, severidadPromedio: 0 }
            }
            acc[categoria].cantidad += 1
            acc[categoria].severidadPromedio += ef.severidad
            return acc
        }, {})

        const datosCategoria = Object.values(factoresPorCategoria).map((item: any) => ({
            categoria: item.categoria,
            cantidad: item.cantidad,
            severidadPromedio: Number((item.severidadPromedio / item.cantidad).toFixed(1))
        }))

        // Gráfico de severidad por factor
        const severidadPorFactor = factoresFiltrados.reduce((acc: any, ef) => {
            const factor = ef.factor?.nombre || 'Sin factor'
            if (!acc[factor]) {
                acc[factor] = { factor, cantidad: 0, severidadTotal: 0 }
            }
            acc[factor].cantidad += 1
            acc[factor].severidadTotal += ef.severidad
            return acc
        }, {})

        const datosFactor = Object.values(severidadPorFactor)
            .map((item: any) => ({
                factor: item.factor,
                cantidad: item.cantidad,
                severidadPromedio: Number((item.severidadTotal / item.cantidad).toFixed(1))
            }))
            .sort((a: any, b: any) => b.cantidad - a.cantidad)
            .slice(0, 10)

        return {
            datosCategoria,
            datosFactor
        }
    }

    const generarDatosGraficoEstadisticas = () => {
        // Gráfico de evolución por periodo
        const evolucionPorPeriodo = periodos.slice(0, 6).map(periodo => {
            const inscripcionesPeriodo = inscripciones.filter(ins =>
                ins.oferta?.id_periodo === periodo.id_periodo
            )
            const aprobadas = inscripcionesPeriodo.filter(ins => ins.aprobado).length
            const total = inscripcionesPeriodo.length
            const tasaAprobacion = total > 0 ? (aprobadas / total * 100) : 0

            return {
                periodo: `${periodo.anio}-${periodo.etiqueta}`,
                totalInscripciones: total,
                aprobadas,
                tasaAprobacion: Number(tasaAprobacion.toFixed(1))
            }
        })

        // Gráfico de distribución de estudiantes por carrera
        const distribucionEstudiantes = carreras.map(carrera => {
            const estudiantesCarrera = estudiantes.filter(est =>
                est.id_carrera === carrera.id_carrera
            ).length

            return {
                carrera: carrera.nombre,
                estudiantes: estudiantesCarrera
            }
        }).sort((a: any, b: any) => b.estudiantes - a.estudiantes)

        return {
            evolucionPorPeriodo,
            distribucionEstudiantes
        }
    }

    const generarDatosGraficoAsistencia = () => {
        // Filtrar datos según selección
        let inscripcionesFiltradas = inscripciones

        if (selectedPeriodo && selectedPeriodo !== 'all') {
            inscripcionesFiltradas = inscripcionesFiltradas.filter(ins =>
                ins.oferta?.id_periodo?.toString() === selectedPeriodo
            )
        }

        if (selectedCarrera && selectedCarrera !== 'all') {
            inscripcionesFiltradas = inscripcionesFiltradas.filter(ins =>
                ins.estudiante?.id_carrera?.toString() === selectedCarrera
            )
        }

        // Gráfico de distribución de asistencia
        const rangosAsistencia = [
            { rango: '0-20%', min: 0, max: 20 },
            { rango: '21-40%', min: 21, max: 40 },
            { rango: '41-60%', min: 41, max: 60 },
            { rango: '61-80%', min: 61, max: 80 },
            { rango: '81-100%', min: 81, max: 100 }
        ]

        const distribucionAsistencia = rangosAsistencia.map(rango => ({
            rango: rango.rango,
            cantidad: inscripcionesFiltradas.filter(ins =>
                ins.asistencia_pct >= rango.min && ins.asistencia_pct <= rango.max
            ).length
        }))

        // Gráfico de asistencia vs calificación
        const asistenciaVsCalificacion = inscripcionesFiltradas.map(ins => ({
            asistencia: ins.asistencia_pct || 0,
            calificacion: ins.cal_final || 0,
            aprobado: ins.aprobado ? 'Aprobado' : 'Reprobado'
        }))

        return {
            distribucionAsistencia,
            asistenciaVsCalificacion
        }
    }

    const generarReporteAcademico = async () => {
        try {
            setGenerating('academico')

            // Obtener datos de inscripciones con información completa
            const { data: inscripcionesData, error } = await supabase
                .from('inscripcion')
                .select(`
                    *,
                    estudiante:estudiante(*, carrera:carrera(*)),
                    oferta:oferta(*, materia:materia(*), periodo:periodo(*), grupo:grupo(*))
                `)

            if (error) throw error

            // Preparar datos para Excel
            const datosReporte = inscripcionesData?.map(ins => ({
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
            })) || []

            // Generar datos de gráficos
            const datosGraficos = generarDatosGraficoAcademico()

            // Crear archivo Excel
            const ws = XLSX.utils.json_to_sheet(datosReporte)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Rendimiento Académico')

            // Agregar hojas de gráficos
            const wsDistribucion = XLSX.utils.json_to_sheet(datosGraficos.distribucionCalificaciones)
            XLSX.utils.book_append_sheet(wb, wsDistribucion, 'Distribución Calificaciones')

            const wsAprobacion = XLSX.utils.json_to_sheet(datosGraficos.aprobacionPorCarrera)
            XLSX.utils.book_append_sheet(wb, wsAprobacion, 'Aprobación por Carrera')

            // Generar nombre de archivo
            const periodo = selectedPeriodo && selectedPeriodo !== 'all' ? periodos.find(p => p.id_periodo.toString() === selectedPeriodo) : null
            const carrera = selectedCarrera && selectedCarrera !== 'all' ? carreras.find(c => c.id_carrera.toString() === selectedCarrera) : null

            let nombreArchivo = 'Reporte_Rendimiento_Academico'
            if (periodo) nombreArchivo += `_${periodo.anio}-${periodo.etiqueta}`
            if (carrera) nombreArchivo += `_${carrera.nombre.replace(/\s+/g, '_')}`
            nombreArchivo += `_${new Date().toISOString().split('T')[0]}.xlsx`

            // Descargar archivo
            XLSX.writeFile(wb, nombreArchivo)

            toast.success('Reporte de rendimiento académico generado exitosamente')

        } catch (error) {
            console.error('Error al generar reporte académico:', error)
            toast.error('Error al generar el reporte académico')
        } finally {
            setGenerating(null)
        }
    }

    const generarReporteFactores = async () => {
        try {
            setGenerating('factores')

            // Obtener datos de factores de riesgo
            const { data: factoresData, error } = await supabase
                .from('estudiante_factor')
                .select(`
                    *,
                    estudiante:estudiante(*, carrera:carrera(*)),
                    factor:factor(*),
                    subfactor:subfactor(*),
                    periodo:periodo(*)
                `)

            if (error) throw error

            // Preparar datos para Excel
            const datosReporte = factoresData?.map(ef => ({
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
            })) || []

            // Generar datos de gráficos
            const datosGraficos = generarDatosGraficoFactores()

            // Crear archivo Excel
            const ws = XLSX.utils.json_to_sheet(datosReporte)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Factores de Riesgo')

            // Agregar hojas de gráficos
            const wsCategoria = XLSX.utils.json_to_sheet(datosGraficos.datosCategoria)
            XLSX.utils.book_append_sheet(wb, wsCategoria, 'Factores por Categoría')

            const wsFactor = XLSX.utils.json_to_sheet(datosGraficos.datosFactor)
            XLSX.utils.book_append_sheet(wb, wsFactor, 'Severidad por Factor')

            // Generar nombre de archivo
            const periodo = selectedPeriodo && selectedPeriodo !== 'all' ? periodos.find(p => p.id_periodo.toString() === selectedPeriodo) : null
            const carrera = selectedCarrera && selectedCarrera !== 'all' ? carreras.find(c => c.id_carrera.toString() === selectedCarrera) : null

            let nombreArchivo = 'Reporte_Factores_Riesgo'
            if (periodo) nombreArchivo += `_${periodo.anio}-${periodo.etiqueta}`
            if (carrera) nombreArchivo += `_${carrera.nombre.replace(/\s+/g, '_')}`
            nombreArchivo += `_${new Date().toISOString().split('T')[0]}.xlsx`

            // Descargar archivo
            XLSX.writeFile(wb, nombreArchivo)

            toast.success('Reporte de factores de riesgo generado exitosamente')

        } catch (error) {
            console.error('Error al generar reporte de factores:', error)
            toast.error('Error al generar el reporte de factores')
        } finally {
            setGenerating(null)
        }
    }

    const generarReporteEstadisticas = async () => {
        try {
            setGenerating('estadisticas')

            // Obtener estadísticas generales
            const { data: inscripcionesData } = await supabase
                .from('inscripcion')
                .select(`
                    *,
                    estudiante:estudiante(*, carrera:carrera(*)),
                    oferta:oferta(*, materia:materia(*), periodo:periodo(*))
                `)

            const { data: estudiantesData } = await supabase
                .from('estudiante')
                .select('*, carrera:carrera(*)')

            const { data: factoresData } = await supabase
                .from('estudiante_factor')
                .select('*, factor:factor(*)')

            // Calcular estadísticas
            const totalEstudiantes = estudiantesData?.length || 0
            const totalInscripciones = inscripcionesData?.length || 0
            const inscripcionesAprobadas = inscripcionesData?.filter(ins => ins.aprobado).length || 0
            const tasaReprobacion = totalInscripciones > 0 ? ((totalInscripciones - inscripcionesAprobadas) / totalInscripciones * 100) : 0

            // Estadísticas por carrera
            const estadisticasCarrera = carreras.map(carrera => {
                const estudiantesCarrera = estudiantesData?.filter(est => est.id_carrera === carrera.id_carrera) || []
                const inscripcionesCarrera = inscripcionesData?.filter(ins => ins.estudiante?.id_carrera === carrera.id_carrera) || []
                const aprobadasCarrera = inscripcionesCarrera.filter(ins => ins.aprobado).length
                const tasaReprobacionCarrera = inscripcionesCarrera.length > 0 ?
                    ((inscripcionesCarrera.length - aprobadasCarrera) / inscripcionesCarrera.length * 100) : 0

                return {
                    'Carrera': carrera.nombre,
                    'Total Estudiantes': estudiantesCarrera.length,
                    'Total Inscripciones': inscripcionesCarrera.length,
                    'Inscripciones Aprobadas': aprobadasCarrera,
                    'Tasa Reprobación (%)': Number(tasaReprobacionCarrera.toFixed(2))
                }
            })

            // Estadísticas generales
            const estadisticasGenerales = [
                { 'Métrica': 'Total Estudiantes', 'Valor': totalEstudiantes },
                { 'Métrica': 'Total Inscripciones', 'Valor': totalInscripciones },
                { 'Métrica': 'Inscripciones Aprobadas', 'Valor': inscripcionesAprobadas },
                { 'Métrica': 'Tasa Reprobación (%)', 'Valor': Number(tasaReprobacion.toFixed(2)) },
                { 'Métrica': 'Total Factores Registrados', 'Valor': factoresData?.length || 0 }
            ]

            // Generar datos de gráficos
            const datosGraficos = generarDatosGraficoEstadisticas()

            // Crear archivo Excel con múltiples hojas
            const wb = XLSX.utils.book_new()

            // Hoja de estadísticas generales
            const wsGeneral = XLSX.utils.json_to_sheet(estadisticasGenerales)
            XLSX.utils.book_append_sheet(wb, wsGeneral, 'Estadísticas Generales')

            // Hoja de estadísticas por carrera
            const wsCarrera = XLSX.utils.json_to_sheet(estadisticasCarrera)
            XLSX.utils.book_append_sheet(wb, wsCarrera, 'Por Carrera')

            // Agregar hojas de gráficos
            const wsEvolucion = XLSX.utils.json_to_sheet(datosGraficos.evolucionPorPeriodo)
            XLSX.utils.book_append_sheet(wb, wsEvolucion, 'Evolución por Periodo')

            const wsDistribucion = XLSX.utils.json_to_sheet(datosGraficos.distribucionEstudiantes)
            XLSX.utils.book_append_sheet(wb, wsDistribucion, 'Distribución Estudiantes')

            // Generar nombre de archivo
            let nombreArchivo = 'Reporte_Estadisticas_Generales'
            nombreArchivo += `_${new Date().toISOString().split('T')[0]}.xlsx`

            // Descargar archivo
            XLSX.writeFile(wb, nombreArchivo)

            toast.success('Reporte de estadísticas generales generado exitosamente')

        } catch (error) {
            console.error('Error al generar reporte de estadísticas:', error)
            toast.error('Error al generar el reporte de estadísticas')
        } finally {
            setGenerating(null)
        }
    }

    const generarReporteAsistencia = async () => {
        try {
            setGenerating('asistencia')

            // Obtener datos de inscripciones con asistencia
            const { data: inscripcionesData, error } = await supabase
                .from('inscripcion')
                .select(`
                    *,
                    estudiante:estudiante(*, carrera:carrera(*)),
                    oferta:oferta(*, materia:materia(*), periodo:periodo(*), grupo:grupo(*))
                `)

            if (error) throw error

            // Preparar datos para Excel
            const datosReporte = inscripcionesData?.map(ins => ({
                'Número Control': ins.estudiante?.numero_control || '',
                'Nombre Completo': `${ins.estudiante?.nombres || ''} ${ins.estudiante?.ap_paterno || ''} ${ins.estudiante?.ap_materno || ''}`,
                'Carrera': ins.estudiante?.carrera?.nombre || '',
                'Materia': ins.oferta?.materia?.nombre || '',
                'Grupo': ins.oferta?.grupo?.clave || '',
                'Periodo': `${ins.oferta?.periodo?.anio || ''}-${ins.oferta?.periodo?.etiqueta || ''}`,
                'Asistencia (%)': ins.asistencia_pct || 0,
                'Calificación Final': ins.cal_final || 0,
                'Aprobado': ins.aprobado ? 'Sí' : 'No'
            })) || []

            // Generar datos de gráficos
            const datosGraficos = generarDatosGraficoAsistencia()

            // Crear archivo Excel
            const ws = XLSX.utils.json_to_sheet(datosReporte)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Asistencia')

            // Agregar hojas de gráficos
            const wsDistribucion = XLSX.utils.json_to_sheet(datosGraficos.distribucionAsistencia)
            XLSX.utils.book_append_sheet(wb, wsDistribucion, 'Distribución Asistencia')

            const wsCorrelacion = XLSX.utils.json_to_sheet(datosGraficos.asistenciaVsCalificacion)
            XLSX.utils.book_append_sheet(wb, wsCorrelacion, 'Asistencia vs Calificación')

            // Generar nombre de archivo
            const periodo = selectedPeriodo && selectedPeriodo !== 'all' ? periodos.find(p => p.id_periodo.toString() === selectedPeriodo) : null
            const carrera = selectedCarrera && selectedCarrera !== 'all' ? carreras.find(c => c.id_carrera.toString() === selectedCarrera) : null

            let nombreArchivo = 'Reporte_Asistencia'
            if (periodo) nombreArchivo += `_${periodo.anio}-${periodo.etiqueta}`
            if (carrera) nombreArchivo += `_${carrera.nombre.replace(/\s+/g, '_')}`
            nombreArchivo += `_${new Date().toISOString().split('T')[0]}.xlsx`

            // Descargar archivo
            XLSX.writeFile(wb, nombreArchivo)

            toast.success('Reporte de asistencia generado exitosamente')

        } catch (error) {
            console.error('Error al generar reporte de asistencia:', error)
            toast.error('Error al generar el reporte de asistencia')
        } finally {
            setGenerating(null)
        }
    }

    const handleGenerarReporte = (tipo: string) => {
        setReporteType(tipo)
        setShowDialog(true)
    }

    const confirmarGeneracion = async () => {
        try {
            switch (reporteType) {
                case 'academico':
                    await generarReporteAcademico()
                    break
                case 'factores':
                    await generarReporteFactores()
                    break
                case 'estadisticas':
                    await generarReporteEstadisticas()
                    break
                case 'asistencia':
                    await generarReporteAsistencia()
                    break
            }
        } finally {
            setShowDialog(false)
        }
    }

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
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleGenerarReporte('academico')}
                                disabled={generating === 'academico'}
                            >
                                {generating === 'academico' ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                )}
                                {generating === 'academico' ? 'Generando...' : 'Generar'}
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
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleGenerarReporte('factores')}
                                disabled={generating === 'factores'}
                            >
                                {generating === 'factores' ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                )}
                                {generating === 'factores' ? 'Generando...' : 'Generar'}
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
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleGenerarReporte('estadisticas')}
                                disabled={generating === 'estadisticas'}
                            >
                                {generating === 'estadisticas' ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                )}
                                {generating === 'estadisticas' ? 'Generando...' : 'Generar'}
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
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleGenerarReporte('asistencia')}
                                disabled={generating === 'asistencia'}
                            >
                                {generating === 'asistencia' ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                )}
                                {generating === 'asistencia' ? 'Generando...' : 'Generar'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Vista previa de gráficos con datos reales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Análisis en Tiempo Real</CardTitle>
                        <CardDescription>
                            Visualización de datos actuales del sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Gráfico de distribución de calificaciones */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Distribución de Calificaciones</h4>
                                {(() => {
                                    const datos = generarDatosGraficoAcademico().distribucionCalificaciones;
                                    const total = datos.reduce((sum, item) => sum + (item.cantidad || 0), 0);
                                    return (
                                        <>
                                            <div id="descripcion-distribucion-calificaciones" className="sr-only">
                                                Gráfico de barras mostrando la distribución de calificaciones.
                                                Total de registros: {total}.
                                                {datos.map((item) =>
                                                    ` Rango ${item.rango}: ${item.cantidad} estudiantes.`
                                                ).join('')}
                                            </div>
                                            <ChartContainer
                                                config={{
                                                    calificaciones: {
                                                        label: "Calificaciones",
                                                    },
                                                    cantidad: {
                                                        label: "Cantidad",
                                                    },
                                                }}
                                                className="h-[200px] w-full"
                                                role="img"
                                                aria-label="Gráfico de distribución de calificaciones"
                                                aria-describedby="descripcion-distribucion-calificaciones"
                                            >
                                                <RechartsBarChart
                                                    accessibilityLayer
                                                    data={datos}
                                                >
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                        dataKey="rango"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={false}
                                                        tickFormatter={(value) => value}
                                                    />
                                                    <YAxis
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickMargin={8}
                                                        tickFormatter={(value) => `${value}`}
                                                    />
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent hideLabel />}
                                                    />
                                                    <Bar dataKey="cantidad" fill={COLORS.primary} radius={4} />
                                                </RechartsBarChart>
                                            </ChartContainer>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Gráfico de aprobación por carrera */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Tasa de Aprobación por Carrera</h4>
                                {(() => {
                                    const datos = generarDatosGraficoAcademico().aprobacionPorCarrera;
                                    const mejorCarrera = datos.length > 0
                                        ? datos.reduce((max, item) => (item.tasaAprobacion || 0) > (max.tasaAprobacion || 0) ? item : max, datos[0])
                                        : null;
                                    return (
                                        <>
                                            <div id="descripcion-aprobacion-carrera-reportes" className="sr-only">
                                                Gráfico de barras mostrando la tasa de aprobación por carrera.
                                                {datos.map((item) =>
                                                    ` ${item.carrera}: ${item.tasaAprobacion}% de aprobación.`
                                                ).join('')}
                                                {mejorCarrera
                                                    ? ` La carrera con mayor tasa de aprobación es ${mejorCarrera.carrera} con ${mejorCarrera.tasaAprobacion}%.`
                                                    : ''}
                                            </div>
                                            <ChartContainer
                                                config={{
                                                    carrera: {
                                                        label: "Carrera",
                                                    },
                                                    tasaAprobacion: {
                                                        label: "Tasa de Aprobación (%)",
                                                    },
                                                }}
                                                className="h-[200px] w-full"
                                                role="img"
                                                aria-label="Gráfico de tasa de aprobación por carrera"
                                                aria-describedby="descripcion-aprobacion-carrera-reportes"
                                            >
                                                <RechartsBarChart
                                                    accessibilityLayer
                                                    data={datos}
                                                >
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                        dataKey="carrera"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={false}
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                    />
                                                    <YAxis
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickMargin={8}
                                                        tickFormatter={(value) => `${value}%`}
                                                    />
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent hideLabel />}
                                                    />
                                                    <Bar dataKey="tasaAprobacion" fill={COLORS.success} radius={4} />
                                                </RechartsBarChart>
                                            </ChartContainer>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Gráfico circular de distribución de estudiantes */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Distribución de Estudiantes por Carrera</h4>
                                {(() => {
                                    const datos = generarDatosGraficoEstadisticas().distribucionEstudiantes;
                                    const total = datos.reduce((sum, item) => sum + (item.estudiantes || 0), 0);
                                    return (
                                        <>
                                            <div id="descripcion-distribucion-estudiantes-reportes" className="sr-only">
                                                Gráfico circular mostrando la distribución de estudiantes por carrera.
                                                Total de estudiantes: {total}.
                                                {datos.map((item, idx) => {
                                                    const porcentaje = total > 0 ? ((item.estudiantes / total) * 100).toFixed(1) : '0';
                                                    return ` ${item.carrera}: ${item.estudiantes} estudiantes (${porcentaje}% del total).`;
                                                }).join('')}
                                            </div>
                                            <ChartContainer
                                                config={{
                                                    carrera: {
                                                        label: "Carrera",
                                                    },
                                                    estudiantes: {
                                                        label: "Estudiantes",
                                                    },
                                                }}
                                                className="h-[200px] w-full"
                                                role="img"
                                                aria-label="Gráfico circular de distribución de estudiantes por carrera"
                                                aria-describedby="descripcion-distribucion-estudiantes-reportes"
                                            >
                                                <RechartsPieChart>
                                                    <Pie
                                                        data={datos}
                                                        dataKey="estudiantes"
                                                        nameKey="carrera"
                                                        innerRadius={60}
                                                        strokeWidth={5}
                                                    >
                                                        {datos.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <ChartTooltip
                                                        content={<ChartTooltipContent hideLabel />}
                                                    />
                                                </RechartsPieChart>
                                            </ChartContainer>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Gráfico de evolución temporal */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Evolución de Aprobación por Periodo</h4>
                                {(() => {
                                    const datos = generarDatosGraficoEstadisticas().evolucionPorPeriodo;
                                    const tendencia = datos.length > 1
                                        ? (datos[datos.length - 1].tasaAprobacion || 0) > (datos[0].tasaAprobacion || 0)
                                            ? 'tendencia al alza'
                                            : (datos[datos.length - 1].tasaAprobacion || 0) < (datos[0].tasaAprobacion || 0)
                                                ? 'tendencia a la baja'
                                                : 'tendencia estable'
                                        : '';
                                    return (
                                        <>
                                            <div id="descripcion-evolucion-periodo" className="sr-only">
                                                Gráfico de línea mostrando la evolución de la tasa de aprobación por período.
                                                {datos.map((item) =>
                                                    ` Período ${item.periodo}: ${item.tasaAprobacion}% de aprobación.`
                                                ).join('')}
                                                {tendencia && ` La tendencia general muestra una ${tendencia}.`}
                                            </div>
                                            <ChartContainer
                                                config={{
                                                    periodo: {
                                                        label: "Periodo",
                                                    },
                                                    tasaAprobacion: {
                                                        label: "Tasa de Aprobación (%)",
                                                    },
                                                }}
                                                className="h-[200px] w-full"
                                                role="img"
                                                aria-label="Gráfico de evolución de aprobación por período"
                                                aria-describedby="descripcion-evolucion-periodo"
                                            >
                                                <LineChart
                                                    accessibilityLayer
                                                    data={datos}
                                                >
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                        dataKey="periodo"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={false}
                                                    />
                                                    <YAxis
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickMargin={8}
                                                        tickFormatter={(value) => `${value}%`}
                                                    />
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent hideLabel />}
                                                    />
                                                    <Line
                                                        dataKey="tasaAprobacion"
                                                        type="monotone"
                                                        stroke={COLORS.primary}
                                                        strokeWidth={2}
                                                        dot={{
                                                            fill: COLORS.primary,
                                                        }}
                                                    />
                                                </LineChart>
                                            </ChartContainer>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

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

                {/* Diálogo de configuración de reporte */}
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Configurar Reporte</DialogTitle>
                            <DialogDescription>
                                Selecciona los parámetros para generar el reporte
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="periodo">Periodo</Label>
                                <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un periodo (opcional)" />
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
                                <Label htmlFor="carrera">Carrera</Label>
                                <Select value={selectedCarrera} onValueChange={setSelectedCarrera}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una carrera (opcional)" />
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
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowDialog(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={confirmarGeneracion}>
                                    Generar Reporte
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    )
}
