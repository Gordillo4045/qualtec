'use client'
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    BookOpen,
    Save,
    X,
    GraduationCap,
    Users,
    CheckCircle,
    AlertTriangle
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { ModalidadService } from "@/lib/services/modalidad-service"
import { ValidationChain } from "@/lib/validators/validation-chain"
import { CommandInvoker, CreateCommand, UpdateCommand, DeleteCommand } from "@/lib/commands/command-pattern"

export default function ModalidadesPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingModalidad, setEditingModalidad] = useState<any>(null)
    const [formData, setFormData] = useState({
        nombre: ''
    })

    const [modalidades, setModalidades] = useState<any[]>([])
    const [filteredModalidades, setFilteredModalidades] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    const supabase = createClient()
    const [modalidadService] = useState(() => new ModalidadService(supabase))
    const [commandInvoker] = useState(() => new CommandInvoker())

    useEffect(() => {
        fetchModalidades()
    }, [])

    useEffect(() => {
        filterModalidades()
    }, [modalidades, searchTerm])

    const filterModalidades = () => {
        let filtered = modalidades

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(modalidad =>
                modalidad.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredModalidades(filtered)
    }

    const validateForm = async () => {
        const validator = new ValidationChain()
            .required()
            .minLength(3)

        const result = await validator.validate(formData, 'nombre', formData.nombre)
        if (!result.isValid) {
            toast.error(result.error || 'El nombre de la modalidad es inválido')
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!(await validateForm())) {
            return
        }

        try {
            const nombreTrimmed = formData.nombre.trim()
            const modalidadData = { nombre: nombreTrimmed }

            if (isEditing && editingModalidad) {
                const updateCmd = new UpdateCommand(
                    async (id, data) => await modalidadService.update(id, data),
                    async (id) => await modalidadService.getById(id),
                    editingModalidad.id_modalidad,
                    modalidadData
                )

                const result = await commandInvoker.execute(updateCmd)
                if (!result.success) {
                    throw result.error || new Error('Error al actualizar')
                }
            } else {
                const createCmd = new CreateCommand(
                    async (data) => await modalidadService.create(data),
                    async (id: string | number) => await modalidadService.delete(id) as unknown as Promise<void>,
                    modalidadData as any
                ) as any

                const result = await commandInvoker.execute(createCmd)
                if (!result.success) {
                    throw result.error || new Error('Error al crear')
                }
            }

            await fetchModalidades()
            setFormData({ nombre: '' })
            setIsSheetOpen(false)
            setIsEditing(false)
            setEditingModalidad(null)
            toast.success(isEditing ? 'Modalidad actualizada exitosamente' : 'Modalidad creada exitosamente')

        } catch (error: any) {
            console.error('Error al guardar modalidad:', error)
            toast.error(error?.message || 'Error al guardar la modalidad. Inténtalo de nuevo.')
        }
    }

    const fetchModalidades = async () => {
        try {
            const data = await modalidadService.getAll()
            setModalidades(data)
        } catch (error) {
            console.error('Error al cargar modalidades:', error)
            toast.error('Error al cargar las modalidades')
        }
    }

    const handleEdit = (modalidad: any) => {
        setEditingModalidad(modalidad)
        setFormData({
            nombre: modalidad.nombre
        })
        setIsEditing(true)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta modalidad?')) {
            try {
                const deleteCmd = new DeleteCommand(
                    async (id: string | number) => await modalidadService.delete(id) as unknown as Promise<void>,
                    async (data: any) => await modalidadService.create(data as any),
                    id,
                    async (id: string | number) => await modalidadService.getById(id) as any
                ) as any

                const result = await commandInvoker.execute(deleteCmd)
                if (!result.success) {
                    throw result.error || new Error('Error al eliminar')
                }

                await fetchModalidades()
                toast.success('Modalidad eliminada exitosamente')
            } catch (error: any) {
                console.error('Error al eliminar modalidad:', error)
                toast.error(error?.message || 'Error al eliminar la modalidad. Inténtalo de nuevo.')
            }
        }
    }

    const exportarModalidades = () => {
        const datosExportar = modalidades.map(modalidad => ({
            'ID': modalidad.id_modalidad,
            'Nombre': modalidad.nombre,
            'Estatus': 'Activo'
        }))

        const ws = XLSX.utils.json_to_sheet(datosExportar)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Modalidades')
        XLSX.writeFile(wb, `modalidades_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success('Modalidades exportadas exitosamente')
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Modalidades</h1>
                        <p className="text-muted-foreground">
                            Administra las modalidades académicas del sistema
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportarModalidades}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" onClick={() => {
                                    setIsEditing(false)
                                    setEditingModalidad(null)
                                    setFormData({ nombre: '' })
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Modalidad
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="p-4">
                                <SheetHeader>
                                    <SheetTitle>
                                        {isEditing ? 'Editar Modalidad' : 'Nueva Modalidad'}
                                    </SheetTitle>
                                    <SheetDescription>
                                        {isEditing ? 'Modifica los datos de la modalidad' : 'Agrega una nueva modalidad al sistema'}
                                    </SheetDescription>
                                </SheetHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 mt-6" aria-label={isEditing ? 'Formulario para editar modalidad' : 'Formulario para crear nueva modalidad'}>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="nombre" required>Nombre</Label>
                                            <FieldHelp
                                                description="Nombre de la modalidad de estudio. Ejemplos: Presencial, En línea, Mixta, etc."
                                                id="help-nombre-modalidad"
                                            />
                                        </div>
                                        <Input
                                            id="nombre"
                                            aria-label="Nombre de la modalidad"
                                            aria-describedby="help-nombre-modalidad"
                                            aria-required="true"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            placeholder="Presencial, En línea, Mixta"
                                            required
                                        />
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
                            Busca modalidades por nombre
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
                            <div className="flex gap-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de modalidades */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Modalidades</CardTitle>
                        <CardDescription>
                            {filteredModalidades.length} de {modalidades.length} modalidades registradas en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Modalidad</TableHead>
                                        <TableHead>Estudiantes</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredModalidades.map((modalidad) => (
                                        <TableRow key={modalidad.id_modalidad}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{modalidad.nombre}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {modalidad.estudiantes || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(modalidad)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(modalidad.id_modalidad)}
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
                            <CardTitle className="text-sm font-medium">Total Modalidades</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{modalidades.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Modalidad Principal</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {modalidades.length > 0 ? modalidades[0].nombre : 'N/A'}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {modalidades.reduce((acc, curr) => acc + (curr.estudiantes || 0), 0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Última Creada</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {modalidades.length > 0 ? modalidades[modalidades.length - 1].nombre : 'N/A'}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
