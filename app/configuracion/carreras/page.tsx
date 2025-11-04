'use client'
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
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
    GraduationCap,
    Building,
    Users,
    BookOpen,
    Save,
    X
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

export default function CarrerasPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingCarrera, setEditingCarrera] = useState<any>(null)
    const [departamentos, setDepartamentos] = useState<any[]>([])
    const [formData, setFormData] = useState({
        nombre: '',
        clave: '',
        id_departamento: ''
    })
    const [carreras, setCarreras] = useState<any[]>([])
    const [filteredCarreras, setFilteredCarreras] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDepartamento, setSelectedDepartamento] = useState('')

    const supabase = createClient()

    useEffect(() => {
        fetchCarreras()
        fetchDepartamentos()
    }, [])

    useEffect(() => {
        filterCarreras()
    }, [carreras, searchTerm, selectedDepartamento])

    const filterCarreras = () => {
        let filtered = carreras

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(carrera =>
                carrera.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                carrera.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
                carrera.departamento?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filtrar por departamento
        if (selectedDepartamento) {
            filtered = filtered.filter(carrera =>
                carrera.id_departamento.toString() === selectedDepartamento
            )
        }

        setFilteredCarreras(filtered)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar que tenemos el ID de la carrera para edición
        if (isEditing && !editingCarrera?.id_carrera) {
            toast.error('Error: No se pudo identificar la carrera a editar')
            return
        }

        // Validar campos requeridos
        const nombreTrimmed = formData.nombre.trim()
        const claveTrimmed = formData.clave.trim()

        if (!nombreTrimmed) {
            toast.error('El nombre de la carrera es requerido')
            return
        }

        if (!claveTrimmed) {
            toast.error('La clave de la carrera es requerida')
            return
        }

        // Validar longitud mínima
        if (nombreTrimmed.length < 3) {
            toast.error('El nombre de la carrera debe tener al menos 3 caracteres')
            return
        }

        if (claveTrimmed.length < 2) {
            toast.error('La clave de la carrera debe tener al menos 2 caracteres')
            return
        }

        // Validar que el departamento sea un número válido
        const departamentoNum = parseInt(formData.id_departamento)
        if (!formData.id_departamento || isNaN(departamentoNum)) {
            toast.error('Debe seleccionar un departamento válido')
            return
        }

        try {
            if (isEditing) {
                // Actualizar carrera existente
                const { error } = await supabase
                    .from('carrera')
                    .update({
                        nombre: nombreTrimmed,
                        clave: claveTrimmed,
                        id_departamento: departamentoNum
                    })
                    .eq('id_carrera', editingCarrera?.id_carrera)

                if (error) throw error
            } else {
                // Crear nueva carrera
                const { error } = await supabase
                    .from('carrera')
                    .insert({
                        nombre: nombreTrimmed,
                        clave: claveTrimmed,
                        id_departamento: departamentoNum
                    })

                if (error) throw error
            }

            // Recargar datos
            await fetchCarreras()
            await fetchDepartamentos()

            // Limpiar formulario y cerrar sheet
            setFormData({ nombre: '', clave: '', id_departamento: '' })
            setIsSheetOpen(false)
            setIsEditing(false)
            setEditingCarrera(null)

            // Mostrar notificación de éxito
            toast.success(isEditing ? 'Carrera actualizada exitosamente' : 'Carrera creada exitosamente')

        } catch (error) {
            console.error('Error al guardar carrera:', error)
            toast.error('Error al guardar la carrera. Inténtalo de nuevo.')
        }
    }

    const fetchCarreras = async () => {
        try {
            const { data, error } = await supabase
                .from('carrera')
                .select(`
                    *,
                    departamento:departamento(nombre),
                    estudiantes:estudiante(count)
                `)

            if (error) throw error
            setCarreras(data || [])
        } catch (error) {
            console.error('Error al cargar carreras:', error)
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

    const handleEdit = (carrera: any) => {
        setEditingCarrera(carrera)
        setFormData({
            nombre: carrera.nombre,
            clave: carrera.clave,
            id_departamento: carrera.id_departamento.toString()
        })
        setIsEditing(true)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta carrera?')) {
            try {
                const { error } = await supabase
                    .from('carrera')
                    .delete()
                    .eq('id_carrera', id)

                if (error) throw error
                await fetchCarreras()
                toast.success('Carrera eliminada exitosamente')
            } catch (error) {
                console.error('Error al eliminar carrera:', error)
                toast.error('Error al eliminar la carrera. Inténtalo de nuevo.')
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

    const exportarCarreras = () => {
        const datosExportar = carreras.map(carrera => ({
            'ID': carrera.id_carrera,
            'Nombre': carrera.nombre,
            'Clave': carrera.clave || '',
            'Departamento': carrera.departamento?.nombre || '',
            'Estatus': 'Activa'
        }))

        const ws = XLSX.utils.json_to_sheet(datosExportar)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Carreras')
        XLSX.writeFile(wb, `carreras_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success('Carreras exportadas exitosamente')
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Carreras</h1>
                        <p className="text-muted-foreground">
                            Administra los programas académicos y sus configuraciones
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportarCarreras}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" onClick={() => {
                                    setIsEditing(false)
                                    setEditingCarrera(null)
                                    setFormData({ nombre: '', clave: '', id_departamento: '' })
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Carrera
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="p-4">
                                <SheetHeader>
                                    <SheetTitle>
                                        {isEditing ? 'Editar Carrera' : 'Nueva Carrera'}
                                    </SheetTitle>
                                    <SheetDescription>
                                        {isEditing ? 'Modifica los datos de la carrera' : 'Agrega una nueva carrera al sistema'}
                                    </SheetDescription>
                                </SheetHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre de la Carrera</Label>
                                        <Input
                                            id="nombre"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            placeholder="Ing. Sistemas Computacionales"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="clave">Clave</Label>
                                        <Input
                                            id="clave"
                                            value={formData.clave}
                                            onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                                            placeholder="ISC"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="departamento">Departamento</Label>
                                        <select
                                            id="departamento"
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
                            Busca y filtra carreras por diferentes criterios
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

                {/* Tabla de carreras */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Carreras</CardTitle>
                        <CardDescription>
                            {filteredCarreras.length} de {carreras.length} carreras registradas en el sistema
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
                                        <TableHead>Estudiantes</TableHead>
                                        <TableHead>Estatus</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCarreras.map((carrera) => (
                                        <TableRow key={carrera.id_carrera}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <GraduationCap className="h-4 w-4 text-blue-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{carrera.nombre}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{carrera.clave}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Building className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {carrera.departamento?.nombre || 'Sin departamento'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {carrera.estudiantes?.[0]?.count || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant="outline">Activa</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(carrera)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(carrera.id_carrera)}
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
                    </CardContent>
                </Card>

                {/* Estadísticas rápidas */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Carreras</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{carreras.reduce((acc, c) => acc + (c.estudiantes?.[0]?.count || 0), 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Carreras Activas</CardTitle>
                            <GraduationCap className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{carreras.filter(c => c.estatus === "Activa").length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{carreras.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
                            <Building className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Set(carreras.map(c => c.departamento)).size}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
