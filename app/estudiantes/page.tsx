'use client'
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Field } from "@/components/ui/field"
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
    Calendar as CalendarIcon,
    GraduationCap,
    Users,
    BookOpen,
    CheckCircle,
    AlertTriangle,
    Clock,
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
            filtered = filtered.filter(estudiante =>
                estudiante.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                estudiante.ap_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                estudiante.ap_materno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                estudiante.numero_control.toLowerCase().includes(searchTerm.toLowerCase()) ||
                estudiante.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar campos requeridos
        if (!formData.numero_control || !formData.ap_paterno || !formData.ap_materno || !formData.nombres) {
            toast.error('Por favor completa todos los campos requeridos')
            return
        }

        try {
            if (isEditing) {
                // Actualizar estudiante existente
                const { error } = await supabase
                    .from('estudiante')
                    .update({
                        numero_control: formData.numero_control,
                        ap_paterno: formData.ap_paterno,
                        ap_materno: formData.ap_materno,
                        nombres: formData.nombres,
                        genero: formData.genero || null,
                        fecha_nacimiento: fechaNacimiento ? fechaNacimiento.toISOString().split('T')[0] : null,
                        email: formData.email || null,
                        telefono: formData.telefono || null,
                        id_carrera: formData.id_carrera ? parseInt(formData.id_carrera) : null,
                        id_modalidad: formData.id_modalidad ? parseInt(formData.id_modalidad) : null,
                        estatus: formData.estatus
                    })
                    .eq('id_estudiante', editingEstudiante?.id_estudiante)

                if (error) throw error
            } else {
                // Crear nuevo estudiante
                const { error } = await supabase
                    .from('estudiante')
                    .insert({
                        numero_control: formData.numero_control,
                        ap_paterno: formData.ap_paterno,
                        ap_materno: formData.ap_materno,
                        nombres: formData.nombres,
                        genero: formData.genero || null,
                        fecha_nacimiento: fechaNacimiento ? fechaNacimiento.toISOString().split('T')[0] : null,
                        email: formData.email || null,
                        telefono: formData.telefono || null,
                        id_carrera: formData.id_carrera ? parseInt(formData.id_carrera) : null,
                        id_modalidad: formData.id_modalidad ? parseInt(formData.id_modalidad) : null,
                        estatus: formData.estatus
                    })

                if (error) throw error
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

        } catch (error) {
            console.error('Error al guardar estudiante:', error)
            toast.error('Error al guardar el estudiante. Inténtalo de nuevo.')
        }
    }

    const fetchEstudiantes = async () => {
        try {
            const { data, error } = await supabase
                .from('estudiante')
                .select(`
                    *,
                    carrera:carrera(*),
                    modalidad:modalidad(*)
                `)
                .order('numero_control', { ascending: true })

            if (error) throw error
            setEstudiantes(data || [])
        } catch (error) {
            console.error('Error al cargar estudiantes:', error)
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
                const { error } = await supabase
                    .from('estudiante')
                    .delete()
                    .eq('id_estudiante', id)

                if (error) throw error
                await fetchEstudiantes()
                toast.success('Estudiante eliminado exitosamente')
            } catch (error) {
                console.error('Error al eliminar estudiante:', error)
                toast.error('Error al eliminar el estudiante. Inténtalo de nuevo.')
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
                        <Button variant="outline" size="sm">
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
                                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <Label htmlFor="numero_control">Número de Control *</Label>
                                            <Input
                                                id="numero_control"
                                                value={formData.numero_control}
                                                onChange={(e) => setFormData({ ...formData, numero_control: e.target.value })}
                                                placeholder="2024001"
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <Label htmlFor="estatus">Estatus</Label>
                                            <Select value={formData.estatus} onValueChange={(value) => setFormData({ ...formData, estatus: value })}>
                                                <SelectTrigger>
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
                                            <Label htmlFor="ap_paterno">Apellido Paterno *</Label>
                                            <Input
                                                id="ap_paterno"
                                                value={formData.ap_paterno}
                                                onChange={(e) => setFormData({ ...formData, ap_paterno: e.target.value })}
                                                placeholder="Pérez"
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <Label htmlFor="ap_materno">Apellido Materno *</Label>
                                            <Input
                                                id="ap_materno"
                                                value={formData.ap_materno}
                                                onChange={(e) => setFormData({ ...formData, ap_materno: e.target.value })}
                                                placeholder="García"
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <Label htmlFor="nombres">Nombres *</Label>
                                            <Input
                                                id="nombres"
                                                value={formData.nombres}
                                                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                                placeholder="Juan Carlos"
                                                required
                                            />
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <Label htmlFor="genero">Género</Label>
                                            <Select value={formData.genero} onValueChange={(value) => setFormData({ ...formData, genero: value })}>
                                                <SelectTrigger>
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
                                            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                                            <div className="relative flex gap-2">
                                                <Input
                                                    id="fecha_nacimiento"
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
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="juan.perez@email.com"
                                            />
                                        </Field>
                                        <Field>
                                            <Label htmlFor="telefono">Teléfono</Label>
                                            <Input
                                                id="telefono"
                                                value={formData.telefono}
                                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                                placeholder="555-0123"
                                            />
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <Label htmlFor="id_carrera">Carrera</Label>
                                            <Select value={formData.id_carrera} onValueChange={(value) => setFormData({ ...formData, id_carrera: value })}>
                                                <SelectTrigger>
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
                                            <Label htmlFor="id_modalidad">Modalidad</Label>
                                            <Select value={formData.id_modalidad} onValueChange={(value) => setFormData({ ...formData, id_modalidad: value })}>
                                                <SelectTrigger>
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
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filtros
                                </Button>
                                <select
                                    value={selectedCarrera}
                                    onChange={(e) => setSelectedCarrera(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todas las carreras</option>
                                    {carreras.map((carrera) => (
                                        <option key={carrera.id_carrera} value={carrera.id_carrera.toString()}>
                                            {carrera.nombre}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedEstatus}
                                    onChange={(e) => setSelectedEstatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos los estatus</option>
                                    <option value="activo">Activo</option>
                                    <option value="baja_temp">Baja Temporal</option>
                                    <option value="egresado">Egresado</option>
                                    <option value="desertor">Desertor</option>
                                </select>
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
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver detalles
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(estudiante)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <BookOpen className="mr-2 h-4 w-4" />
                                                            Ver inscripciones
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Users className="mr-2 h-4 w-4" />
                                                            Ver grupo
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