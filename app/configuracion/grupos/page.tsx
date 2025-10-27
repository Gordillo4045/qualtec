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
    Users2,
    GraduationCap,
    Clock,
    Calendar,
    User,
    Save,
    X
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

export default function GruposPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingGrupo, setEditingGrupo] = useState<any>(null)
    const [carreras, setCarreras] = useState<any[]>([])
    const [formData, setFormData] = useState({
        clave: '',
        turno: '',
        id_carrera: ''
    })
    const [grupos, setGrupos] = useState<any[]>([])
    const [filteredGrupos, setFilteredGrupos] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCarrera, setSelectedCarrera] = useState('')
    const [selectedTurno, setSelectedTurno] = useState('')

    const supabase = createClient()

    useEffect(() => {
        fetchGrupos()
        fetchCarreras()
    }, [])

    useEffect(() => {
        filterGrupos()
    }, [grupos, searchTerm, selectedCarrera, selectedTurno])

    const filterGrupos = () => {
        let filtered = grupos

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(grupo =>
                grupo.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
                grupo.carrera?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                grupo.turno.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filtrar por carrera
        if (selectedCarrera) {
            filtered = filtered.filter(grupo =>
                grupo.id_carrera.toString() === selectedCarrera
            )
        }

        // Filtrar por turno
        if (selectedTurno) {
            filtered = filtered.filter(grupo =>
                grupo.turno === selectedTurno
            )
        }

        setFilteredGrupos(filtered)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar que tenemos el ID del grupo para edición
        if (isEditing && !editingGrupo?.id_grupo) {
            toast.error('Error: No se pudo identificar el grupo a editar')
            return
        }

        try {
            if (isEditing) {
                // Actualizar grupo existente
                const { error } = await supabase
                    .from('grupo')
                    .update({
                        clave: formData.clave,
                        turno: formData.turno,
                        id_carrera: parseInt(formData.id_carrera)
                    })
                    .eq('id_grupo', editingGrupo?.id_grupo)

                if (error) throw error
            } else {
                // Crear nuevo grupo
                const { error } = await supabase
                    .from('grupo')
                    .insert({
                        clave: formData.clave,
                        turno: formData.turno,
                        id_carrera: parseInt(formData.id_carrera)
                    })

                if (error) throw error
            }

            // Recargar datos
            await fetchGrupos()
            await fetchCarreras()

            // Limpiar formulario y cerrar sheet
            setFormData({ clave: '', turno: '', id_carrera: '' })
            setIsSheetOpen(false)
            setIsEditing(false)
            setEditingGrupo(null)

            // Mostrar notificación de éxito
            toast.success(isEditing ? 'Grupo actualizado exitosamente' : 'Grupo creado exitosamente')

        } catch (error) {
            console.error('Error al guardar grupo:', error)
            toast.error('Error al guardar el grupo. Inténtalo de nuevo.')
        }
    }

    const fetchGrupos = async () => {
        try {
            const { data, error } = await supabase
                .from('grupo')
                .select(`
                    *,
                    carrera:carrera(nombre)
                `)

            if (error) throw error
            setGrupos(data || [])
        } catch (error) {
            console.error('Error al cargar grupos:', error)
        }
    }

    const fetchCarreras = async () => {
        try {
            const { data, error } = await supabase
                .from('carrera')
                .select('*')
                .order('nombre')

            if (error) throw error
            setCarreras(data || [])
        } catch (error) {
            console.error('Error al cargar carreras:', error)
        }
    }

    const handleEdit = (grupo: any) => {
        setEditingGrupo(grupo)
        setFormData({
            clave: grupo.clave,
            turno: grupo.turno,
            id_carrera: grupo.id_carrera.toString()
        })
        setIsEditing(true)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
            try {
                const { error } = await supabase
                    .from('grupo')
                    .delete()
                    .eq('id_grupo', id)

                if (error) throw error
                await fetchGrupos()
                toast.success('Grupo eliminado exitosamente')
            } catch (error) {
                console.error('Error al eliminar grupo:', error)
                toast.error('Error al eliminar el grupo. Inténtalo de nuevo.')
            }
        }
    }

    const getTurnoBadge = (turno: string) => {
        switch (turno) {
            case "Matutino":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Matutino</Badge>
            case "Vespertino":
                return <Badge variant="outline" className="bg-orange-100 text-orange-800">Vespertino</Badge>
            case "Nocturno":
                return <Badge variant="outline" className="bg-purple-100 text-purple-800">Nocturno</Badge>
            default:
                return <Badge variant="outline">Mixto</Badge>
        }
    }

    const exportarGrupos = () => {
        const datosExportar = grupos.map(grupo => ({
            'ID': grupo.id_grupo,
            'Clave': grupo.clave,
            'Turno': grupo.turno || '',
            'Carrera': grupo.carrera?.nombre || '',
            'Estatus': 'Activo'
        }))

        const ws = XLSX.utils.json_to_sheet(datosExportar)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Grupos')
        XLSX.writeFile(wb, `grupos_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success('Grupos exportados exitosamente')
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Grupos</h1>
                        <p className="text-muted-foreground">
                            Configura los grupos de estudiantes y sus horarios
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportarGrupos}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" onClick={() => {
                                    setIsEditing(false)
                                    setEditingGrupo(null)
                                    setFormData({ clave: '', turno: '', id_carrera: '' })
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nuevo Grupo
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="p-4">
                                <SheetHeader>
                                    <SheetTitle>
                                        {isEditing ? 'Editar Grupo' : 'Nuevo Grupo'}
                                    </SheetTitle>
                                    <SheetDescription>
                                        {isEditing ? 'Modifica los datos del grupo' : 'Agrega un nuevo grupo al sistema'}
                                    </SheetDescription>
                                </SheetHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="clave">Clave del Grupo</Label>
                                        <Input
                                            id="clave"
                                            value={formData.clave}
                                            onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                                            placeholder="ISC-1A"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="turno">Turno</Label>
                                        <select
                                            id="turno"
                                            value={formData.turno}
                                            onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Selecciona un turno</option>
                                            <option value="Matutino">Matutino</option>
                                            <option value="Vespertino">Vespertino</option>
                                            <option value="SemiPresencial">Semi Presencial</option>
                                            <option value="Virtual">Virtual</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="carrera">Carrera</Label>
                                        <select
                                            id="carrera"
                                            value={formData.id_carrera}
                                            onChange={(e) => setFormData({ ...formData, id_carrera: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Selecciona una carrera</option>
                                            {carreras.map((carrera) => (
                                                <option key={carrera.id_carrera} value={carrera.id_carrera}>
                                                    {carrera.nombre}
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
                            Busca y filtra grupos por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por clave, carrera o turno..."
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
                                        <option key={carrera.id_carrera} value={carrera.id_carrera}>
                                            {carrera.nombre}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedTurno}
                                    onChange={(e) => setSelectedTurno(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos los turnos</option>
                                    <option value="Matutino">Matutino</option>
                                    <option value="Vespertino">Vespertino</option>
                                    <option value="Nocturno">Nocturno</option>
                                    <option value="Mixto">Mixto</option>
                                </select>
                                <Button variant="outline" size="sm">
                                    Semestre
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de grupos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Grupos</CardTitle>
                        <CardDescription>
                            {filteredGrupos.length} de {grupos.length} grupos registrados en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Clave</TableHead>
                                        <TableHead>Carrera</TableHead>
                                        <TableHead>Turno</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredGrupos.map((grupo) => (
                                        <TableRow key={grupo.id_grupo}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users2 className="h-4 w-4 text-purple-600 mr-2" />
                                                    <div className="font-medium">{grupo.clave}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <GraduationCap className="h-4 w-4 text-muted-foreground mr-1" />
                                                    {grupo.carrera?.nombre || 'Sin carrera'}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getTurnoBadge(grupo.turno)}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => handleEdit(grupo)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Users2 className="mr-2 h-4 w-4" />
                                                            Ver estudiantes
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            Ver horario
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(grupo.id_grupo)}
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
                            <CardTitle className="text-sm font-medium">Total Grupos</CardTitle>
                            <Users2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{grupos.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Grupos Activos</CardTitle>
                            <Users2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{grupos.filter(g => g.estatus === "Activo").length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                            <User className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{grupos.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{grupos.length * 30}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}