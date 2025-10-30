'use client'
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
    Search,
    Plus,
    Filter,
    Download,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    ClipboardList,
    BookMarked,
    Users2,
    Calendar,
    GraduationCap,
    Clock,
    User,
    Save,
    X
} from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

export default function OfertasPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingOferta, setEditingOferta] = useState<any>(null)
    const [materias, setMaterias] = useState<any[]>([])
    const [periodos, setPeriodos] = useState<any[]>([])
    const [grupos, setGrupos] = useState<any[]>([])
    const [formData, setFormData] = useState({
        id_materia: '',
        id_periodo: '',
        id_grupo: ''
    })
    const [ofertas, setOfertas] = useState<any[]>([])
    const [filteredOfertas, setFilteredOfertas] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedMateria, setSelectedMateria] = useState('')
    const [selectedPeriodo, setSelectedPeriodo] = useState('')

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const supabase = createClient()

    useEffect(() => {
        fetchOfertas()
        fetchMaterias()
        fetchPeriodos()
        fetchGrupos()
    }, [])

    useEffect(() => {
        filterOfertas()
    }, [ofertas, searchTerm, selectedMateria, selectedPeriodo])

    const filterOfertas = () => {
        let filtered = ofertas

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(oferta =>
                oferta.materia?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                oferta.materia?.clave?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                oferta.grupo?.clave?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                oferta.periodo?.etiqueta?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filtrar por materia
        if (selectedMateria) {
            filtered = filtered.filter(oferta =>
                oferta.id_materia.toString() === selectedMateria
            )
        }

        // Filtrar por periodo
        if (selectedPeriodo) {
            filtered = filtered.filter(oferta =>
                oferta.id_periodo.toString() === selectedPeriodo
            )
        }

        setFilteredOfertas(filtered)
        setCurrentPage(1) // Reset a la primera página cuando se filtran datos
    }

    // Funciones de paginación
    const totalPages = Math.ceil(filteredOfertas.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentOfertas = filteredOfertas.slice(startIndex, endIndex)

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

        // Validar que tenemos el ID de la oferta para edición
        if (isEditing && !editingOferta?.id_oferta) {
            toast.error('Error: No se pudo identificar la oferta a editar')
            return
        }

        try {
            if (isEditing) {
                // Actualizar oferta existente
                const { error } = await supabase
                    .from('oferta')
                    .update({
                        id_materia: parseInt(formData.id_materia),
                        id_periodo: parseInt(formData.id_periodo),
                        id_grupo: parseInt(formData.id_grupo)
                    })
                    .eq('id_oferta', editingOferta?.id_oferta)

                if (error) throw error
            } else {
                // Crear nueva oferta
                const { error } = await supabase
                    .from('oferta')
                    .insert({
                        id_materia: parseInt(formData.id_materia),
                        id_periodo: parseInt(formData.id_periodo),
                        id_grupo: parseInt(formData.id_grupo)
                    })

                if (error) throw error
            }

            // Recargar datos
            await fetchOfertas()

            // Limpiar formulario y cerrar sheet
            setFormData({ id_materia: '', id_periodo: '', id_grupo: '' })
            setIsSheetOpen(false)
            setIsEditing(false)
            setEditingOferta(null)

            // Mostrar notificación de éxito
            toast.success(isEditing ? 'Oferta actualizada exitosamente' : 'Oferta creada exitosamente')

        } catch (error) {
            console.error('Error al guardar oferta:', error)
            toast.error('Error al guardar la oferta. Inténtalo de nuevo.')
        }
    }

    const fetchOfertas = async () => {
        try {
            const { data, error } = await supabase
                .from('oferta')
                .select(`
                    *,
                    materia:materia(nombre, clave),
                    periodo:periodo(etiqueta, anio),
                    grupo:grupo(clave, turno)
                `)

            if (error) throw error
            setOfertas(data || [])
        } catch (error) {
            console.error('Error al cargar ofertas:', error)
        }
    }

    const fetchMaterias = async () => {
        try {
            const { data, error } = await supabase
                .from('materia')
                .select('*')
                .order('nombre')

            if (error) throw error
            setMaterias(data || [])
        } catch (error) {
            console.error('Error al cargar materias:', error)
        }
    }

    const fetchPeriodos = async () => {
        try {
            const { data, error } = await supabase
                .from('periodo')
                .select('*')
                .order('anio', { ascending: false })

            if (error) throw error
            setPeriodos(data || [])
        } catch (error) {
            console.error('Error al cargar periodos:', error)
        }
    }

    const fetchGrupos = async () => {
        try {
            const { data, error } = await supabase
                .from('grupo')
                .select('*')
                .order('clave')

            if (error) throw error
            setGrupos(data || [])
        } catch (error) {
            console.error('Error al cargar grupos:', error)
        }
    }

    const handleEdit = (oferta: any) => {
        setEditingOferta(oferta)
        setFormData({
            id_materia: oferta.id_materia.toString(),
            id_periodo: oferta.id_periodo.toString(),
            id_grupo: oferta.id_grupo.toString()
        })
        setIsEditing(true)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta oferta?')) {
            try {
                const { error } = await supabase
                    .from('oferta')
                    .delete()
                    .eq('id_oferta', id)

                if (error) throw error
                await fetchOfertas()
                toast.success('Oferta eliminada exitosamente')
            } catch (error) {
                console.error('Error al eliminar oferta:', error)
                toast.error('Error al eliminar la oferta. Inténtalo de nuevo.')
            }
        }
    }

    const getStatusBadge = (estatus: string) => {
        switch (estatus) {
            case "Activa":
                return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>
            case "Completa":
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completa</Badge>
            case "Cancelada":
                return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelada</Badge>
            case "En Espera":
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En Espera</Badge>
            default:
                return <Badge variant="outline">Desconocido</Badge>
        }
    }

    const exportarOfertas = () => {
        const datosExportar = ofertas.map(oferta => ({
            'ID': oferta.id_oferta,
            'Materia': oferta.materia?.nombre || '',
            'Clave Materia': oferta.materia?.clave || '',
            'Período': oferta.periodo?.etiqueta || '',
            'Grupo': oferta.grupo?.clave || '',
            'Turno': oferta.grupo?.turno || '',
            'Estatus': 'Activa'
        }))

        const ws = XLSX.utils.json_to_sheet(datosExportar)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Ofertas')
        XLSX.writeFile(wb, `ofertas_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success('Ofertas exportadas exitosamente')
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Ofertas</h1>
                        <p className="text-muted-foreground">
                            Administra las ofertas académicas por periodo
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportarOfertas}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" onClick={() => {
                                    setIsEditing(false)
                                    setEditingOferta(null)
                                    setFormData({ id_materia: '', id_periodo: '', id_grupo: '' })
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Oferta
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="p-4">
                                <SheetHeader>
                                    <SheetTitle>
                                        {isEditing ? 'Editar Oferta' : 'Nueva Oferta'}
                                    </SheetTitle>
                                    <SheetDescription>
                                        {isEditing ? 'Modifica los datos de la oferta' : 'Agrega una nueva oferta al sistema'}
                                    </SheetDescription>
                                </SheetHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="materia">Materia</Label>
                                        <select
                                            id="materia"
                                            value={formData.id_materia}
                                            onChange={(e) => setFormData({ ...formData, id_materia: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Selecciona una materia</option>
                                            {materias.map((materia) => (
                                                <option key={materia.id_materia} value={materia.id_materia}>
                                                    {materia.nombre} ({materia.clave})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="periodo">Periodo</Label>
                                        <select
                                            id="periodo"
                                            value={formData.id_periodo}
                                            onChange={(e) => setFormData({ ...formData, id_periodo: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Selecciona un periodo</option>
                                            {periodos.map((periodo) => (
                                                <option key={periodo.id_periodo} value={periodo.id_periodo}>
                                                    {periodo.etiqueta} ({periodo.anio})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="grupo">Grupo</Label>
                                        <select
                                            id="grupo"
                                            value={formData.id_grupo}
                                            onChange={(e) => setFormData({ ...formData, id_grupo: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Selecciona un grupo</option>
                                            {grupos.map((grupo) => (
                                                <option key={grupo.id_grupo} value={grupo.id_grupo}>
                                                    {grupo.clave} ({grupo.turno})
                                                </option>
                                            ))}
                                        </select>
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
                            Busca y filtra ofertas por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por materia, docente o grupo..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={selectedMateria}
                                    onChange={(e) => setSelectedMateria(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todas las materias</option>
                                    {materias.map((materia) => (
                                        <option key={materia.id_materia} value={materia.id_materia}>
                                            {materia.nombre}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedPeriodo}
                                    onChange={(e) => setSelectedPeriodo(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos los periodos</option>
                                    {periodos.map((periodo) => (
                                        <option key={periodo.id_periodo} value={periodo.id_periodo}>
                                            {periodo.etiqueta}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de ofertas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Ofertas</CardTitle>
                        <CardDescription>
                            {filteredOfertas.length} de {ofertas.length} ofertas registradas en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Materia</TableHead>
                                        <TableHead>Grupo</TableHead>
                                        <TableHead>Periodo</TableHead>
                                        <TableHead>Turno</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentOfertas.map((oferta) => (
                                        <TableRow key={oferta.id_oferta}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <BookMarked className="h-4 w-4 text-green-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{oferta.materia?.nombre || 'Sin materia'}</div>
                                                        <div className="text-sm text-muted-foreground">{oferta.materia?.clave || ''}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users2 className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {oferta.grupo?.clave || 'Sin grupo'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {oferta.periodo?.etiqueta || 'Sin periodo'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {oferta.grupo?.turno || 'Sin turno'}
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
                                                        <DropdownMenuItem onClick={() => handleEdit(oferta)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(oferta.id_oferta)}
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
                            <CardTitle className="text-sm font-medium">Total Ofertas</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ofertas.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ofertas Activas</CardTitle>
                            <ClipboardList className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ofertas.filter(o => o.estatus === "Activa").length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Inscritos</CardTitle>
                            <User className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ofertas.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ofertas.length * 30}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}