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
    Calendar as CalendarIcon,
    Clock,
    CheckCircle,
    AlertTriangle,
    Users,
    BookOpen,
    Save,
    X
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function PeriodosPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingPeriodo, setEditingPeriodo] = useState<any>(null)
    const [formData, setFormData] = useState({
        anio: new Date().getFullYear().toString(),
        etiqueta: '',
        inicio: '',
        fin: ''
    })
    const [inicioDate, setInicioDate] = useState<Date>()
    const [finDate, setFinDate] = useState<Date>()
    const [inicioOpen, setInicioOpen] = useState(false)
    const [finOpen, setFinOpen] = useState(false)
    const [inicioMonth, setInicioMonth] = useState<Date | undefined>(inicioDate)
    const [finMonth, setFinMonth] = useState<Date | undefined>(finDate)
    const [inicioValue, setInicioValue] = useState('')
    const [finValue, setFinValue] = useState('')

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
    const [periodos, setPeriodos] = useState<any[]>([])
    const [filteredPeriodos, setFilteredPeriodos] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAnio, setSelectedAnio] = useState('')

    const supabase = createClient()

    useEffect(() => {
        fetchPeriodos()
    }, [])

    useEffect(() => {
        filterPeriodos()
    }, [periodos, searchTerm, selectedAnio])

    const filterPeriodos = () => {
        let filtered = periodos

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(periodo =>
                periodo.etiqueta.toLowerCase().includes(searchTerm.toLowerCase()) ||
                periodo.anio.toString().includes(searchTerm.toLowerCase())
            )
        }

        // Filtrar por año
        if (selectedAnio) {
            filtered = filtered.filter(periodo =>
                periodo.anio.toString() === selectedAnio
            )
        }

        setFilteredPeriodos(filtered)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar que el año esté seleccionado
        if (!formData.anio || formData.anio === '') {
            toast.error('Por favor selecciona un año')
            return
        }

        // Validar que las fechas estén seleccionadas
        if (!inicioDate || !finDate) {
            toast.error('Por favor selecciona las fechas de inicio y fin')
            return
        }

        // Validar que tenemos el ID del periodo para edición
        if (isEditing && !editingPeriodo?.id_periodo) {
            toast.error('Error: No se pudo identificar el periodo a editar')
            return
        }

        try {
            if (isEditing) {
                // Actualizar periodo existente
                const { error } = await supabase
                    .from('periodo')
                    .update({
                        anio: parseInt(formData.anio),
                        etiqueta: formData.etiqueta,
                        inicio: inicioDate.toISOString().split('T')[0],
                        fin: finDate.toISOString().split('T')[0]
                    })
                    .eq('id_periodo', editingPeriodo?.id_periodo)

                if (error) throw error
            } else {
                // Crear nuevo periodo
                const { error } = await supabase
                    .from('periodo')
                    .insert({
                        anio: parseInt(formData.anio),
                        etiqueta: formData.etiqueta,
                        inicio: inicioDate.toISOString().split('T')[0],
                        fin: finDate.toISOString().split('T')[0]
                    })

                if (error) throw error
            }

            // Recargar datos
            await fetchPeriodos()

            // Limpiar formulario y cerrar sheet
            setFormData({ anio: new Date().getFullYear().toString(), etiqueta: '', inicio: '', fin: '' })
            setInicioDate(undefined)
            setFinDate(undefined)
            setInicioValue('')
            setFinValue('')
            setInicioMonth(undefined)
            setFinMonth(undefined)
            setIsSheetOpen(false)
            setIsEditing(false)
            setEditingPeriodo(null)

            // Mostrar notificación de éxito
            toast.success(isEditing ? 'Periodo actualizado exitosamente' : 'Periodo creado exitosamente')

        } catch (error) {
            console.error('Error al guardar periodo:', error)
            toast.error('Error al guardar el periodo. Inténtalo de nuevo.')
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

    const handleEdit = (periodo: any) => {
        setEditingPeriodo(periodo)
        setFormData({
            anio: periodo.anio.toString(),
            etiqueta: periodo.etiqueta,
            inicio: periodo.inicio,
            fin: periodo.fin
        })
        const inicioDate = periodo.inicio ? new Date(periodo.inicio) : undefined
        const finDate = periodo.fin ? new Date(periodo.fin) : undefined
        setInicioDate(inicioDate)
        setFinDate(finDate)
        setInicioValue(formatDate(inicioDate))
        setFinValue(formatDate(finDate))
        setInicioMonth(inicioDate)
        setFinMonth(finDate)
        setIsEditing(true)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este periodo?')) {
            try {
                const { error } = await supabase
                    .from('periodo')
                    .delete()
                    .eq('id_periodo', id)

                if (error) throw error
                await fetchPeriodos()
                toast.success('Periodo eliminado exitosamente')
            } catch (error) {
                console.error('Error al eliminar periodo:', error)
                toast.error('Error al eliminar el periodo. Inténtalo de nuevo.')
            }
        }
    }

    const getStatusBadge = (periodo: any) => {
        const today = new Date()
        const inicio = new Date(periodo.inicio)
        const fin = new Date(periodo.fin)

        if (today < inicio) {
            return <Badge variant="outline" className="bg-blue-100 text-blue-800"><CalendarIcon className="h-3 w-3 mr-1" />Planificado</Badge>
        } else if (today >= inicio && today <= fin) {
            return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge>
        } else {
            return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Finalizado</Badge>
        }
    }

    const getDaysRemaining = (fin: string) => {
        const endDate = new Date(fin)
        const today = new Date()
        const diffTime = endDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }
    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Periodos</h1>
                        <p className="text-muted-foreground">
                            Gestiona los periodos académicos y fechas importantes
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
                                    setEditingPeriodo(null)
                                    setFormData({ anio: new Date().getFullYear().toString(), etiqueta: '', inicio: '', fin: '' })
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nuevo Periodo
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="p-4">
                                <SheetHeader>
                                    <SheetTitle>
                                        {isEditing ? 'Editar Periodo' : 'Nuevo Periodo'}
                                    </SheetTitle>
                                    <SheetDescription>
                                        {isEditing ? 'Modifica los datos del periodo' : 'Agrega un nuevo periodo al sistema'}
                                    </SheetDescription>
                                </SheetHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="anio">Año</Label>
                                        <Select value={formData.anio} onValueChange={(value) => setFormData({ ...formData, anio: value })}>
                                            <SelectTrigger id="anio">
                                                <SelectValue placeholder="YYYY" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 5 }, (_, i) => {
                                                    const year = new Date().getFullYear() + i
                                                    return (
                                                        <SelectItem key={i} value={year.toString()}>
                                                            {year}
                                                        </SelectItem>
                                                    )
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="etiqueta">Etiqueta</Label>
                                        <Input
                                            id="etiqueta"
                                            value={formData.etiqueta}
                                            onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value })}
                                            placeholder="2024-1"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="inicio">Fecha de Inicio</Label>
                                        <div className="relative flex gap-2">
                                            <Input
                                                id="inicio"
                                                value={inicioValue}
                                                placeholder="01 de enero, 2024"
                                                className="bg-background pr-10"
                                                onChange={(e) => {
                                                    const date = new Date(e.target.value)
                                                    setInicioValue(e.target.value)
                                                    if (isValidDate(date)) {
                                                        setInicioDate(date)
                                                        setInicioMonth(date)
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault()
                                                        setInicioOpen(true)
                                                    }
                                                }}
                                            />
                                            <Popover open={inicioOpen} onOpenChange={setInicioOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="inicio-picker"
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
                                                        selected={inicioDate}
                                                        captionLayout="dropdown"
                                                        month={inicioMonth}
                                                        onMonthChange={setInicioMonth}
                                                        onSelect={(date) => {
                                                            setInicioDate(date)
                                                            setInicioValue(formatDate(date))
                                                            setInicioOpen(false)
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fin">Fecha de Fin</Label>
                                        <div className="relative flex gap-2">
                                            <Input
                                                id="fin"
                                                value={finValue}
                                                placeholder="31 de diciembre, 2024"
                                                className="bg-background pr-10"
                                                onChange={(e) => {
                                                    const date = new Date(e.target.value)
                                                    setFinValue(e.target.value)
                                                    if (isValidDate(date)) {
                                                        setFinDate(date)
                                                        setFinMonth(date)
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault()
                                                        setFinOpen(true)
                                                    }
                                                }}
                                            />
                                            <Popover open={finOpen} onOpenChange={setFinOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="fin-picker"
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
                                                        selected={finDate}
                                                        captionLayout="dropdown"
                                                        month={finMonth}
                                                        onMonthChange={setFinMonth}
                                                        onSelect={(date) => {
                                                            setFinDate(date)
                                                            setFinValue(formatDate(date))
                                                            setFinOpen(false)
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
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
                            Busca y filtra periodos por diferentes criterios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por año, etiqueta o nombre..."
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
                                    value={selectedAnio}
                                    onChange={(e) => setSelectedAnio(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos los años</option>
                                    {Array.from(new Set(periodos.map(p => p.anio))).sort((a, b) => b - a).map(anio => (
                                        <option key={anio} value={anio}>{anio}</option>
                                    ))}
                                </select>
                                <Button variant="outline" size="sm">
                                    Estatus
                                </Button>
                                <Button variant="outline" size="sm">
                                    Rango de Fechas
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de periodos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Periodos</CardTitle>
                        <CardDescription>
                            {filteredPeriodos.length} de {periodos.length} periodos registrados en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Periodo</TableHead>
                                        <TableHead>Etiqueta</TableHead>
                                        <TableHead>Fechas</TableHead>
                                        <TableHead>Estatus</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPeriodos.map((periodo) => (
                                        <TableRow key={periodo.id_periodo}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <CalendarIcon className="h-4 w-4 text-blue-600 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{periodo.anio}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{periodo.etiqueta}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="flex items-center">
                                                        <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                                                        {periodo.inicio}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                                                        {periodo.fin}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(periodo)}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => handleEdit(periodo)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Users className="mr-2 h-4 w-4" />
                                                            Ver inscripciones
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <BookOpen className="mr-2 h-4 w-4" />
                                                            Ver materias
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(periodo.id_periodo)}
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
                            <CardTitle className="text-sm font-medium">Total Periodos</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{periodos.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Periodo Activo</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{periodos.filter(p => {
                                const today = new Date()
                                const inicio = new Date(p.inicio)
                                const fin = new Date(p.fin)
                                return today >= inicio && today <= fin
                            }).length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Inscripciones</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{periodos.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Días Restantes</CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {(() => {
                                    const activePeriod = periodos.find(p => {
                                        const today = new Date()
                                        const inicio = new Date(p.inicio)
                                        const fin = new Date(p.fin)
                                        return today >= inicio && today <= fin
                                    })
                                    return activePeriod ? getDaysRemaining(activePeriod.fin) : 0
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}