'use client'
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Field } from "@/components/ui/field"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Search,
    Plus,
    Filter,
    Download,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    User,
    Mail,
    Phone,
    Calendar,
    GraduationCap,
    Users,
    BookOpen,
    CheckCircle,
    AlertTriangle,
    Clock,
    Save,
    X,
    User2,
    ClipboardList,
    Target,
    TrendingUp,
    PlusCircle,
    MinusCircle,
    FileText
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function InscripcionesPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingInscripcion, setEditingInscripcion] = useState<any>(null)
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

    const supabase = createClient()

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
            toast.error('Por favor selecciona un estudiante y una oferta')
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
            toast.error('La calificación debe estar entre 0 y 100')
            return
        }

        // Validar asistencia
        const asistencia = parseFloat(formData.asistencia_pct)
        if (formData.asistencia_pct && (asistencia < 0 || asistencia > 100)) {
            toast.error('La asistencia debe estar entre 0 y 100')
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
                    toast.error('Ya existe una inscripción para este estudiante en esta oferta')
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

        } catch (error) {
            console.error('Error al guardar inscripción:', error)
            toast.error('Error al guardar la inscripción. Inténtalo de nuevo.')
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
                                <form onSubmit={handleSubmit} className="mt-6 pr-2 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <Label htmlFor="id_estudiante">Estudiante *</Label>
                                            <Select value={formData.id_estudiante} onValueChange={(value) => setFormData({ ...formData, id_estudiante: value })}>
                                                <SelectTrigger>
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
                                            <Label htmlFor="id_oferta">Oferta *</Label>
                                            <Select
                                                value={formData.id_oferta}
                                                onValueChange={(value) => setFormData({ ...formData, id_oferta: value })}
                                                disabled={!formData.id_estudiante}
                                            >
                                                <SelectTrigger>
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
                                            <Label htmlFor="intentos">Intentos</Label>
                                            <Input
                                                id="intentos"
                                                type="number"
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
                                                                        <Label>Calificación (0-100)</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            step="1"
                                                                            value={unidadData.calificacion}
                                                                            onChange={(e) => handleUnidadChange(unidad.id_materia_unidad, 'calificacion', e.target.value)}
                                                                            placeholder="100"
                                                                        />
                                                                    </Field>
                                                                    <Field>
                                                                        <Label>Asistió</Label>
                                                                        <Select
                                                                            value={unidadData.asistio === null || unidadData.asistio === undefined ? '' : String(unidadData.asistio)}
                                                                            onValueChange={(value) => handleUnidadChange(unidad.id_materia_unidad, 'asistio', value === 'true')}
                                                                        >
                                                                            <SelectTrigger>
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
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filtros
                                </Button>
                                <select
                                    value={selectedEstudiante}
                                    onChange={(e) => setSelectedEstudiante(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos los estudiantes</option>
                                    {estudiantes.map((estudiante) => (
                                        <option key={estudiante.id_estudiante} value={estudiante.id_estudiante}>
                                            {estudiante.numero_control} - {estudiante.nombres} {estudiante.ap_paterno}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedOferta}
                                    onChange={(e) => setSelectedOferta(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todas las ofertas</option>
                                    {ofertas.map((oferta) => (
                                        <option key={oferta.id_oferta} value={oferta.id_oferta.toString()}>
                                            {oferta.materia?.nombre} - {oferta.periodo?.etiqueta}
                                        </option>
                                    ))}
                                </select>
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

            </div>
        </Layout>
    )
}
