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
import { Textarea } from "@/components/ui/textarea"
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
    AlertCircle,
    Layers,
    BookOpen,
    Heart,
    DollarSign,
    Home,
    Stethoscope,
    Building,
    Laptop,
    HelpCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function FactoresConfigPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingFactor, setEditingFactor] = useState<any>(null)
    const [factores, setFactores] = useState<any[]>([])
    const [subfactores, setSubfactores] = useState<any[]>([])
    const [estudianteFactores, setEstudianteFactores] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFactor, setSelectedFactor] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [activeTab, setActiveTab] = useState('registros')

    const [formData, setFormData] = useState({
        nombre: '',
        categoria: '',
        descripcion: '',
        id_factor: ''
    })

    const supabase = createClient()

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchFactores(),
                    fetchSubfactores(),
                    fetchEstudianteFactores()
                ])
                setLoading(false)
            } catch (error) {
                console.error('Error al cargar datos:', error)
                setLoading(false)
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
            throw error
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

            if (error) {
                console.error('Error de Supabase en subfactores:', error)
                throw error
            }
            setSubfactores(data || [])
        } catch (error) {
            console.error('Error al cargar subfactores:', error)
            toast.error('Error al cargar subfactores')
            throw error
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

            if (error) {
                console.error('Error de Supabase en estudiante_factores:', error)
                throw error
            }
            setEstudianteFactores(data || [])
        } catch (error) {
            console.error('Error al cargar factores de estudiantes:', error)
            toast.error('Error al cargar factores de estudiantes')
            throw error
        }
    }

    const filterFactores = () => {
        let filtered = factores

        if (searchTerm) {
            filtered = filtered.filter(factor =>
                factor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                factor.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        return filtered
    }

    const filterSubfactores = () => {
        let filtered = subfactores

        if (searchTerm) {
            filtered = filtered.filter(subfactor =>
                subfactor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subfactor.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subfactor.factor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (selectedFactor && selectedFactor !== 'all') {
            filtered = filtered.filter(subfactor => subfactor.id_factor === parseInt(selectedFactor))
        }

        return filtered
    }

    const filterRegistros = () => {
        let filtered = estudianteFactores

        if (searchTerm) {
            filtered = filtered.filter((ef: any) =>
                ef.factor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ef.subfactor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ef.estudiante?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ef.estudiante?.ap_paterno?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (selectedFactor && selectedFactor !== 'all') {
            filtered = filtered.filter((ef: any) => ef.id_factor === parseInt(selectedFactor))
        }

        return filtered
    }

    const getCurrentData = () => {
        switch (activeTab) {
            case 'factores': return filterFactores()
            case 'subfactores': return filterSubfactores()
            case 'registros': return filterRegistros()
            default: return []
        }
    }

    const currentData = getCurrentData()
    const totalPages = Math.ceil(currentData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = currentData.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar nombre
        const nombreTrimmed = formData.nombre.trim()
        if (!nombreTrimmed) {
            toast.error('El nombre es requerido y no puede estar vacío')
            return
        }

        // Validar longitud mínima del nombre
        if (nombreTrimmed.length < 3) {
            toast.error('El nombre debe tener al menos 3 caracteres')
            return
        }

        // Validar descripción si se proporciona (no solo espacios)
        const descripcionTrimmed = formData.descripcion?.trim() || null
        if (formData.descripcion && descripcionTrimmed && descripcionTrimmed.length === 0) {
            toast.error('La descripción no puede contener solo espacios')
            return
        }

        if (activeTab === 'subfactores') {
            if (!formData.id_factor) {
                toast.error('Debe seleccionar un factor')
                return
            }

            // Validar que el factor sea un número válido
            const factorNum = parseInt(formData.id_factor)
            if (isNaN(factorNum)) {
                toast.error('El factor seleccionado no es válido')
                return
            }
        }

        try {
            if (activeTab === 'factores') {
                if (isEditing && editingFactor) {
                    // Actualizar factor
                    const { error } = await supabase
                        .from('factor')
                        .update({
                            nombre: nombreTrimmed,
                            categoria: formData.categoria?.trim() || null
                        })
                        .eq('id_factor', editingFactor.id_factor)

                    if (error) throw error
                    toast.success('Factor actualizado correctamente')
                } else {
                    // Crear factor
                    const { error } = await supabase
                        .from('factor')
                        .insert({
                            nombre: nombreTrimmed,
                            categoria: formData.categoria?.trim() || null
                        })

                    if (error) throw error
                    toast.success('Factor creado correctamente')
                }
                fetchFactores()
            } else {
                const factorNum = parseInt(formData.id_factor)
                if (isEditing && editingFactor) {
                    // Actualizar subfactor
                    const { error } = await supabase
                        .from('subfactor')
                        .update({
                            nombre: nombreTrimmed,
                            descripcion: descripcionTrimmed,
                            id_factor: factorNum
                        })
                        .eq('id_subfactor', editingFactor.id_subfactor)

                    if (error) throw error
                    toast.success('Subfactor actualizado correctamente')
                } else {
                    // Crear subfactor
                    const { error } = await supabase
                        .from('subfactor')
                        .insert({
                            nombre: nombreTrimmed,
                            descripcion: descripcionTrimmed,
                            id_factor: factorNum
                        })

                    if (error) throw error
                    toast.success('Subfactor creado correctamente')
                }
                fetchSubfactores()
            }

            handleClose()
        } catch (error) {
            console.error('Error al guardar:', error)
            toast.error('Error al guardar')
        }
    }

    const handleEdit = (item: any) => {
        if (activeTab === 'factores') {
            setEditingFactor(item)
            setFormData({
                nombre: item.nombre,
                categoria: item.categoria || '',
                descripcion: '',
                id_factor: ''
            })
        } else {
            setEditingFactor(item)
            setFormData({
                nombre: item.nombre,
                categoria: '',
                descripcion: item.descripcion || '',
                id_factor: item.id_factor?.toString() || ''
            })
        }
        setIsEditing(true)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: number, type: 'factor' | 'subfactor' | 'estudiante_factor') => {
        if (!confirm(`¿Estás seguro de que quieres eliminar este ${type}?`)) return

        try {
            let table: string
            let idField: string

            if (type === 'factor') {
                table = 'factor'
                idField = 'id_factor'
            } else if (type === 'subfactor') {
                table = 'subfactor'
                idField = 'id_subfactor'
            } else {
                table = 'estudiante_factor'
                idField = 'id_estudiante_factor'
            }

            const { error } = await supabase
                .from(table)
                .delete()
                .eq(idField, id)

            if (error) throw error
            toast.success(`${type === 'factor' ? 'Factor' : type === 'subfactor' ? 'Subfactor' : 'Registro'} eliminado correctamente`)

            if (type === 'factor') {
                fetchFactores()
            } else if (type === 'subfactor') {
                fetchSubfactores()
            } else {
                fetchEstudianteFactores()
            }
        } catch (error) {
            console.error(`Error al eliminar ${type}:`, error)
            toast.error(`Error al eliminar ${type}`)
        }
    }

    const handleClose = () => {
        setIsSheetOpen(false)
        setIsEditing(false)
        setEditingFactor(null)
        setFormData({
            nombre: '',
            categoria: '',
            descripcion: '',
            id_factor: ''
        })
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setCurrentPage(1)
        setSearchTerm('')
        setSelectedFactor('all')
    }

    const getCategoriaIcon = (categoria: string) => {
        switch (categoria) {
            case 'Académico': return <BookOpen className="h-4 w-4 text-blue-500" />
            case 'Psicosocial': return <Heart className="h-4 w-4 text-pink-500" />
            case 'Económico': return <DollarSign className="h-4 w-4 text-green-500" />
            case 'Familiar': return <Home className="h-4 w-4 text-orange-500" />
            case 'Salud': return <Stethoscope className="h-4 w-4 text-red-500" />
            case 'Institucional': return <Building className="h-4 w-4 text-purple-500" />
            case 'Tecnológico': return <Laptop className="h-4 w-4 text-cyan-500" />
            default: return <HelpCircle className="h-4 w-4 text-gray-500" />
        }
    }

    const getSeveridadColor = (severidad: number) => {
        if (severidad >= 4) return 'bg-red-100 text-red-800 border-red-200'
        if (severidad === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        return 'bg-green-100 text-green-800 border-green-200'
    }

    const getSeveridadText = (severidad: number) => {
        if (severidad >= 4) return 'Alto'
        if (severidad === 3) return 'Medio'
        return 'Bajo'
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Cargando configuración...</p>
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
                        <h1 className="text-3xl font-bold tracking-tight">Configuración de Factores</h1>
                        <p className="text-muted-foreground">
                            Gestión de factores y subfactores de riesgo
                        </p>
                    </div>
                    {activeTab !== 'registros' && (
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button onClick={handleClose}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    {activeTab === 'factores' ? 'Nuevo Factor' : 'Nuevo Subfactor'}
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="p-4 min-w-[500px]">
                                <SheetHeader>
                                    <SheetTitle>
                                        {isEditing
                                            ? `Editar ${activeTab === 'factores' ? 'Factor' : 'Subfactor'}`
                                            : `Crear ${activeTab === 'factores' ? 'Factor' : 'Subfactor'}`
                                        }
                                    </SheetTitle>
                                    <SheetDescription>
                                        {isEditing
                                            ? `Modifica la información del ${activeTab === 'factores' ? 'factor' : 'subfactor'}`
                                            : `Crea un nuevo ${activeTab === 'factores' ? 'factor' : 'subfactor'} de riesgo`
                                        }
                                    </SheetDescription>
                                </SheetHeader>

                                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                    {activeTab === 'subfactores' && (
                                        <Field>
                                            <Label>Factor *</Label>
                                            <Select
                                                value={formData.id_factor}
                                                onValueChange={(value) => setFormData({ ...formData, id_factor: value })}
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
                                    )}

                                    <Field>
                                        <Label>Nombre *</Label>
                                        <Input
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            placeholder={`Nombre del ${activeTab === 'factores' ? 'factor' : 'subfactor'}`}
                                        />
                                    </Field>

                                    {activeTab === 'factores' ? (
                                        <Field>
                                            <Label>Categoría</Label>
                                            <Select
                                                value={formData.categoria}
                                                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar categoría" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Académico">Académico</SelectItem>
                                                    <SelectItem value="Psicosocial">Psicosocial</SelectItem>
                                                    <SelectItem value="Económico">Económico</SelectItem>
                                                    <SelectItem value="Familiar">Familiar</SelectItem>
                                                    <SelectItem value="Salud">Salud</SelectItem>
                                                    <SelectItem value="Institucional">Institucional</SelectItem>
                                                    <SelectItem value="Tecnológico">Tecnológico</SelectItem>
                                                    <SelectItem value="Otro">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    ) : (
                                        <Field>
                                            <Label>Descripción</Label>
                                            <textarea
                                                value={formData.descripcion}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descripcion: e.target.value })}
                                                placeholder="Descripción detallada del subfactor"
                                                rows={3}
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                        </Field>
                                    )}

                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={handleClose}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit">
                                            {isEditing ? 'Actualizar' : 'Crear'}
                                        </Button>
                                    </div>
                                </form>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>

                {/* Estadísticas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Factores</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{factores.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Factores de riesgo
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Subfactores</CardTitle>
                            <Layers className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{subfactores.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Subfactores registrados
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Promedio Subfactores</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {factores.length > 0
                                    ? (subfactores.length / factores.length).toFixed(1)
                                    : '0.0'
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Por factor
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Factores Activos</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {factores.filter(f => subfactores.some(sf => sf.id_factor === f.id_factor)).length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Con subfactores
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                    <Button
                        variant={activeTab === 'registros' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleTabChange('registros')}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Registros
                    </Button>
                    <Button
                        variant={activeTab === 'factores' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleTabChange('factores')}
                    >
                        <Target className="h-4 w-4 mr-2" />
                        Factores
                    </Button>
                    <Button
                        variant={activeTab === 'subfactores' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleTabChange('subfactores')}
                    >
                        <Layers className="h-4 w-4 mr-2" />
                        Subfactores
                    </Button>
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
                                    placeholder={`Buscar ${activeTab}...`}
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                />
                            </Field>
                            {activeTab === 'subfactores' && (
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
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {activeTab === 'registros' ? 'Registros de Factores de Riesgo' :
                                activeTab === 'factores' ? 'Factores de Riesgo' : 'Subfactores de Riesgo'}
                        </CardTitle>
                        <CardDescription>
                            {activeTab === 'registros' ? 'Registros de factores de riesgo identificados en estudiantes' :
                                activeTab === 'factores' ? 'Lista de factores de riesgo configurados' : 'Lista de subfactores de riesgo configurados'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {activeTab === 'registros' ? (
                                            <>
                                                <TableHead>Factor</TableHead>
                                                <TableHead>Categoría</TableHead>
                                                <TableHead>Severidad</TableHead>
                                                <TableHead>Estudiantes Afectados</TableHead>
                                                <TableHead>Período</TableHead>
                                                <TableHead>Fecha Registro</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </>
                                        ) : (
                                            <>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>{activeTab === 'factores' ? 'Categoría' : 'Descripción'}</TableHead>
                                                {activeTab === 'subfactores' && <TableHead>Factor</TableHead>}
                                            </>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeTab === 'registros' ? (
                                        currentItems.map((item: any) => (
                                            <TableRow key={item.id_estudiante_factor}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{item.factor?.nombre}</div>
                                                        <div className="text-sm text-muted-foreground">{item.subfactor?.nombre}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getCategoriaIcon(item.factor?.categoria)}
                                                        <span className="text-sm">{item.factor?.categoria}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getSeveridadColor(item.severidad)}>
                                                        {item.severidad} - {getSeveridadText(item.severidad)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">1</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.periodo?.anio}-{item.periodo?.etiqueta}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(item.fecha_registro).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        currentItems.map((item: any) => (
                                            <TableRow key={activeTab === 'factores' ? item.id_factor : item.id_subfactor}>
                                                <TableCell>
                                                    <div className="font-medium">{item.nombre}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground">
                                                        {activeTab === 'factores'
                                                            ? (item.categoria || 'Sin categoría')
                                                            : (item.descripcion || 'Sin descripción')
                                                        }
                                                    </div>
                                                </TableCell>
                                                {activeTab === 'subfactores' && (
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {item.factor?.nombre || 'Sin factor'}
                                                        </Badge>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(
                                                                    activeTab === 'factores' ? item.id_factor : item.id_subfactor,
                                                                    activeTab === 'factores' ? 'factor' : 'subfactor'
                                                                )}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
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
