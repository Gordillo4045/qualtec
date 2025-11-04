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
// import { Textarea } from "@/components/ui/textarea"
import {
    AlertTriangle,
    TrendingUp,
    PlusCircle,
    MoreHorizontal,
    Edit,
    Trash2,
    Users,
    FileText,
    Calendar,
    Target,
    AlertCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function FactoresPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingFactor, setEditingFactor] = useState<any>(null)
    const [factores, setFactores] = useState<any[]>([])
    const [subfactores, setSubfactores] = useState<any[]>([])
    const [estudiantes, setEstudiantes] = useState<any[]>([])
    const [periodos, setPeriodos] = useState<any[]>([])
    const [estudianteFactores, setEstudianteFactores] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFactor, setSelectedFactor] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const [formData, setFormData] = useState({
        id_estudiante: '',
        id_periodo: '',
        id_factor: '',
        id_subfactor: '',
        severidad: '',
        observacion: ''
    })

    const supabase = createClient()

    // Verificar conexión a Supabase
    useEffect(() => {
        const testConnection = async () => {
            try {
                const { data, error } = await supabase
                    .from('periodo')
                    .select('id_periodo')
                    .limit(1)

                if (error) {
                    console.error('Error de conexión a Supabase:', error)
                    toast.error('Error de conexión a la base de datos')
                } else {
                    console.log('Conexión a Supabase exitosa')
                }
            } catch (error) {
                console.error('Error al verificar conexión:', error)
            }
        }

        testConnection()
    }, [])

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchFactores(),
                    fetchSubfactores(),
                    fetchEstudiantes(),
                    fetchPeriodos(),
                    fetchEstudianteFactores()
                ])
            } catch (error) {
                console.error('Error general al cargar datos:', error)
                toast.error('Error al cargar algunos datos')
            }
        }

        loadData()
    }, [])

    const fetchFactores = async () => {
        try {
            const { data, error } = await supabase
                .from('factor')
                .select('*')
                .order('nombre')

            if (error) {
                console.error('Error de Supabase en factores:', error)
                throw error
            }
            setFactores(data || [])
        } catch (error) {
            console.error('Error al cargar factores:', error)
            toast.error('Error al cargar factores')
        }
    }

    const fetchSubfactores = async () => {
        try {
            const { data, error } = await supabase
                .from('subfactor')
                .select(`
                    *,
                    factor:factor(*)
                `)
                .order('nombre')

            if (error) throw error
            setSubfactores(data || [])
        } catch (error) {
            console.error('Error al cargar subfactores:', error)
            toast.error('Error al cargar subfactores')
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
                .order('ap_paterno')
                .order('ap_materno')
                .order('nombres')

            if (error) throw error
            setEstudiantes(data || [])
        } catch (error) {
            console.error('Error al cargar estudiantes:', error)
            toast.error('Error al cargar estudiantes')
        }
    }

    const fetchPeriodos = async () => {
        try {
            const { data, error } = await supabase
                .from('periodo')
                .select('*')
                .order('anio', { ascending: false })
                .order('etiqueta', { ascending: true })

            if (error) {
                console.error('Error de Supabase:', error)
                throw error
            }

            setPeriodos(data || [])
        } catch (error) {
            console.error('Error al cargar periodos:', error)
            toast.error('Error al cargar periodos')
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
            setLoading(false)
        } catch (error) {
            console.error('Error al cargar factores de estudiantes:', error)
            toast.error('Error al cargar factores de estudiantes')
            setLoading(false)
        }
    }

    const filterEstudianteFactores = () => {
        let filtered = estudianteFactores

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase().trim()
            const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0)

            filtered = filtered.filter(ef => {
                const nombreCompleto = `${ef.estudiante?.nombres || ''} ${ef.estudiante?.ap_paterno || ''} ${ef.estudiante?.ap_materno || ''}`.toLowerCase().trim()
                const factorNombre = (ef.factor?.nombre || '').toLowerCase()
                const subfactorNombre = (ef.subfactor?.nombre || '').toLowerCase()

                if (searchWords.length === 1) {
                    const word = searchWords[0]
                    return nombreCompleto.includes(word) ||
                        factorNombre.includes(word) ||
                        subfactorNombre.includes(word)
                }

                return searchWords.every(word => nombreCompleto.includes(word)) ||
                    factorNombre.includes(searchLower) ||
                    subfactorNombre.includes(searchLower)
            })
        }

        if (selectedFactor && selectedFactor !== 'all') {
            filtered = filtered.filter(ef => ef.id_factor === parseInt(selectedFactor))
        }

        return filtered
    }

    const filteredEstudianteFactores = filterEstudianteFactores()
    const totalPages = Math.ceil(filteredEstudianteFactores.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentEstudianteFactores = filteredEstudianteFactores.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar campos requeridos
        if (!formData.id_estudiante || !formData.id_periodo || !formData.id_factor || !formData.id_subfactor || !formData.severidad) {
            toast.error('Por favor completa todos los campos requeridos')
            return
        }

        // Validar severidad (debe estar entre 1 y 5)
        const severidadNum = parseInt(formData.severidad)
        if (isNaN(severidadNum) || severidadNum < 1 || severidadNum > 5) {
            toast.error('La severidad debe ser un número entre 1 y 5')
            return
        }

        // Validar que los IDs sean números válidos
        const periodoNum = parseInt(formData.id_periodo)
        const factorNum = parseInt(formData.id_factor)
        const subfactorNum = parseInt(formData.id_subfactor)

        if (isNaN(periodoNum) || isNaN(factorNum) || isNaN(subfactorNum)) {
            toast.error('Error: Los valores seleccionados no son válidos')
            return
        }

        // Validar que la observación no sea solo espacios (si se proporciona)
        if (formData.observacion && formData.observacion.trim().length === 0) {
            toast.error('La observación no puede contener solo espacios')
            return
        }

        // Limpiar observación (trim y null si está vacío)
        const observacionLimpiada = formData.observacion?.trim() || null

        try {
            if (isEditing && editingFactor) {
                // Actualizar factor de estudiante existente
                const { error } = await supabase
                    .from('estudiante_factor')
                    .update({
                        id_estudiante: formData.id_estudiante,
                        id_periodo: periodoNum,
                        id_factor: factorNum,
                        id_subfactor: subfactorNum,
                        severidad: severidadNum,
                        observacion: observacionLimpiada
                    })
                    .eq('id_estudiante_factor', editingFactor.id_estudiante_factor)

                if (error) throw error
                toast.success('Factor de estudiante actualizado correctamente')
            } else {
                // Crear nuevo factor de estudiante
                const { error } = await supabase
                    .from('estudiante_factor')
                    .insert({
                        id_estudiante: formData.id_estudiante,
                        id_periodo: periodoNum,
                        id_factor: factorNum,
                        id_subfactor: subfactorNum,
                        severidad: severidadNum,
                        observacion: observacionLimpiada
                    })

                if (error) throw error
                toast.success('Factor de estudiante registrado correctamente')
            }

            fetchEstudianteFactores()
            handleClose()
        } catch (error) {
            console.error('Error al guardar factor de estudiante:', error)
            toast.error('Error al guardar factor de estudiante')
        }
    }

    const handleEdit = (estudianteFactor: any) => {
        setEditingFactor(estudianteFactor)
        setFormData({
            id_estudiante: estudianteFactor.id_estudiante,
            id_periodo: estudianteFactor.id_periodo?.toString() || '',
            id_factor: estudianteFactor.id_factor?.toString() || '',
            id_subfactor: estudianteFactor.id_subfactor?.toString() || '',
            severidad: estudianteFactor.severidad?.toString() || '',
            observacion: estudianteFactor.observacion || ''
        })
        setIsEditing(true)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este factor de estudiante?')) return

        try {
            const { error } = await supabase
                .from('estudiante_factor')
                .delete()
                .eq('id_estudiante_factor', id)

            if (error) throw error
            toast.success('Factor de estudiante eliminado correctamente')
            fetchEstudianteFactores()
        } catch (error) {
            console.error('Error al eliminar factor de estudiante:', error)
            toast.error('Error al eliminar factor de estudiante')
        }
    }

    const handleClose = () => {
        setIsSheetOpen(false)
        setIsEditing(false)
        setEditingFactor(null)
        setFormData({
            id_estudiante: '',
            id_periodo: '',
            id_factor: '',
            id_subfactor: '',
            severidad: '',
            observacion: ''
        })
    }

    const getSeveridadColor = (severidad: number) => {
        if (severidad <= 2) return 'bg-green-100 text-green-800'
        if (severidad === 3) return 'bg-yellow-100 text-yellow-800'
        return 'bg-red-100 text-red-800'
    }

    const getSeveridadText = (severidad: number) => {
        if (severidad <= 2) return 'Baja'
        if (severidad === 3) return 'Media'
        return 'Alta'
    }

    const getSubfactoresByFactor = (idFactor: number) => {
        return subfactores.filter(sf => sf.id_factor === idFactor)
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Cargando factores...</p>
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
                        <h1 className="text-3xl font-bold tracking-tight">Factores de Riesgo</h1>
                        <p className="text-muted-foreground">
                            Gestión de factores de riesgo académico y psicosocial
                        </p>
                    </div>
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button onClick={handleClose}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Registrar Factor
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="p-4 min-w-[500px]">
                            <SheetHeader>
                                <SheetTitle>
                                    {isEditing ? 'Editar Factor de Estudiante' : 'Registrar Factor de Estudiante'}
                                </SheetTitle>
                                <SheetDescription>
                                    {isEditing ? 'Modifica la información del factor de riesgo' : 'Registra un nuevo factor de riesgo para un estudiante'}
                                </SheetDescription>
                            </SheetHeader>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                <Field>
                                    <Label>Estudiante *</Label>
                                    <Select
                                        value={formData.id_estudiante}
                                        onValueChange={(value) => setFormData({ ...formData, id_estudiante: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar estudiante" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {estudiantes.map((estudiante) => (
                                                <SelectItem key={estudiante.id_estudiante} value={estudiante.id_estudiante}>
                                                    {estudiante.ap_paterno} {estudiante.ap_materno} {estudiante.nombres}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <Label>Período *</Label>
                                    <Select
                                        value={formData.id_periodo}
                                        onValueChange={(value) => setFormData({ ...formData, id_periodo: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar período" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {periodos.map((periodo) => (
                                                <SelectItem key={periodo.id_periodo} value={periodo.id_periodo.toString()}>
                                                    {periodo.anio} - {periodo.etiqueta}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <Label>Factor de Riesgo *</Label>
                                    <Select
                                        value={formData.id_factor}
                                        onValueChange={(value) => {
                                            setFormData({ ...formData, id_factor: value, id_subfactor: '' })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar factor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {factores.map((factor) => (
                                                <SelectItem key={factor.id_factor} value={factor.id_factor.toString()}>
                                                    {factor.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <Label>Subfactor *</Label>
                                    <Select
                                        value={formData.id_subfactor}
                                        onValueChange={(value) => setFormData({ ...formData, id_subfactor: value })}
                                        disabled={!formData.id_factor}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar subfactor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getSubfactoresByFactor(parseInt(formData.id_factor)).map((subfactor) => (
                                                <SelectItem key={subfactor.id_subfactor} value={subfactor.id_subfactor.toString()}>
                                                    {subfactor.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <Label>Severidad (1-5) *</Label>
                                    <Select
                                        value={formData.severidad}
                                        onValueChange={(value) => setFormData({ ...formData, severidad: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar severidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 - Muy Baja</SelectItem>
                                            <SelectItem value="2">2 - Baja</SelectItem>
                                            <SelectItem value="3">3 - Media</SelectItem>
                                            <SelectItem value="4">4 - Alta</SelectItem>
                                            <SelectItem value="5">5 - Muy Alta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <Label>Observación</Label>
                                    <textarea
                                        value={formData.observacion}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, observacion: e.target.value })}
                                        placeholder="Observaciones adicionales..."
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </Field>

                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={handleClose}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">
                                        {isEditing ? 'Actualizar' : 'Registrar'}
                                    </Button>
                                </div>
                            </form>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Estadísticas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Factores</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estudianteFactores.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Registros de factores de riesgo
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Factores Altos</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {estudianteFactores.filter(ef => ef.severidad >= 4).length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Severidad 4-5
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(estudianteFactores.map(ef => ef.id_estudiante)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Con factores registrados
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Promedio Severidad</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {estudianteFactores.length > 0
                                    ? (estudianteFactores.reduce((acc, ef) => acc + (ef.severidad || 0), 0) / estudianteFactores.length).toFixed(1)
                                    : '0.0'
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Severidad promedio
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field>
                                <Label>Buscar</Label>
                                <Input
                                    placeholder="Buscar por estudiante o factor..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                />
                            </Field>
                            <Field>
                                <Label>Factor</Label>
                                <Select
                                    value={selectedFactor}
                                    onValueChange={(value) => {
                                        setSelectedFactor(value)
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los factores" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los factores</SelectItem>
                                        {factores.map((factor) => (
                                            <SelectItem key={factor.id_factor} value={factor.id_factor.toString()}>
                                                {factor.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla */}
                <Card>
                    <CardHeader>
                        <CardTitle>Factores de Riesgo Registrados</CardTitle>
                        <CardDescription>
                            Lista de factores de riesgo identificados en estudiantes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Estudiante</TableHead>
                                        <TableHead>Período</TableHead>
                                        <TableHead>Factor</TableHead>
                                        <TableHead>Subfactor</TableHead>
                                        <TableHead>Severidad</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentEstudianteFactores.map((estudianteFactor) => (
                                        <TableRow key={estudianteFactor.id_estudiante_factor}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {estudianteFactor.estudiante?.ap_paterno} {estudianteFactor.estudiante?.ap_materno} {estudianteFactor.estudiante?.nombres}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {estudianteFactor.estudiante?.numero_control}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {estudianteFactor.periodo?.anio} - {estudianteFactor.periodo?.etiqueta}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{estudianteFactor.factor?.nombre}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {estudianteFactor.factor?.descripcion}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{estudianteFactor.subfactor?.nombre}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {estudianteFactor.subfactor?.descripcion}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getSeveridadColor(estudianteFactor.severidad)}>
                                                    {estudianteFactor.severidad} - {getSeveridadText(estudianteFactor.severidad)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(estudianteFactor.fecha_registro).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(estudianteFactor)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(estudianteFactor.id_estudiante_factor)}
                                                            className="text-red-600"
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

                        {totalPages > 1 && (
                            <div className="mt-4">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            if (totalPages <= 7) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationLink
                                                            onClick={() => handlePageChange(page)}
                                                            isActive={currentPage === page}
                                                            className="cursor-pointer"
                                                        >
                                                            {page}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                )
                                            }

                                            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationLink
                                                            onClick={() => handlePageChange(page)}
                                                            isActive={currentPage === page}
                                                            className="cursor-pointer"
                                                        >
                                                            {page}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                )
                                            }

                                            if (page === currentPage - 2 || page === currentPage + 2) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                )
                                            }

                                            return null
                                        })}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}