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
    Download,
    MoreHorizontal,
    Edit,
    Trash2,
    Mail,
    Phone,
    Calendar as CalendarIcon,
    GraduationCap,
    Users,
    BookOpen,
    CheckCircle,
    AlertTriangle,
    Save,
    X,
    User2
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { EstudianteService } from "@/lib/services/estudiante-service"
import { ValidationChain } from "@/lib/validators/validation-chain"
import { CommandInvoker, CreateCommand, UpdateCommand, DeleteCommand } from "@/lib/commands/command-pattern"

export default function EstudiantesPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingEstudiante, setEditingEstudiante] = useState<any>(null)
    const [formData, setFormData] = useState({
        numero_control: '',
        ap_paterno: '',
        ap_materno: '',
        nombres: '',
        genero: '',
        fecha_nacimiento: '',
        email: '',
        telefono: '',
        id_carrera: '',
        id_modalidad: '',
        estatus: 'activo'
    })

    const [fechaNacimiento, setFechaNacimiento] = useState<Date>()
    const [fechaNacimientoOpen, setFechaNacimientoOpen] = useState(false)
    const [fechaNacimientoValue, setFechaNacimientoValue] = useState('')

    const [estudiantes, setEstudiantes] = useState<any[]>([])
    const [filteredEstudiantes, setFilteredEstudiantes] = useState<any[]>([])
    const [carreras, setCarreras] = useState<any[]>([])
    const [modalidades, setModalidades] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCarrera, setSelectedCarrera] = useState('')
    const [selectedEstatus, setSelectedEstatus] = useState('')

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const supabase = createClient()

    // Inicializar servicios y comandos (se recrean en cada render, pero es necesario para hooks)
    const [estudianteService] = useState(() => new EstudianteService(supabase))
    const [commandInvoker] = useState(() => new CommandInvoker())

    const formatDate = (date: Date | undefined) => {
        if (!date) {
            return ""
        }
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
    }

    const isValidDate = (date: Date | undefined) => {
        if (!date) {
            return false
        }
        return !isNaN(date.getTime())
    }

    useEffect(() => {
        fetchEstudiantes()
        fetchCarreras()
        fetchModalidades()
    }, [])

    useEffect(() => {
        filterEstudiantes()
    }, [estudiantes, searchTerm, selectedCarrera, selectedEstatus])

    const filterEstudiantes = () => {
        let filtered = estudiantes

        // Filtrar por término de búsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase().trim()
            const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0)

            filtered = filtered.filter(estudiante => {
                const nombreCompleto = `${estudiante.nombres || ''} ${estudiante.ap_paterno || ''} ${estudiante.ap_materno || ''}`.toLowerCase().trim()
                const numeroControl = (estudiante.numero_control || '').toLowerCase()
                const email = (estudiante.email || '').toLowerCase()

                if (searchWords.length === 1) {
                    const word = searchWords[0]
                    return nombreCompleto.includes(word) ||
                        numeroControl.includes(word) ||
                        email.includes(word)
                }

                return searchWords.every(word => nombreCompleto.includes(word)) ||
                    numeroControl.includes(searchLower) ||
                    email.includes(searchLower)
            })
        }

        // Filtrar por carrera
        if (selectedCarrera) {
            filtered = filtered.filter(estudiante =>
                estudiante.carrera?.id_carrera.toString() === selectedCarrera
            )
        }

        // Filtrar por estatus
        if (selectedEstatus) {
            filtered = filtered.filter(estudiante =>
                estudiante.estatus === selectedEstatus
            )
        }

        setFilteredEstudiantes(filtered)
        setCurrentPage(1) // Reset a la primera página cuando se filtran datos
    }

    // Funciones de paginación
    const totalPages = Math.ceil(filteredEstudiantes.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentEstudiantes = filteredEstudiantes.slice(startIndex, endIndex)

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

    const validateForm = async () => {
        // Usar Chain of Responsibility para validaciones
        const validaciones = [
            { field: 'numero_control', label: 'Número de control', value: formData.numero_control, chain: new ValidationChain().required().minLength(8).maxLength(10) },
            { field: 'ap_paterno', label: 'Apellido paterno', value: formData.ap_paterno, chain: new ValidationChain().required().minLength(2) },
            { field: 'ap_materno', label: 'Apellido materno', value: formData.ap_materno, chain: new ValidationChain().required().minLength(2) },
            { field: 'nombres', label: 'Nombres', value: formData.nombres, chain: new ValidationChain().required().minLength(2) },
            { field: 'estatus', label: 'Estatus', value: formData.estatus, chain: new ValidationChain().required() },
            { field: 'id_carrera', label: 'Carrera', value: formData.id_carrera, chain: new ValidationChain().required() },
            { field: 'id_modalidad', label: 'Modalidad', value: formData.id_modalidad, chain: new ValidationChain().required() },
            { field: 'genero', label: 'Género', value: formData.genero, chain: new ValidationChain().required() },
            { field: 'email', label: 'Email', value: formData.email, chain: new ValidationChain().required().email() },
            { field: 'telefono', label: 'Teléfono', value: formData.telefono, chain: new ValidationChain().required().phone() },
        ]

        for (const { field, label, value, chain } of validaciones) {
            const result = await chain.validate(formData, field, value)
            if (!result.isValid) {
                toast.error(result.error || `El campo "${label}" es inválido`)
                return false
            }
        }

        // Validar fecha de nacimiento
        if (!fechaNacimiento) {
            toast.error('La fecha de nacimiento es requerida')
            return false
        }

        const fechaValidator = new ValidationChain().required().dateRange(18, 100)
        const fechaResult = await fechaValidator.validate(
            formData,
            'fecha_nacimiento',
            fechaNacimiento.toISOString().split('T')[0]
        )

        if (!fechaResult.isValid) {
            toast.error(fechaResult.error || 'La fecha de nacimiento es inválida')
            return false
        }

        // Validar formato de email específico
        const emailEsperado = `l${formData.numero_control.trim()}@tectijuana.edu.mx`.toLowerCase()
        const emailIngresado = formData.email.trim().toLowerCase()

        if (emailIngresado !== emailEsperado) {
            toast.error(`El email debe tener el formato: l{numero_control}@tectijuana.edu.mx. Ejemplo: ${emailEsperado}`)
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar formulario usando Chain of Responsibility
        if (!(await validateForm())) {
            return
        }

        try {
            // Limpiar y normalizar datos antes de guardar
            const telefonoLimpiado = formData.telefono.replace(/\D/g, '') // Solo dígitos
            const emailLimpiado = formData.email.trim().toLowerCase() // Email en minúsculas y sin espacios

            const estudianteData = {
                numero_control: formData.numero_control.trim(),
                ap_paterno: formData.ap_paterno.trim(),
                ap_materno: formData.ap_materno.trim(),
                nombres: formData.nombres.trim(),
                genero: formData.genero || null,
                fecha_nacimiento: fechaNacimiento ? fechaNacimiento.toISOString().split('T')[0] : null,
                email: emailLimpiado || null,
                telefono: telefonoLimpiado || null,
                id_carrera: formData.id_carrera ? parseInt(formData.id_carrera) : null,
                id_modalidad: formData.id_modalidad ? parseInt(formData.id_modalidad) : null,
                estatus: formData.estatus
            }

            if (isEditing && editingEstudiante) {
                // Usar Command Pattern para operación reversible
                const updateCmd = new UpdateCommand(
                    async (id: string | number, data: any) => {
                        return await estudianteService.update(id, data as any)
                    },
                    async (id) => {
                        return await estudianteService.getById(id)
                    },
                    editingEstudiante.id_estudiante,
                    estudianteData as any
                )

                const result = await commandInvoker.execute(updateCmd)
                if (!result.success) {
                    throw result.error || new Error('Error al actualizar')
                }
            } else {
                // Usar Command Pattern para operación reversible
                const createCmd = new CreateCommand(
                    async (data: any) => {
                        return await estudianteService.create(data as any)
                    },
                    async (id: string | number) => {
                        await estudianteService.delete(id) as unknown as Promise<void>
                    },
                    estudianteData as any
                )

                const result = await commandInvoker.execute(createCmd)
                if (!result.success) {
                    throw result.error || new Error('Error al crear')
                }
            }

            // Recargar datos
            await fetchEstudiantes()

            // Limpiar formulario y cerrar sheet
            setFormData({
                numero_control: '',
                ap_paterno: '',
                ap_materno: '',
                nombres: '',
                genero: '',
                fecha_nacimiento: '',
                email: '',
                telefono: '',
                id_carrera: '',
                id_modalidad: '',
                estatus: 'activo'
            })
            setFechaNacimiento(undefined)
            setFechaNacimientoValue('')
            setIsSheetOpen(false)
            setIsEditing(false)
            setEditingEstudiante(null)

            // Mostrar notificación de éxito
            toast.success(isEditing ? 'Estudiante actualizado exitosamente' : 'Estudiante creado exitosamente')

        } catch (error: any) {
            console.error('Error al guardar estudiante:', error)
            toast.error(error?.message || 'Error al guardar el estudiante. Inténtalo de nuevo.')
        }
    }

    const fetchEstudiantes = async () => {
        try {
            // Usar Service Layer para obtener datos con relaciones
            const data = await estudianteService.getEstudiantesConRelaciones()
            setEstudiantes(data)
        } catch (error) {
            console.error('Error al cargar estudiantes:', error)
            toast.error('Error al cargar los estudiantes')
        }
    }

    const fetchCarreras = async () => {
        try {
            const { data, error } = await supabase
                .from('carrera')
                .select('*')
                .order('nombre', { ascending: true })

            if (error) throw error
            setCarreras(data || [])
        } catch (error) {
            console.error('Error al cargar carreras:', error)
        }
    }

    const fetchModalidades = async () => {
        try {
            const { data, error } = await supabase
                .from('modalidad')
                .select('*')
                .order('nombre', { ascending: true })

            if (error) throw error
            setModalidades(data || [])
        } catch (error) {
            console.error('Error al cargar modalidades:', error)
        }
    }

    const handleEdit = (estudiante: any) => {
        setEditingEstudiante(estudiante)
        setFormData({
            numero_control: estudiante.numero_control,
            ap_paterno: estudiante.ap_paterno,
            ap_materno: estudiante.ap_materno,
            nombres: estudiante.nombres,
            genero: estudiante.genero || '',
            fecha_nacimiento: estudiante.fecha_nacimiento || '',
            email: estudiante.email || '',
            telefono: estudiante.telefono || '',
            id_carrera: estudiante.id_carrera?.toString() || '',
            id_modalidad: estudiante.id_modalidad?.toString() || '',
            estatus: estudiante.estatus
        })

        // Configurar fecha de nacimiento
        const fechaNac = estudiante.fecha_nacimiento ? new Date(estudiante.fecha_nacimiento) : undefined
        setFechaNacimiento(fechaNac)
        setFechaNacimientoValue(formatDate(fechaNac))

        setIsEditing(true)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
            try {
                // Usar Command Pattern para operación reversible
                const deleteCmd = new DeleteCommand(
                    async (id) => {
                        await estudianteService.delete(id)
                    },
                    async (data) => {
                        return await estudianteService.create(data as any)
                    },
                    id,
                    async (id) => {
                        return await estudianteService.getById(id)
                    }
                )

                const result = await commandInvoker.execute(deleteCmd)
                if (!result.success) {
                    throw result.error || new Error('Error al eliminar')
                }

                await fetchEstudiantes()
                toast.success('Estudiante eliminado exitosamente')
            } catch (error: any) {
                console.error('Error al eliminar estudiante:', error)
                toast.error(error?.message || 'Error al eliminar el estudiante. Inténtalo de nuevo.')
            }
        }
    }

    const getEstatusBadge = (estatus: string) => {
        switch (estatus) {
            case 'activo':
                return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge>
            case 'baja_temp':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Baja Temporal</Badge>
            case 'egresado':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800"><GraduationCap className="h-3 w-3 mr-1" />Egresado</Badge>
            case 'desertor':
                return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Desertor</Badge>
            default:
                return <Badge variant="secondary">Desconocido</Badge>
        }
    }

    const exportarEstudiantes = () => {
        const datosExportar = estudiantes.map(estudiante => ({
            'Número de Control': estudiante.numero_control,
            'Apellido Paterno': estudiante.ap_paterno,
            'Apellido Materno': estudiante.ap_materno,
            'Nombres': estudiante.nombres,
            'Género': estudiante.genero || '',
            'Fecha de Nacimiento': estudiante.fecha_nacimiento || '',
            'Email': estudiante.email || '',
            'Teléfono': estudiante.telefono || '',
            'Carrera': estudiante.carrera?.nombre || '',
            'Modalidad': estudiante.modalidad?.nombre || '',
            'Estatus': estudiante.estatus || '',
            'Fecha de Ingreso': estudiante.fecha_ingreso || ''
        }))

        const ws = XLSX.utils.json_to_sheet(datosExportar)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes')
        XLSX.writeFile(wb, `estudiantes_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success('Estudiantes exportados exitosamente')
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Estudiantes</h1>
                        <p className="text-muted-foreground">
                            Administra la información de los estudiantes del sistema
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportarEstudiantes}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" onClick={() => {
                                    setIsEditing(false)
                                    setEditingEstudiante(null)
                                    setFormData({
                                        numero_control: '',
                                        ap_paterno: '',
                                        ap_materno: '',
                                        nombres: '',
                                        genero: '',
                                        fecha_nacimiento: '',
                                        email: '',
                                        telefono: '',
                                        id_carrera: '',
                                        id_modalidad: '',
                                        estatus: 'activo'
                                    })
                                    setFechaNacimiento(undefined)
                                    setFechaNacimientoValue('')
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nuevo Estudiante
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="p-4 min-w-[500px] ">
                                <SheetHeader>
                                    <SheetTitle>
                                        {isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}
                                    </SheetTitle>
                                    <SheetDescription>
                                        {isEditing ? 'Modifica los datos del estudiante' : 'Agrega un nuevo estudiante al sistema'}
                                    </SheetDescription>
                                </SheetHeader>
                                <form onSubmit={handleSubmit} className="space-y-6 mt-6" aria-label={isEditing ? 'Formulario para editar estudiante' : 'Formulario para crear nuevo estudiante'}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="numero_control" required>Número de Control</Label>
                                                <FieldHelp
                                                    description="Identificador único del estudiante en el sistema. Se usa para generar automáticamente el correo electrónico institucional."
                                                    id="help-numero-control"
                                                />
                                            </div>
                                            <Input
                                                id="numero_control"
                                                aria-label="Número de control del estudiante"
                                                aria-describedby="help-numero-control"
                                                aria-required="true"
                                                value={formData.numero_control}
                                                onChange={(e) => {
                                                    const numeroControl = e.target.value
                                                    // Auto-generar email basado en el número de control
                                                    const emailGenerado = numeroControl.trim()
                                                        ? `l${numeroControl.trim()}@tectijuana.edu.mx`
                                                        : ''
                                                    setFormData({
                                                        ...formData,
                                                        numero_control: numeroControl,
                                                        email: emailGenerado
                                                    })
                                                }}
                                                placeholder="21212372"
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="estatus" required>Estatus</Label>
                                                <FieldHelp
                                                    description="Estado actual del estudiante en el sistema. Puede ser activo, baja temporal, egresado o desertor."
                                                    id="help-estatus"
                                                />
                                            </div>
                                            <Select
                                                value={formData.estatus}
                                                onValueChange={(value) => setFormData({ ...formData, estatus: value })}
                                            >
                                                <SelectTrigger id="estatus" aria-label="Estatus del estudiante" aria-describedby="help-estatus" aria-required="true">
                                                    <SelectValue placeholder="Seleccionar estatus" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="activo">Activo</SelectItem>
                                                    <SelectItem value="baja_temp">Baja Temporal</SelectItem>
                                                    <SelectItem value="egresado">Egresado</SelectItem>
                                                    <SelectItem value="desertor">Desertor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="ap_paterno" required>Apellido Paterno</Label>
                                                <FieldHelp
                                                    description="Primer apellido del estudiante según su acta de nacimiento."
                                                    id="help-ap-paterno"
                                                />
                                            </div>
                                            <Input
                                                id="ap_paterno"
                                                aria-label="Apellido paterno del estudiante"
                                                aria-describedby="help-ap-paterno"
                                                aria-required="true"
                                                value={formData.ap_paterno}
                                                onChange={(e) => setFormData({ ...formData, ap_paterno: e.target.value })}
                                                placeholder="Pérez"
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="ap_materno" required>Apellido Materno</Label>
                                                <FieldHelp
                                                    description="Segundo apellido del estudiante según su acta de nacimiento."
                                                    id="help-ap-materno"
                                                />
                                            </div>
                                            <Input
                                                id="ap_materno"
                                                aria-label="Apellido materno del estudiante"
                                                aria-describedby="help-ap-materno"
                                                aria-required="true"
                                                value={formData.ap_materno}
                                                onChange={(e) => setFormData({ ...formData, ap_materno: e.target.value })}
                                                placeholder="García"
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <div className="flex flex-1 items-center gap-2">
                                                <Label htmlFor="nombres" required>Nombres</Label>
                                                <FieldHelp
                                                    description="Nombre o nombres de pila del estudiante."
                                                    id="help-nombres"
                                                />
                                            </div>
                                            <Input
                                                id="nombres"
                                                aria-label="Nombres del estudiante"
                                                aria-describedby="help-nombres"
                                                aria-required="true"
                                                value={formData.nombres}
                                                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                                placeholder="Juan Carlos"
                                                required
                                            />
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="genero" required>Género</Label>
                                                <FieldHelp
                                                    description="Identidad de género del estudiante."
                                                    id="help-genero"
                                                />
                                            </div>
                                            <Select
                                                value={formData.genero}
                                                onValueChange={(value) => setFormData({ ...formData, genero: value })}
                                            >
                                                <SelectTrigger id="genero" aria-label="Género del estudiante" aria-describedby="help-genero" aria-required="true">
                                                    <SelectValue placeholder="Seleccionar género" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="M">Masculino</SelectItem>
                                                    <SelectItem value="F">Femenino</SelectItem>
                                                    <SelectItem value="O">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                                                <FieldHelp
                                                    description="Fecha de nacimiento del estudiante. Se usa para calcular la edad y validaciones administrativas."
                                                    id="help-fecha-nacimiento"
                                                />
                                            </div>
                                            <div className="relative flex gap-2">
                                                <Input
                                                    id="fecha_nacimiento"
                                                    aria-label="Fecha de nacimiento del estudiante"
                                                    aria-describedby="help-fecha-nacimiento"
                                                    value={fechaNacimientoValue}
                                                    placeholder="01 de enero, 2000"
                                                    className="bg-background pr-10"
                                                    onChange={(e) => {
                                                        const date = new Date(e.target.value)
                                                        setFechaNacimientoValue(e.target.value)
                                                        if (isValidDate(date)) {
                                                            setFechaNacimiento(date)
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "ArrowDown") {
                                                            e.preventDefault()
                                                            setFechaNacimientoOpen(true)
                                                        }
                                                    }}
                                                />
                                                <Popover open={fechaNacimientoOpen} onOpenChange={setFechaNacimientoOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            id="fecha-nacimiento-picker"
                                                            variant="ghost"
                                                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                                            aria-label="Abrir selector de fecha de nacimiento"
                                                        >
                                                            <CalendarIcon className="size-3.5" />
                                                            <span className="sr-only">Seleccionar fecha</span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto overflow-hidden p-0"
                                                        align="end"
                                                        alignOffset={-8}
                                                        sideOffset={10}
                                                    >
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={fechaNacimiento}
                                                            captionLayout="dropdown"
                                                            onSelect={(date) => {
                                                                setFechaNacimiento(date)
                                                                setFechaNacimientoValue(formatDate(date))
                                                                setFechaNacimientoOpen(false)
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="email" required>Email</Label>
                                                <FieldHelp
                                                    description="Correo electrónico institucional del estudiante. Se genera automáticamente basado en el número de control, pero puede modificarse."
                                                    id="help-email"
                                                />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                aria-label="Correo electrónico del estudiante"
                                                aria-describedby="help-email"
                                                aria-required="true"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="l21212372@tectijuana.edu.mx"
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="telefono" required>Teléfono</Label>
                                                <FieldHelp
                                                    description="Número de teléfono de contacto del estudiante. Incluye código de área si aplica."
                                                    id="help-telefono"
                                                />
                                            </div>
                                            <Input
                                                id="telefono"
                                                type="tel"
                                                aria-label="Teléfono de contacto del estudiante"
                                                aria-describedby="help-telefono"
                                                aria-required="true"
                                                value={formData.telefono}
                                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                                placeholder="555-0123"
                                                required
                                            />
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="id_carrera" required>Carrera</Label>
                                                <FieldHelp
                                                    description="Programa académico en el que está inscrito el estudiante."
                                                    id="help-carrera"
                                                />
                                            </div>
                                            <Select
                                                value={formData.id_carrera}
                                                onValueChange={(value) => setFormData({ ...formData, id_carrera: value })}
                                            >
                                                <SelectTrigger id="id_carrera" aria-label="Carrera del estudiante" aria-describedby="help-carrera" aria-required="true">
                                                    <SelectValue placeholder="Seleccionar carrera" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {carreras.map((carrera) => (
                                                        <SelectItem key={carrera.id_carrera} value={carrera.id_carrera.toString()}>
                                                            {carrera.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="id_modalidad" required>Modalidad</Label>
                                                <FieldHelp
                                                    description="Forma de estudio del estudiante: presencial, en línea o mixta."
                                                    id="help-modalidad"
                                                />
                                            </div>
                                            <Select
                                                value={formData.id_modalidad}
                                                onValueChange={(value) => setFormData({ ...formData, id_modalidad: value })}
                                            >
                                                <SelectTrigger id="id_modalidad" aria-label="Modalidad de estudio" aria-describedby="help-modalidad" aria-required="true">
                                                    <SelectValue placeholder="Seleccionar modalidad" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {modalidades.map((modalidad) => (
                                                        <SelectItem key={modalidad.id_modalidad} value={modalidad.id_modalidad.toString()}>
                                                            {modalidad.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>

                                    <div className="pt-2 pb-2">
                                        <p className="text-xs text-muted-foreground">
                                            <span className="text-destructive">*</span> Campos obligatorios
                                        </p>
                                    </div>

                                    <div className="flex gap-2 pt-4">
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
                            Busca y filtra estudiantes por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, número de control o email..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <NativeSelect
                                    value={selectedCarrera}
                                    onChange={(e) => setSelectedCarrera(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <NativeSelectOption value="">Todas las carreras</NativeSelectOption>
                                    {carreras.map((carrera) => (
                                        <NativeSelectOption key={carrera.id_carrera} value={carrera.id_carrera.toString()}>
                                            {carrera.nombre}
                                        </NativeSelectOption>
                                    ))}
                                </NativeSelect>
                                <NativeSelect
                                    value={selectedEstatus}
                                    onChange={(e) => setSelectedEstatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <NativeSelectOption value="">Todos los estatus</NativeSelectOption>
                                    <NativeSelectOption value="activo">Activo</NativeSelectOption>
                                    <NativeSelectOption value="baja_temp">Baja Temporal</NativeSelectOption>
                                    <NativeSelectOption value="egresado">Egresado</NativeSelectOption>
                                    <NativeSelectOption value="desertor">Desertor</NativeSelectOption>
                                </NativeSelect>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de estudiantes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Estudiantes</CardTitle>
                        <CardDescription>
                            {filteredEstudiantes.length} de {estudiantes.length} estudiantes registrados en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Estudiante</TableHead>
                                        <TableHead>Carrera</TableHead>
                                        <TableHead>Modalidad</TableHead>
                                        <TableHead>Estatus</TableHead>
                                        <TableHead>Contacto</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentEstudiantes.map((estudiante) => (
                                        <TableRow key={estudiante.id_estudiante}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <User2 className="h-4 w-4 text-blue-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{estudiante.nombres} {estudiante.ap_paterno} {estudiante.ap_materno}</div>
                                                        <div className="text-sm text-muted-foreground">{estudiante.numero_control}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <GraduationCap className="h-4 w-4 text-purple-600 mr-2" />
                                                    {estudiante.carrera?.nombre || 'Sin carrera'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{estudiante.modalidad?.nombre || 'Sin modalidad'}</Badge>
                                            </TableCell>
                                            <TableCell>{getEstatusBadge(estudiante.estatus)}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {estudiante.email && (
                                                        <div className="flex items-center text-sm">
                                                            <Mail className="h-3 w-3 text-muted-foreground mr-1" />
                                                            {estudiante.email}
                                                        </div>
                                                    )}
                                                    {estudiante.telefono && (
                                                        <div className="flex items-center text-sm">
                                                            <Phone className="h-3 w-3 text-muted-foreground mr-1" />
                                                            {estudiante.telefono}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">

                                                        <DropdownMenuItem onClick={() => handleEdit(estudiante)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(estudiante.id_estudiante)}
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
                            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estudiantes.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estudiantes.filter(e => e.estatus === 'activo').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Carreras Diferentes</CardTitle>
                            <BookOpen className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(estudiantes.filter(e => e.carrera).map(e => e.carrera.id_carrera)).size}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nuevos este mes</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {estudiantes.filter(e => {
                                    const fechaIngreso = new Date(e.fecha_ingreso)
                                    const mesActual = new Date()
                                    return fechaIngreso.getMonth() === mesActual.getMonth() &&
                                        fechaIngreso.getFullYear() === mesActual.getFullYear()
                                }).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}