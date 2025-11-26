'use client'
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
    Search,
    Plus,
    Filter,
    Download,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    BookMarked,
    Building,
    Users,
    Clock,
    BookOpen,
    Save,
    X
} from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { MateriaService } from "@/lib/services/materia-service"
import { ValidationChain } from "@/lib/validators/validation-chain"
import { CommandInvoker, CreateCommand, UpdateCommand, DeleteCommand } from "@/lib/commands/command-pattern"

export default function MateriasPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingMateria, setEditingMateria] = useState<any>(null)
    const [departamentos, setDepartamentos] = useState<any[]>([])
    const [formData, setFormData] = useState({
        nombre: '',
        clave: '',
        creditos: '',
        id_departamento: ''
    })
    const [materias, setMaterias] = useState<any[]>([])
    const [filteredMaterias, setFilteredMaterias] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDepartamento, setSelectedDepartamento] = useState('')

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const supabase = createClient()
    const [materiaService] = useState(() => new MateriaService(supabase))
    const [commandInvoker] = useState(() => new CommandInvoker())

    useEffect(() => {
        fetchMaterias()
        fetchDepartamentos()
    }, [])

    useEffect(() => {
        filterMaterias()
    }, [materias, searchTerm, selectedDepartamento])

    const filterMaterias = () => {
        let filtered = materias

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(materia =>
                materia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                materia.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
                materia.departamento?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filtrar por departamento
        if (selectedDepartamento) {
            filtered = filtered.filter(materia =>
                materia.id_departamento.toString() === selectedDepartamento
            )
        }

        setFilteredMaterias(filtered)
        setCurrentPage(1) // Reset a la primera página cuando se filtran datos
    }

    // Funciones de paginación
    const totalPages = Math.ceil(filteredMaterias.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentMaterias = filteredMaterias.slice(startIndex, endIndex)

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
        const validaciones = [
            { field: 'nombre', label: 'Nombre', value: formData.nombre, chain: new ValidationChain().required().minLength(3) },
            { field: 'clave', label: 'Clave', value: formData.clave, chain: new ValidationChain().required().minLength(2) },
            { field: 'id_departamento', label: 'Departamento', value: formData.id_departamento, chain: new ValidationChain().required() },
        ]

        for (const { field, label, value, chain } of validaciones) {
            const result = await chain.validate(formData, field, value)
            if (!result.isValid) {
                toast.error(result.error || `El campo "${label}" es inválido`)
                return false
            }
        }

        const creditosNum = parseInt(formData.creditos)
        if (!formData.creditos || isNaN(creditosNum) || creditosNum < 1 || creditosNum > 20) {
            toast.error('Los créditos deben ser un número entre 1 y 20')
            return false
        }

        const departamentoNum = parseInt(formData.id_departamento)
        if (isNaN(departamentoNum)) {
            toast.error('Debe seleccionar un departamento válido')
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!(await validateForm())) {
            return
        }

        if (isEditing && !editingMateria?.id_materia) {
            toast.error('Error: No se pudo identificar la materia a editar')
            return
        }

        try {
            const nombreTrimmed = formData.nombre.trim()
            const claveTrimmed = formData.clave.trim()
            const creditosNum = parseInt(formData.creditos)
            const departamentoNum = parseInt(formData.id_departamento)

            const materiaData = {
                nombre: nombreTrimmed,
                clave: claveTrimmed,
                creditos: creditosNum,
                id_departamento: departamentoNum
            }

            if (isEditing && editingMateria) {
                const updateCmd = new UpdateCommand(
                    async (id: string | number, data: any) => await materiaService.update(id, data as any),
                    async (id: string | number) => await materiaService.getById(id) as any,
                    editingMateria.id_materia,
                    materiaData
                ) as any

                const result = await commandInvoker.execute(updateCmd)
                if (!result.success) {
                    throw result.error || new Error('Error al actualizar')
                }
            } else {
                const createCmd = new CreateCommand(
                    async (data: any) => await materiaService.create(data as any),
                    async (id: string | number) => await materiaService.delete(id) as unknown as Promise<void>,
                    materiaData as any
                ) as any

                const result = await commandInvoker.execute(createCmd)
                if (!result.success) {
                    throw result.error || new Error('Error al crear')
                }
            }

            await fetchMaterias()
            await fetchDepartamentos()
            setFormData({ nombre: '', clave: '', creditos: '', id_departamento: '' })
            setIsSheetOpen(false)
            setIsEditing(false)
            setEditingMateria(null)
            toast.success(isEditing ? 'Materia actualizada exitosamente' : 'Materia creada exitosamente')

        } catch (error: any) {
            console.error('Error al guardar materia:', error)
            toast.error(error?.message || 'Error al guardar la materia. Inténtalo de nuevo.')
        }
    }

    const fetchMaterias = async () => {
        try {
            const data = await materiaService.getMateriasConRelaciones()
            setMaterias(data)
        } catch (error) {
            console.error('Error al cargar materias:', error)
            toast.error('Error al cargar las materias')
        }
    }

    const fetchDepartamentos = async () => {
        try {
            const { data, error } = await supabase
                .from('departamento')
                .select('*')
                .order('nombre')

            if (error) throw error
            setDepartamentos(data || [])
        } catch (error) {
            console.error('Error al cargar departamentos:', error)
        }
    }

    const handleEdit = (materia: any) => {
        setEditingMateria(materia)
        setFormData({
            nombre: materia.nombre,
            clave: materia.clave,
            creditos: materia.creditos.toString(),
            id_departamento: materia.id_departamento.toString()
        })
        setIsEditing(true)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
            try {
                const deleteCmd = new DeleteCommand(
                    async (id: string | number) => await materiaService.delete(id) as unknown as Promise<void>,
                    async (data: any) => await materiaService.create(data as any),
                    id,
                    async (id) => await materiaService.getById(id)
                ) as any

                const result = await commandInvoker.execute(deleteCmd)
                if (!result.success) {
                    throw result.error || new Error('Error al eliminar')
                }

                await fetchMaterias()
                toast.success('Materia eliminada exitosamente')
            } catch (error: any) {
                console.error('Error al eliminar materia:', error)
                toast.error(error?.message || 'Error al eliminar la materia. Inténtalo de nuevo.')
            }
        }
    }

    const getStatusBadge = (estatus: string) => {
        switch (estatus) {
            case "Activa":
                return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>
            case "Inactiva":
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactiva</Badge>
            case "En Revisión":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En Revisión</Badge>
            default:
                return <Badge variant="outline">Desconocido</Badge>
        }
    }

    const exportarMaterias = () => {
        const datosExportar = materias.map(materia => ({
            'ID': materia.id_materia,
            'Clave': materia.clave,
            'Nombre': materia.nombre,
            'Créditos': materia.creditos || 0,
            'Departamento': materia.departamento?.nombre || '',
            'Estatus': 'Activa'
        }))

        const ws = XLSX.utils.json_to_sheet(datosExportar)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Materias')
        XLSX.writeFile(wb, `materias_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success('Materias exportadas exitosamente')
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Materias</h1>
                        <p className="text-muted-foreground">
                            Administra las materias y sus contenidos curriculares
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportarMaterias}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" onClick={() => {
                                    setIsEditing(false)
                                    setEditingMateria(null)
                                    setFormData({ nombre: '', clave: '', creditos: '', id_departamento: '' })
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Materia
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="p-4">
                                <SheetHeader>
                                    <SheetTitle>
                                        {isEditing ? 'Editar Materia' : 'Nueva Materia'}
                                    </SheetTitle>
                                    <SheetDescription>
                                        {isEditing ? 'Modifica los datos de la materia' : 'Agrega una nueva materia al sistema'}
                                    </SheetDescription>
                                </SheetHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 mt-6" aria-label={isEditing ? 'Formulario para editar materia' : 'Formulario para crear nueva materia'}>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="nombre" required>Nombre de la Materia</Label>
                                            <FieldHelp
                                                description="Nombre completo de la materia académica. Ejemplo: Cálculo Diferencial, Programación Orientada a Objetos, etc."
                                                id="help-nombre-materia"
                                            />
                                        </div>
                                        <Input
                                            id="nombre"
                                            aria-label="Nombre de la materia"
                                            aria-describedby="help-nombre-materia"
                                            aria-required="true"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            placeholder="Cálculo Diferencial"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="clave" required>Clave</Label>
                                            <FieldHelp
                                                description="Código único de identificación de la materia. Ejemplo: CAL-001, PRO-101, etc."
                                                id="help-clave-materia"
                                            />
                                        </div>
                                        <Input
                                            id="clave"
                                            aria-label="Clave de la materia"
                                            aria-describedby="help-clave-materia"
                                            aria-required="true"
                                            value={formData.clave}
                                            onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                                            placeholder="CAL-001"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="creditos" required>Créditos</Label>
                                            <FieldHelp
                                                description="Número de créditos académicos que vale la materia. Generalmente entre 3 y 8 créditos."
                                                id="help-creditos-materia"
                                            />
                                        </div>
                                        <Input
                                            id="creditos"
                                            type="number"
                                            aria-label="Créditos de la materia"
                                            aria-describedby="help-creditos-materia"
                                            aria-required="true"
                                            min="1"
                                            max="10"
                                            value={formData.creditos}
                                            onChange={(e) => setFormData({ ...formData, creditos: e.target.value })}
                                            placeholder="4"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="departamento" required>Departamento</Label>
                                            <FieldHelp
                                                description="Departamento académico responsable de la materia."
                                                id="help-departamento-materia"
                                            />
                                        </div>
                                        <select
                                            id="departamento"
                                            aria-label="Departamento de la materia"
                                            aria-describedby="help-departamento-materia"
                                            aria-required="true"
                                            value={formData.id_departamento}
                                            onChange={(e) => setFormData({ ...formData, id_departamento: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Selecciona un departamento</option>
                                            {departamentos.map((dept) => (
                                                <option key={dept.id_departamento} value={dept.id_departamento}>
                                                    {dept.nombre}
                                                </option>
                                            ))}
                                        </select>
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
                            Busca y filtra materias por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, clave o departamento..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <NativeSelect
                                    value={selectedDepartamento}
                                    onChange={(e) => setSelectedDepartamento(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <NativeSelectOption value="">Todos los departamentos</NativeSelectOption>
                                    {departamentos.map((dept) => (
                                        <NativeSelectOption key={dept.id_departamento} value={String(dept.id_departamento)}>
                                            {dept.nombre}
                                        </NativeSelectOption>
                                    ))}
                                </NativeSelect>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de materias */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Materias</CardTitle>
                        <CardDescription>
                            {filteredMaterias.length} de {materias.length} materias registradas en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Clave</TableHead>
                                        <TableHead>Departamento</TableHead>
                                        <TableHead>Créditos</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentMaterias.map((materia) => (
                                        <TableRow key={materia.id_materia}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <BookMarked className="h-4 w-4 text-green-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{materia.nombre}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{materia.clave}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Building className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {materia.departamento?.nombre || 'Sin departamento'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {materia.creditos}
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
                                                        <DropdownMenuItem onClick={() => handleEdit(materia)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(materia.id_materia)}
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
                            <CardTitle className="text-sm font-medium">Total Materias</CardTitle>
                            <BookMarked className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{materias.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Materias Activas</CardTitle>
                            <BookMarked className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{materias.filter(m => m.estatus === "Activa").length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
                            <Building className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Set(materias.map(m => m.departamento?.nombre)).size}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Promedio Créditos</CardTitle>
                            <BookOpen className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {materias.length > 0 ? Math.round(materias.reduce((acc, curr) => acc + curr.creditos, 0) / materias.length) : 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}