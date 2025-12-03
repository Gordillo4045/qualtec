'use client'
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Field } from "@/components/ui/field"
import { FieldHelp } from "@/components/ui/field-help"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Search,
    Plus,
    Download,
    MoreHorizontal,
    Edit,
    Trash2,
    BookOpen,
    CheckCircle,
    AlertTriangle,
    Clock,
    Save,
    X,
    User2,
    ClipboardList,
    Target,
    FileText,
    Upload,
    FileSpreadsheet
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { useDropzone } from 'react-dropzone'
import { useAudit } from "@/hooks/use-audit"

export default function InscripcionesPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingInscripcion, setEditingInscripcion] = useState<any>(null)
    const { logOperation, isAuthenticated, user } = useAudit()
    const [formData, setFormData] = useState({
        id_estudiante: '',
        id_oferta: '',
        cal_final: '',
        asistencia_pct: '',
        intentos: '1'
    })

    // Estados para manejar unidades en el sheet
    const [unidadesData, setUnidadesData] = useState<{
        [key: number]: {
            calificacion: string,
            asistio: boolean | null
        }
    }>({})

    const [inscripciones, setInscripciones] = useState<any[]>([])
    const [filteredInscripciones, setFilteredInscripciones] = useState<any[]>([])
    const [estudiantes, setEstudiantes] = useState<any[]>([])
    const [ofertas, setOfertas] = useState<any[]>([])
    const [filteredOfertas, setFilteredOfertas] = useState<any[]>([])
    const [materiaUnidades, setMateriaUnidades] = useState<any[]>([])
    const [estudianteUnidades, setEstudianteUnidades] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedEstudiante, setSelectedEstudiante] = useState('')
    const [selectedOferta, setSelectedOferta] = useState('')

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [showUploadModal, setShowUploadModal] = useState(false)

    // Estados para modal de errores
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorDetails, setErrorDetails] = useState<{
        title: string
        message: string
        details: string[]
        type: 'validation' | 'database' | 'excel' | 'general'
    } | null>(null)

    const supabase = createClient()

    // Función para mostrar errores en modal
    const showError = (title: string, message: string, details: string[], type: 'validation' | 'database' | 'excel' | 'general' = 'general') => {
        setErrorDetails({
            title,
            message,
            details,
            type
        })
        setShowErrorModal(true)
    }

    useEffect(() => {
        fetchInscripciones()
        fetchEstudiantes()
        fetchOfertas()
    }, [])

    useEffect(() => {
        filterInscripciones()
    }, [inscripciones, searchTerm, selectedEstudiante, selectedOferta])

    useEffect(() => {
        filterOfertasByCarrera()
    }, [formData.id_estudiante, ofertas, estudiantes])

    useEffect(() => {
        if (formData.id_oferta) {
            const ofertaSeleccionada = ofertas.find(o => o.id_oferta.toString() === formData.id_oferta)
            if (ofertaSeleccionada?.materia?.id_materia) {
                fetchMateriaUnidades(ofertaSeleccionada.materia.id_materia)
            }
        }
    }, [formData.id_oferta, ofertas])

    // Cargar unidades existentes cuando se edita
    useEffect(() => {
        if (isEditing && editingInscripcion && estudianteUnidades.length > 0) {
            const unidadesExistentes: {
                [key: number]: {
                    calificacion: string,
                    asistio: boolean | null
                }
            } = {}

            estudianteUnidades.forEach(eu => {
                unidadesExistentes[eu.id_materia_unidad] = {
                    calificacion: eu.calificacion?.toString() || '',
                    asistio: eu.asistio
                }
            })

            setUnidadesData(unidadesExistentes)
        }
    }, [isEditing, editingInscripcion, estudianteUnidades])

    // Cargar unidades existentes cuando se cargan las unidades del estudiante
    useEffect(() => {
        if (isEditing && estudianteUnidades.length > 0) {
            const unidadesExistentes: {
                [key: number]: {
                    calificacion: string,
                    asistio: boolean | null
                }
            } = {}

            estudianteUnidades.forEach(eu => {
                unidadesExistentes[eu.id_materia_unidad] = {
                    calificacion: eu.calificacion?.toString() || '',
                    asistio: eu.asistio
                }
            })

            setUnidadesData(unidadesExistentes)
        }
    }, [estudianteUnidades, isEditing])

    const filterInscripciones = () => {
        let filtered = inscripciones

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(inscripcion =>
                inscripcion.estudiante?.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inscripcion.estudiante?.ap_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inscripcion.estudiante?.ap_materno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inscripcion.estudiante?.numero_control.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inscripcion.oferta?.materia?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filtrar por estudiante
        if (selectedEstudiante) {
            filtered = filtered.filter(inscripcion =>
                inscripcion.id_estudiante === selectedEstudiante
            )
        }

        // Filtrar por oferta
        if (selectedOferta) {
            filtered = filtered.filter(inscripcion =>
                inscripcion.id_oferta.toString() === selectedOferta
            )
        }

        setFilteredInscripciones(filtered)
        setCurrentPage(1) // Reset a la primera página cuando se filtran datos
    }

    const filterOfertasByCarrera = () => {
        if (!formData.id_estudiante) {
            setFilteredOfertas([])
            return
        }

        const estudianteSeleccionado = estudiantes.find(e => e.id_estudiante === formData.id_estudiante)
        if (!estudianteSeleccionado) {
            setFilteredOfertas([])
            return
        }

        const ofertasFiltradas = ofertas.filter(oferta =>
            oferta.grupo?.id_carrera === estudianteSeleccionado.id_carrera
        )

        setFilteredOfertas(ofertasFiltradas)
    }

    // Funciones de paginación
    const totalPages = Math.ceil(filteredInscripciones.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentInscripciones = filteredInscripciones.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Función para generar páginas truncadas
    const generatePageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            // Si hay 5 páginas o menos, mostrar todas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Lógica para paginación truncada
            if (currentPage <= 3) {
                // Mostrar páginas 1-5 y luego ...
                for (let i = 1; i <= 5; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                // Mostrar 1, ..., y las últimas 5 páginas
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                // Mostrar 1, ..., páginas alrededor de la actual, ..., última
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            }
        }

        return pages
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar campos requeridos
        if (!formData.id_estudiante || !formData.id_oferta) {
            showError(
                'Campos Requeridos',
                'Debes seleccionar tanto un estudiante como una oferta para continuar.',
                [
                    '• Selecciona un estudiante de la lista',
                    '• Selecciona una oferta disponible',
                    '• Verifica que ambos campos estén completos'
                ],
                'validation'
            )
            return
        }

        // Validar estado de edición
        if (isEditing && !editingInscripcion?.id_inscripcion) {
            toast.error('Error: No se encontró la inscripción a editar')
            return
        }

        // Validar calificación
        const calificacion = parseFloat(formData.cal_final)
        if (formData.cal_final && (calificacion < 0 || calificacion > 100)) {
            showError(
                'Calificación Inválida',
                'La calificación debe estar dentro del rango válido.',
                [
                    '• La calificación debe ser un número entre 0 y 100',
                    '• Valores válidos: 0, 1, 2, ..., 99, 100',
                    '• Deja el campo vacío si no tienes la calificación'
                ],
                'validation'
            )
            return
        }

        // Validar asistencia
        const asistencia = parseFloat(formData.asistencia_pct)
        if (formData.asistencia_pct && (asistencia < 0 || asistencia > 100)) {
            showError(
                'Asistencia Inválida',
                'El porcentaje de asistencia debe estar dentro del rango válido.',
                [
                    '• La asistencia debe ser un número entre 0 y 100',
                    '• Valores válidos: 0%, 1%, 2%, ..., 99%, 100%',
                    '• Deja el campo vacío si no tienes el dato de asistencia'
                ],
                'validation'
            )
            return
        }

        // Validar intentos (debe ser un número entero positivo)
        const intentosNum = parseInt(formData.intentos)
        if (!formData.intentos || isNaN(intentosNum) || intentosNum < 1) {
            showError(
                'Intentos Inválidos',
                'El número de intentos debe ser un número entero positivo.',
                [
                    '• Los intentos deben ser un número mayor a 0',
                    '• Valores válidos: 1, 2, 3, ...',
                    '• Este campo es requerido'
                ],
                'validation'
            )
            return
        }

        try {
            let inscripcionId: number

            if (isEditing && editingInscripcion?.id_inscripcion) {
                console.log('Actualizando inscripción existente:', editingInscripcion.id_inscripcion)
                // Actualizar inscripción existente
                const { error } = await supabase
                    .from('inscripcion')
                    .update({
                        id_estudiante: formData.id_estudiante,
                        id_oferta: parseInt(formData.id_oferta),
                        intentos: parseInt(formData.intentos)
                    })
                    .eq('id_inscripcion', editingInscripcion.id_inscripcion)

                if (error) {
                    console.error('Error al actualizar inscripción:', error)
                    throw error
                }
                inscripcionId = editingInscripcion.id_inscripcion
            } else {
                console.log('Creando nueva inscripción')

                // Verificar si ya existe una inscripción para este estudiante y oferta
                const { data: existingInscripcion, error: checkError } = await supabase
                    .from('inscripcion')
                    .select('id_inscripcion')
                    .eq('id_estudiante', formData.id_estudiante)
                    .eq('id_oferta', parseInt(formData.id_oferta))
                    .single()

                if (checkError && checkError.code !== 'PGRST116') {
                    console.error('Error al verificar inscripción existente:', checkError)
                    throw checkError
                }

                if (existingInscripcion) {
                    showError(
                        'Inscripción Duplicada',
                        'Ya existe una inscripción para este estudiante en la oferta seleccionada.',
                        [
                            '• El estudiante ya está inscrito en esta materia',
                            '• Verifica que no hayas seleccionado la misma oferta',
                            '• Si necesitas cambiar datos, usa la opción "Editar"'
                        ],
                        'validation'
                    )
                    return
                }

                // Crear nueva inscripción
                const { data, error } = await supabase
                    .from('inscripcion')
                    .insert({
                        id_estudiante: formData.id_estudiante,
                        id_oferta: parseInt(formData.id_oferta),
                        intentos: parseInt(formData.intentos)
                    })
                    .select('id_inscripcion')
                    .single()

                if (error) {
                    console.error('Error al crear inscripción:', error)
                    throw error
                }
                inscripcionId = data.id_inscripcion
            }

            // Guardar unidades si hay datos
            if (Object.keys(unidadesData).length > 0) {
                const unidadesToProcess = Object.entries(unidadesData).filter(([_, data]) =>
                    data.calificacion !== '' || data.asistio !== null
                )

                if (unidadesToProcess.length > 0) {
                    if (isEditing) {
                        // Eliminar unidades existentes y crear nuevas
                        await supabase
                            .from('estudiante_unidad')
                            .delete()
                            .eq('id_inscripcion', inscripcionId)
                    }

                    const unidadesToInsert = unidadesToProcess.map(([idMateriaUnidad, data]) => ({
                        id_inscripcion: inscripcionId,
                        id_materia_unidad: parseInt(idMateriaUnidad),
                        calificacion: data.calificacion ? parseFloat(data.calificacion) : null,
                        asistio: data.asistio
                    }))

                    const { error: unidadesError } = await supabase
                        .from('estudiante_unidad')
                        .insert(unidadesToInsert)

                    if (unidadesError) throw unidadesError
                }
            }

            // Recargar datos
            await fetchInscripciones()

            // Limpiar formulario y cerrar sheet
            setFormData({
                id_estudiante: '',
                id_oferta: '',
                cal_final: '',
                asistencia_pct: '',
                intentos: '1'
            })
            setUnidadesData({})
            setIsSheetOpen(false)
            setIsEditing(false)
            setEditingInscripcion(null)

            // Mostrar notificación de éxito
            toast.success(isEditing ? 'Inscripción actualizada exitosamente' : 'Inscripción creada exitosamente')

            // Registrar en auditoría con usuario autenticado (más específico que el trigger)
            if (isAuthenticated && user) {
                await logOperation(
                    'inscripcion',
                    isEditing ? 'UPDATE' : 'INSERT',
                    inscripcionId.toString(),
                    isEditing ? editingInscripcion : null,
                    formData,
                    `${isEditing ? 'Actualización' : 'Creación'} de inscripción por ${user.email} - Operación manual`
                )
            }

        } catch (error) {
            console.error('Error al guardar inscripción:', error)
            showError(
                'Error al Guardar',
                'No se pudo guardar la inscripción. Revisa los detalles del error.',
                [
                    '• Verifica tu conexión a internet',
                    '• Asegúrate de que todos los datos sean válidos',
                    '• Intenta nuevamente en unos momentos',
                    '• Si el problema persiste, contacta al administrador'
                ],
                'database'
            )
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
                .order('id_inscripcion', { ascending: false })

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
                .select('*')
                .order('numero_control', { ascending: true })

            if (error) throw error
            setEstudiantes(data || [])
        } catch (error) {
            console.error('Error al cargar estudiantes:', error)
        }
    }

    const fetchOfertas = async () => {
        try {
            const { data, error } = await supabase
                .from('oferta')
                .select(`
                    *,
                    materia:materia(*),
                    periodo:periodo(*),
                    grupo:grupo(*)
                `)
                .order('id_oferta', { ascending: false })

            if (error) throw error
            setOfertas(data || [])
        } catch (error) {
            console.error('Error al cargar ofertas:', error)
        }
    }

    const fetchMateriaUnidades = async (idMateria: number) => {
        try {
            const { data, error } = await supabase
                .from('materia_unidad')
                .select('*')
                .eq('id_materia', idMateria)
                .order('numero_unidad', { ascending: true })

            if (error) throw error
            setMateriaUnidades(data || [])
        } catch (error) {
            console.error('Error al cargar unidades de materia:', error)
        }
    }

    const fetchEstudianteUnidades = async (idInscripcion: number) => {
        try {
            const { data, error } = await supabase
                .from('estudiante_unidad')
                .select(`
                    *,
                    materia_unidad:materia_unidad(*)
                `)
                .eq('id_inscripcion', idInscripcion)

            if (error) {
                console.error('Error en la consulta:', error)
                throw error
            }

            setEstudianteUnidades(data || [])
        } catch (error) {
            console.error('Error al cargar unidades del estudiante:', error)
        }
    }

    const handleGuardarUnidad = async (idInscripcion: number, idMateriaUnidad: number, calificacion: number, asistio: boolean) => {
        try {
            const { error } = await supabase
                .from('estudiante_unidad')
                .insert({
                    id_inscripcion: idInscripcion,
                    id_materia_unidad: idMateriaUnidad,
                    calificacion: calificacion,
                    asistio: asistio
                })

            if (error) throw error

            // Recargar datos
            await fetchEstudianteUnidades(idInscripcion)
            await fetchInscripciones()
            toast.success('Calificación y asistencia guardadas exitosamente')
        } catch (error) {
            console.error('Error al guardar unidad:', error)
            toast.error('Error al guardar la unidad. Inténtalo de nuevo.')
        }
    }

    const handleUnidadChange = (idMateriaUnidad: number, field: string, value: any) => {
        setUnidadesData(prev => ({
            ...prev,
            [idMateriaUnidad]: {
                calificacion: prev[idMateriaUnidad]?.calificacion || '',
                asistio: prev[idMateriaUnidad]?.asistio ?? null,
                [field]: value
            }
        }))
    }

    const handleEdit = async (inscripcion: any) => {
        setEditingInscripcion(inscripcion)
        setFormData({
            id_estudiante: inscripcion.id_estudiante,
            id_oferta: inscripcion.id_oferta.toString(),
            cal_final: inscripcion.cal_final?.toString() || '',
            asistencia_pct: inscripcion.asistencia_pct?.toString() || '',
            intentos: inscripcion.intentos?.toString() || '1'
        })

        // Limpiar datos previos
        setUnidadesData({})
        setMateriaUnidades([])
        setEstudianteUnidades([])

        // Cargar unidades de la materia
        if (inscripcion.oferta?.materia?.id_materia) {
            await fetchMateriaUnidades(inscripcion.oferta.materia.id_materia)
            await fetchEstudianteUnidades(inscripcion.id_inscripcion)
        }

        setIsEditing(true)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta inscripción?')) {
            try {
                const { error } = await supabase
                    .from('inscripcion')
                    .delete()
                    .eq('id_inscripcion', id)

                if (error) throw error
                await fetchInscripciones()
                toast.success('Inscripción eliminada exitosamente')

                // Registrar en auditoría con usuario autenticado (más específico que el trigger)
                if (isAuthenticated && user) {
                    await logOperation(
                        'inscripcion',
                        'DELETE',
                        id.toString(),
                        null,
                        null,
                        `Eliminación de inscripción por ${user.email} - Operación manual`
                    )
                }
            } catch (error) {
                console.error('Error al eliminar inscripción:', error)
                toast.error('Error al eliminar la inscripción. Inténtalo de nuevo.')
            }
        }
    }

    const getAprobadoBadge = (aprobado: boolean) => {
        if (aprobado) {
            return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aprobado</Badge>
        } else {
            return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Reprobado</Badge>
        }
    }

    const getCalificacionColor = (calificacion: number) => {
        if (calificacion >= 90) return 'text-green-600'
        if (calificacion >= 80) return 'text-blue-600'
        if (calificacion >= 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    // Funciones para carga de Excel
    const downloadTemplate = () => {
        const templateData = [
            {
                'numero_control': '21212372',
                'materia_clave': 'SC8B',
                'periodo_etiqueta': 'Ago - Dic 2025',
                'grupo_clave': 'INF8B',
                'calificacion_unidad_1': 85,
                'asistencia_unidad_1': 'Si',
                'calificacion_unidad_2': 90,
                'asistencia_unidad_2': 'Si',
                'calificacion_unidad_3': 78,
                'asistencia_unidad_3': 'No',
                'calificacion_unidad_4': 92,
                'asistencia_unidad_4': 'Si',
                'calificacion_unidad_5': 88,
                'asistencia_unidad_5': 'Si'
            },
            {
                'numero_control': '22551001',
                'materia_clave': 'ISW-303',
                'periodo_etiqueta': 'Ago - Dic 2025',
                'grupo_clave': 'SC9',
                'calificacion_unidad_1': 92,
                'asistencia_unidad_1': 'Si',
                'calificacion_unidad_2': 88,
                'asistencia_unidad_2': 'Si',
                'calificacion_unidad_3': 95,
                'asistencia_unidad_3': 'Si',
                'calificacion_unidad_4': 87,
                'asistencia_unidad_4': 'Si',
                'calificacion_unidad_5': 91,
                'asistencia_unidad_5': 'Si'
            },
            {
                'numero_control': '22551002',
                'materia_clave': 'ISW-304',
                'periodo_etiqueta': 'Ago - Dic 2025',
                'grupo_clave': 'SC10',
                'calificacion_unidad_1': 76,
                'asistencia_unidad_1': 'Si',
                'calificacion_unidad_2': 82,
                'asistencia_unidad_2': 'No',
                'calificacion_unidad_3': 79,
                'asistencia_unidad_3': 'Si',
                'calificacion_unidad_4': 85,
                'asistencia_unidad_4': 'Si',
                'calificacion_unidad_5': 88,
                'asistencia_unidad_5': 'Si'
            },
            {
                'numero_control': '22551003',
                'materia_clave': 'ISW-305',
                'periodo_etiqueta': 'Ago - Dic 2025',
                'grupo_clave': 'TIC8',
                'calificacion_unidad_1': 94,
                'asistencia_unidad_1': 'Si',
                'calificacion_unidad_2': 89,
                'asistencia_unidad_2': 'Si',
                'calificacion_unidad_3': 96,
                'asistencia_unidad_3': 'Si',
                'calificacion_unidad_4': 92,
                'asistencia_unidad_4': 'Si',
                'calificacion_unidad_5': 90,
                'asistencia_unidad_5': 'Si'
            },
            {
                'numero_control': '22551004',
                'materia_clave': 'IND-201',
                'periodo_etiqueta': 'Ago - Dic 2025',
                'grupo_clave': 'IND7',
                'calificacion_unidad_1': 73,
                'asistencia_unidad_1': 'Si',
                'calificacion_unidad_2': 68,
                'asistencia_unidad_2': 'No',
                'calificacion_unidad_3': 75,
                'asistencia_unidad_3': 'Si',
                'calificacion_unidad_4': 71,
                'asistencia_unidad_4': 'Si',
                'calificacion_unidad_5': 78,
                'asistencia_unidad_5': 'Si'
            }
        ]

        const ws = XLSX.utils.json_to_sheet(templateData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Inscripciones')
        XLSX.writeFile(wb, 'plantilla_inscripciones.xlsx')
        toast.success('Plantilla descargada exitosamente')
    }

    const processExcelFile = async (file: File) => {
        setIsUploading(true)
        setUploadProgress(0)

        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            if (jsonData.length === 0) {
                throw new Error('El archivo Excel está vacío')
            }

            let successCount = 0
            let errorCount = 0
            const errors: string[] = []

            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i] as any
                setUploadProgress(((i + 1) / jsonData.length) * 100)

                try {
                    await processInscripcionRow(row, i + 1)
                    successCount++
                } catch (error) {
                    errorCount++
                    errors.push(`Fila ${i + 1}: ${error}`)
                }
            }

            await fetchInscripciones()

            if (successCount > 0) {
                toast.success(`${successCount} inscripciones procesadas exitosamente`)
            }

            if (errorCount > 0) {
                showError(
                    'Errores en Carga de Excel',
                    `Se encontraron ${errorCount} errores al procesar el archivo Excel.`,
                    [
                        '• Revisa el formato del archivo Excel',
                        '• Verifica que los números de control existan',
                        '• Asegúrate de que las claves de materia sean correctas',
                        '• Comprueba que los grupos y períodos sean válidos',
                        '• Revisa la consola del navegador para más detalles'
                    ],
                    'excel'
                )
                console.error('Errores de carga:', errors)
            }

        } catch (error) {
            console.error('Error al procesar archivo Excel:', error)
            toast.error('Error al procesar el archivo Excel')
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
            setShowUploadModal(false)
        }
    }

    const processInscripcionRow = async (row: any, rowNumber: number) => {
        // Validar campos requeridos
        if (!row.numero_control || !row.materia_clave || !row.periodo_etiqueta || !row.grupo_clave) {
            throw new Error('Faltan campos requeridos: numero_control, materia_clave, periodo_etiqueta, grupo_clave')
        }

        // Buscar estudiante por número de control
        const estudiante = estudiantes.find(e => e.numero_control === row.numero_control.toString())
        if (!estudiante) {
            throw new Error(`Estudiante con número de control ${row.numero_control} no encontrado`)
        }

        // Buscar oferta por materia, periodo y grupo
        const oferta = ofertas.find(o =>
            o.materia?.clave === row.materia_clave.toString() &&
            o.periodo?.etiqueta === row.periodo_etiqueta.toString() &&
            o.grupo?.clave === row.grupo_clave.toString()
        )

        if (!oferta) {
            throw new Error(`Oferta no encontrada para materia ${row.materia_clave}, periodo ${row.periodo_etiqueta}, grupo ${row.grupo_clave}`)
        }

        // Verificar si ya existe la inscripción
        const inscripcionExistente = inscripciones.find(ins =>
            ins.id_estudiante === estudiante.id_estudiante &&
            ins.id_oferta === oferta.id_oferta
        )

        if (inscripcionExistente) {
            throw new Error('Ya existe una inscripción para este estudiante en esta oferta')
        }

        // Crear inscripción
        const { data: nuevaInscripcion, error: inscripcionError } = await supabase
            .from('inscripcion')
            .insert({
                id_estudiante: estudiante.id_estudiante,
                id_oferta: oferta.id_oferta,
                // Dejar que Postgres calcule valores o queden null
                cal_final: null,
                asistencia_pct: null,
                // NO incluir "aprobado" para respetar DEFAULT o columna generada
                intentos: 1
            })
            .select()
            .single()

        if (inscripcionError) {
            throw new Error(`Error al crear inscripción: ${inscripcionError.message}`)
        }

        // Procesar calificaciones por unidad
        await processUnidadesFromExcel(nuevaInscripcion.id_inscripcion, oferta.materia.id_materia, row)
    }

    const processUnidadesFromExcel = async (idInscripcion: number, idMateria: number, row: any) => {
        // Obtener unidades de la materia
        const { data: unidades, error: unidadesError } = await supabase
            .from('materia_unidad')
            .select('*')
            .eq('id_materia', idMateria)
            .order('numero_unidad', { ascending: true })

        if (unidadesError) {
            throw new Error(`Error al obtener unidades: ${unidadesError.message}`)
        }

        // Procesar cada unidad
        for (const unidad of unidades) {
            const calificacionKey = `calificacion_unidad_${unidad.numero_unidad}`
            const asistenciaKey = `asistencia_unidad_${unidad.numero_unidad}`

            const calificacion = row[calificacionKey]
            const asistencia = row[asistenciaKey]

            if (calificacion !== undefined && calificacion !== null && calificacion !== '') {
                const calificacionNum = parseFloat(calificacion.toString())
                if (isNaN(calificacionNum) || calificacionNum < 0 || calificacionNum > 100) {
                    throw new Error(`Calificación inválida en unidad ${unidad.numero_unidad}: ${calificacion}`)
                }

                const asistio = asistencia ?
                    (asistencia.toString().toLowerCase() === 'si' || asistencia.toString().toLowerCase() === 'true' || asistencia.toString() === '1') :
                    true

                const { error: unidadError } = await supabase
                    .from('estudiante_unidad')
                    .insert({
                        id_inscripcion: idInscripcion,
                        id_materia_unidad: unidad.id_materia_unidad,
                        calificacion: calificacionNum,
                        asistio: asistio
                    })

                if (unidadError) {
                    throw new Error(`Error al guardar unidad ${unidad.numero_unidad}: ${unidadError.message}`)
                }
            }
        }
    }

    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            processExcelFile(file)
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        multiple: false
    })

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Inscripciones</h1>
                        <p className="text-muted-foreground">
                            Administra las inscripciones de estudiantes a materias
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={downloadTemplate}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Plantilla Excel
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowUploadModal(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Cargar Excel
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" onClick={() => {
                                    setIsEditing(false)
                                    setEditingInscripcion(null)
                                    setFormData({
                                        id_estudiante: '',
                                        id_oferta: '',
                                        cal_final: '',
                                        asistencia_pct: '',
                                        intentos: '1'
                                    })
                                    setUnidadesData({})
                                    setMateriaUnidades([])
                                    setEstudianteUnidades([])
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Inscripción
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="p-4 min-w-[600px] max-w-[1200px] overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>
                                        {isEditing ? 'Editar Inscripción' : 'Nueva Inscripción'}
                                    </SheetTitle>
                                    <SheetDescription>
                                        {isEditing ? 'Modifica los datos de la inscripción' : 'Agrega una nueva inscripción al sistema'}
                                    </SheetDescription>
                                </SheetHeader>
                                <form onSubmit={handleSubmit} className="mt-6 pr-2 space-y-6" aria-label={isEditing ? 'Formulario para editar inscripción' : 'Formulario para crear nueva inscripción'}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="id_estudiante" required>Estudiante</Label>
                                                <FieldHelp
                                                    description="Estudiante que se inscribirá a la materia. Selecciona de la lista de estudiantes activos."
                                                    id="help-estudiante-inscripcion"
                                                />
                                            </div>
                                            <Select
                                                value={formData.id_estudiante}
                                                onValueChange={(value) => setFormData({ ...formData, id_estudiante: value })}
                                            >
                                                <SelectTrigger
                                                    id="id_estudiante"
                                                    aria-label="Estudiante a inscribir"
                                                    aria-describedby="help-estudiante-inscripcion"
                                                    aria-required="true"
                                                >
                                                    <SelectValue placeholder="Seleccionar estudiante" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {estudiantes.map((estudiante) => (
                                                        <SelectItem key={estudiante.id_estudiante} value={estudiante.id_estudiante}>
                                                            {estudiante.numero_control} - {estudiante.nombres} {estudiante.ap_paterno} {estudiante.ap_materno}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="id_oferta" required>Oferta</Label>
                                                <FieldHelp
                                                    description="Oferta académica que incluye materia, período y grupo. Solo disponible después de seleccionar un estudiante."
                                                    id="help-oferta-inscripcion"
                                                />
                                            </div>
                                            <Select
                                                value={formData.id_oferta}
                                                onValueChange={(value) => setFormData({ ...formData, id_oferta: value })}
                                                disabled={!formData.id_estudiante}
                                            >
                                                <SelectTrigger
                                                    id="id_oferta"
                                                    aria-label="Oferta académica"
                                                    aria-describedby="help-oferta-inscripcion"
                                                    aria-required="true"
                                                    aria-disabled={!formData.id_estudiante}
                                                >
                                                    <SelectValue placeholder={!formData.id_estudiante ? "Primero selecciona un estudiante" : "Seleccionar oferta"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filteredOfertas.map((oferta) => (
                                                        <SelectItem key={oferta.id_oferta} value={oferta.id_oferta.toString()}>
                                                            {oferta.materia?.nombre} - {oferta.periodo?.etiqueta} - {oferta.grupo?.clave}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="intentos">Intentos</Label>
                                                <FieldHelp
                                                    description="Número de veces que el estudiante ha cursado esta materia. Útil para identificar estudiantes que repiten materias."
                                                    id="help-intentos-inscripcion"
                                                />
                                            </div>
                                            <Input
                                                id="intentos"
                                                type="number"
                                                aria-label="Número de intentos"
                                                aria-describedby="help-intentos-inscripcion"
                                                min="1"
                                                value={formData.intentos}
                                                onChange={(e) => setFormData({ ...formData, intentos: e.target.value })}
                                                placeholder="1"
                                            />
                                        </Field>

                                    </div>

                                    {/* Sección de Unidades */}
                                    {materiaUnidades.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="border-t pt-4">
                                                <h3 className="text-lg font-medium mb-4 flex items-center">
                                                    <FileText className="h-5 w-5 mr-2" />
                                                    Calificaciones y Asistencias por Unidad
                                                    {isEditing && estudianteUnidades.length === 0 && (
                                                        <span className="ml-2 text-sm text-gray-500">(Cargando datos existentes...)</span>
                                                    )}
                                                </h3>
                                                <div
                                                    className="space-y-3 overflow-y-auto pr-2 unidades-scroll"
                                                >
                                                    {materiaUnidades.map((unidad) => {
                                                        const unidadData = {
                                                            calificacion: unidadesData[unidad.id_materia_unidad]?.calificacion || '',
                                                            asistio: unidadesData[unidad.id_materia_unidad]?.asistio ?? null
                                                        }

                                                        return (
                                                            <Card key={unidad.id_materia_unidad} className="border rounded-lg p-4">
                                                                <div className="flex justify-between items-center">
                                                                    <h4 className="font-medium">{unidad.nombre_unidad}</h4>
                                                                    <Badge variant="outline">Peso: {unidad.peso}%</Badge>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <Field>
                                                                        <div className="flex items-center gap-2">
                                                                            <Label htmlFor={`calificacion-${unidad.id_materia_unidad}`}>Calificación (0-100)</Label>
                                                                            <FieldHelp
                                                                                description={`Calificación obtenida en la unidad "${unidad.nombre_unidad}". Valor entre 0 y 100.`}
                                                                                id={`help-calificacion-${unidad.id_materia_unidad}`}
                                                                            />
                                                                        </div>
                                                                        <Input
                                                                            id={`calificacion-${unidad.id_materia_unidad}`}
                                                                            type="number"
                                                                            aria-label={`Calificación de ${unidad.nombre_unidad}`}
                                                                            aria-describedby={`help-calificacion-${unidad.id_materia_unidad}`}
                                                                            min="0"
                                                                            max="100"
                                                                            step="1"
                                                                            value={unidadData.calificacion}
                                                                            onChange={(e) => handleUnidadChange(unidad.id_materia_unidad, 'calificacion', e.target.value)}
                                                                            placeholder="100"
                                                                        />
                                                                    </Field>
                                                                    <Field>
                                                                        <div className="flex items-center gap-2">
                                                                            <Label htmlFor={`asistio-${unidad.id_materia_unidad}`}>Asistió</Label>
                                                                            <FieldHelp
                                                                                description={`Indica si el estudiante asistió a la unidad "${unidad.nombre_unidad}".`}
                                                                                id={`help-asistio-${unidad.id_materia_unidad}`}
                                                                            />
                                                                        </div>
                                                                        <Select
                                                                            value={unidadData.asistio === null || unidadData.asistio === undefined ? '' : String(unidadData.asistio)}
                                                                            onValueChange={(value) => handleUnidadChange(unidad.id_materia_unidad, 'asistio', value === 'true')}
                                                                        >
                                                                            <SelectTrigger
                                                                                id={`asistio-${unidad.id_materia_unidad}`}
                                                                                aria-label={`Asistencia a ${unidad.nombre_unidad}`}
                                                                                aria-describedby={`help-asistio-${unidad.id_materia_unidad}`}
                                                                            >
                                                                                <SelectValue placeholder="Seleccionar" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="true">Sí</SelectItem>
                                                                                <SelectItem value="false">No</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </Field>
                                                                </div>
                                                            </Card>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2 pb-2">
                                        <p className="text-xs text-muted-foreground">
                                            <span className="text-destructive">*</span> Campos obligatorios
                                        </p>
                                    </div>

                                    <div className="flex max-w-1/2 gap-2 pt-4">
                                        <Button type="submit" className="flex-1">
                                            <Save className="h-4 w-4 mr-2" />
                                            {isEditing ? 'Actualizar' : 'Crear'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsSheetOpen(false)}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Cancelar
                                        </Button>
                                    </div>
                                </form>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros y Búsqueda</CardTitle>
                        <CardDescription>
                            Busca y filtra inscripciones por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por estudiante o materia..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <NativeSelect
                                    value={selectedEstudiante}
                                    onChange={(e) => setSelectedEstudiante(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <NativeSelectOption value="">Todos los estudiantes</NativeSelectOption>
                                    {estudiantes.map((estudiante) => (
                                        <NativeSelectOption key={estudiante.id_estudiante} value={estudiante.id_estudiante}>
                                            {estudiante.numero_control} - {estudiante.nombres} {estudiante.ap_paterno}
                                        </NativeSelectOption>
                                    ))}
                                </NativeSelect>
                                <NativeSelect
                                    value={selectedOferta}
                                    onChange={(e) => setSelectedOferta(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <NativeSelectOption value="">Todas las ofertas</NativeSelectOption>
                                    {ofertas.map((oferta) => (
                                        <NativeSelectOption key={oferta.id_oferta} value={oferta.id_oferta.toString()}>
                                            {oferta.materia?.nombre} - {oferta.periodo?.etiqueta}
                                        </NativeSelectOption>
                                    ))}
                                </NativeSelect>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de inscripciones */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Inscripciones</CardTitle>
                        <CardDescription>
                            {filteredInscripciones.length} de {inscripciones.length} inscripciones registradas en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Estudiante</TableHead>
                                        <TableHead>Materia</TableHead>
                                        <TableHead>Periodo</TableHead>
                                        <TableHead>Calificación</TableHead>
                                        <TableHead>Asistencia</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentInscripciones.map((inscripcion) => (
                                        <TableRow key={inscripcion.id_inscripcion}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <User2 className="h-4 w-4 text-blue-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{inscripcion.estudiante?.nombres} {inscripcion.estudiante?.ap_paterno} {inscripcion.estudiante?.ap_materno}</div>
                                                        <div className="text-sm text-muted-foreground">{inscripcion.estudiante?.numero_control}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <BookOpen className="h-4 w-4 text-purple-600 mr-2" />
                                                    {inscripcion.oferta?.materia?.nombre || 'Sin materia'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{inscripcion.oferta?.periodo?.etiqueta || 'Sin periodo'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`font-medium ${getCalificacionColor(inscripcion.cal_final || 0)}`}>
                                                    {inscripcion.cal_final ? `${inscripcion.cal_final}` : 'Sin calificación'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {inscripcion.asistencia_pct ? `${inscripcion.asistencia_pct}%` : 'Sin registro'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {inscripcion.cal_final ? getAprobadoBadge(inscripcion.aprobado) : <Badge variant="outline">En curso</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(inscripcion)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar inscripción
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(inscripcion.id_inscripcion)}
                                                        >
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

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 py-4">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    if (currentPage > 1) {
                                                        handlePageChange(currentPage - 1)
                                                    }
                                                }}
                                                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>

                                        {generatePageNumbers().map((page, index) => (
                                            <PaginationItem key={index}>
                                                {page === '...' ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            handlePageChange(page as number)
                                                        }}
                                                        isActive={currentPage === page}
                                                        className="cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    if (currentPage < totalPages) {
                                                        handlePageChange(currentPage + 1)
                                                    }
                                                }}
                                                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Estadísticas rápidas */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Inscripciones</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inscripciones.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inscripciones.filter(i => i.aprobado).length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                            <Target className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {inscripciones.filter(i => i.cal_final).length > 0
                                    ? (inscripciones.filter(i => i.cal_final).reduce((acc, curr) => acc + curr.cal_final, 0) / inscripciones.filter(i => i.cal_final).length).toFixed(1)
                                    : 'N/A'
                                }
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En Curso</CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inscripciones.filter(i => !i.cal_final).length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dialog de carga de Excel */}
                <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Cargar Inscripciones desde Excel</DialogTitle>
                            <DialogDescription>
                                Sube un archivo Excel con las inscripciones y calificaciones por unidad
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                <p className="mb-2 font-medium">Formato requerido:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>numero_control: Número de control del estudiante</li>
                                    <li>materia_clave: Clave de la materia</li>
                                    <li>periodo_etiqueta: Etiqueta del período</li>
                                    <li>grupo_clave: Clave del grupo</li>
                                    <li>calificacion_unidad_X: Calificación de la unidad X (0-100)</li>
                                    <li>asistencia_unidad_X: Asistencia de la unidad X (Si/No)</li>
                                </ul>
                            </div>

                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                                    } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    {isDragActive
                                        ? 'Suelta el archivo aquí...'
                                        : 'Arrastra un archivo Excel aquí o haz clic para seleccionar'
                                    }
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Formatos soportados: .xlsx, .xls
                                </p>
                            </div>

                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Procesando...</span>
                                        <span>{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Modal de Errores */}
                <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {errorDetails?.type === 'validation' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                                {errorDetails?.type === 'database' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                                {errorDetails?.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-orange-500" />}
                                {errorDetails?.type === 'general' && <AlertTriangle className="h-5 w-5 text-gray-500" />}
                                {errorDetails?.title}
                            </DialogTitle>
                            <DialogDescription className="text-left">
                                {errorDetails?.message}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-medium text-sm mb-2">Detalles del problema:</h4>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {errorDetails?.details.map((detail, index) => (
                                        <li key={index}>{detail}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowErrorModal(false)}
                                >
                                    Entendido
                                </Button>
                                {errorDetails?.type === 'database' && (
                                    <Button onClick={() => {
                                        setShowErrorModal(false)
                                        // Aquí podrías agregar lógica para reintentar
                                    }}>
                                        Reintentar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </Layout>
    )
}
