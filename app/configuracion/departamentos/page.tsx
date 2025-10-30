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
    Building,
    Users,
    BookMarked,
    GraduationCap,
    Phone,
    Mail,
    MapPin,
    Save,
    X
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

export default function DepartamentosPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingDepartamento, setEditingDepartamento] = useState<any>(null)
    const [formData, setFormData] = useState({
        nombre: ''
    })
    const [departamentos, setDepartamentos] = useState<any[]>([])
    const [filteredDepartamentos, setFilteredDepartamentos] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    const supabase = createClient()

    useEffect(() => {
        fetchDepartamentos()
    }, [])

    useEffect(() => {
        filterDepartamentos()
    }, [departamentos, searchTerm])

    const filterDepartamentos = () => {
        let filtered = departamentos

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(departamento =>
                departamento.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredDepartamentos(filtered)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar que tenemos el ID del departamento para edición
        if (isEditing && !editingDepartamento?.id_departamento) {
            toast.error('Error: No se pudo identificar el departamento a editar')
            return
        }

        try {
            if (isEditing) {
                // Actualizar departamento existente
                const { error } = await supabase
                    .from('departamento')
                    .update({
                        nombre: formData.nombre
                    })
                    .eq('id_departamento', editingDepartamento?.id_departamento)

                if (error) throw error
            } else {
                // Crear nuevo departamento
                const { error } = await supabase
                    .from('departamento')
                    .insert({
                        nombre: formData.nombre
                    })

                if (error) throw error
            }

            // Recargar datos
            await fetchDepartamentos()

            // Limpiar formulario y cerrar sheet
            setFormData({ nombre: '' })
            setIsSheetOpen(false)
            setIsEditing(false)
            setEditingDepartamento(null)

            // Mostrar notificación de éxito
            toast.success(isEditing ? 'Departamento actualizado exitosamente' : 'Departamento creado exitosamente')

        } catch (error) {
            console.error('Error al guardar departamento:', error)
            toast.error('Error al guardar el departamento. Inténtalo de nuevo.')
        }
    }

    const fetchDepartamentos = async () => {
        try {
            const { data, error } = await supabase
                .from('departamento')
                .select(`
                    *,
                    carreras:carrera(count),
                    materias:materia(count)
                `)
                .order('nombre')

            if (error) throw error
            setDepartamentos(data || [])
        } catch (error) {
            console.error('Error al cargar departamentos:', error)
        }
    }

    const handleEdit = (departamento: any) => {
        setEditingDepartamento(departamento)
        setFormData({
            nombre: departamento.nombre
        })
        setIsEditing(true)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este departamento?')) {
            try {
                const { error } = await supabase
                    .from('departamento')
                    .delete()
                    .eq('id_departamento', id)

                if (error) throw error
                await fetchDepartamentos()
                toast.success('Departamento eliminado exitosamente')
            } catch (error) {
                console.error('Error al eliminar departamento:', error)
                toast.error('Error al eliminar el departamento. Inténtalo de nuevo.')
            }
        }
    }

    const getStatusBadge = (estatus: string) => {
        switch (estatus) {
            case "Activo":
                return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>
            case "Inactivo":
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactivo</Badge>
            case "En Reorganización":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En Reorganización</Badge>
            default:
                return <Badge variant="outline">Desconocido</Badge>
        }
    }

    const exportarDepartamentos = () => {
        const datosExportar = departamentos.map(departamento => ({
            'ID': departamento.id_departamento,
            'Nombre': departamento.nombre,
            'Estatus': 'Activo'
        }))

        const ws = XLSX.utils.json_to_sheet(datosExportar)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Departamentos')
        XLSX.writeFile(wb, `departamentos_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success('Departamentos exportados exitosamente')
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Departamentos</h1>
                        <p className="text-muted-foreground">
                            Configura los departamentos académicos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportarDepartamentos}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" onClick={() => {
                                    setIsEditing(false)
                                    setEditingDepartamento(null)
                                    setFormData({ nombre: '' })
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nuevo Departamento
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="p-4">
                                <SheetHeader>
                                    <SheetTitle>
                                        {isEditing ? 'Editar Departamento' : 'Nuevo Departamento'}
                                    </SheetTitle>
                                    <SheetDescription>
                                        {isEditing ? 'Modifica los datos del departamento' : 'Agrega un nuevo departamento al sistema'}
                                    </SheetDescription>
                                </SheetHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre del Departamento</Label>
                                        <Input
                                            id="nombre"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            placeholder="Sistemas y Computación"
                                            required
                                        />
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
                            Busca y filtra departamentos por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre..."
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
                                <Button variant="outline" size="sm">
                                    Estatus
                                </Button>
                                <Button variant="outline" size="sm">
                                    Ubicación
                                </Button>
                                <Button variant="outline" size="sm">
                                    Carreras
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de departamentos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Departamentos</CardTitle>
                        <CardDescription>
                            {filteredDepartamentos.length} de {departamentos.length} departamentos registrados en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Departamento</TableHead>
                                        <TableHead>Carreras</TableHead>
                                        <TableHead>Materias</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDepartamentos.map((departamento) => (
                                        <TableRow key={departamento.id_departamento}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Building className="h-4 w-4 text-indigo-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{departamento.nombre}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <GraduationCap className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {departamento.carreras?.[0]?.count || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <BookMarked className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {departamento.materias?.[0]?.count || 0}
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
                                                        <DropdownMenuItem onClick={() => handleEdit(departamento)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(departamento.id_departamento)}
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
                            <CardTitle className="text-sm font-medium">Total Departamentos</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departamentos.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Departamentos Activos</CardTitle>
                            <Building className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departamentos.filter(d => d.estatus === "Activo").length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Carreras</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departamentos.reduce((acc, curr) => acc + (curr.carreras?.[0]?.count || 0), 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Materias</CardTitle>
                            <BookMarked className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departamentos.reduce((acc, curr) => acc + (curr.materias?.[0]?.count || 0), 0)}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}