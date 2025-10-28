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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Search,
    Filter,
    Download,
    Eye,
    Calendar,
    User,
    Database,
    Activity,
    Clock,
    RefreshCw
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import * as XLSX from 'xlsx'

export default function BitacoraPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [filteredLogs, setFilteredLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTable, setSelectedTable] = useState('all')
    const [selectedOperation, setSelectedOperation] = useState('all')
    const [selectedUser, setSelectedUser] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(15)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedLog, setSelectedLog] = useState<any>(null)
    const [usuarios, setUsuarios] = useState<any[]>([])
    const [tablasDisponibles, setTablasDisponibles] = useState<string[]>([])

    const supabase = createClient()

    useEffect(() => {
        fetchLogs()
        fetchUsuarios()
    }, [])

    useEffect(() => {
        filterLogs()
    }, [logs, searchTerm, selectedTable, selectedOperation, selectedUser])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('audit_log')
                .select(`
                    *,
                    usuario:usuario(nombre, apellido, email, rol)
                `)
                .order('fecha_operacion', { ascending: false })
                .limit(1000) // Limitar a los últimos 1000 logs

            if (error) throw error

            setLogs(data || [])

            // Extraer tablas únicas
            const tablas = [...new Set(data?.map(log => log.tabla_afectada) || [])]
            setTablasDisponibles(tablas)

        } catch (error) {
            console.error('Error al cargar logs:', error)
            toast.error('Error al cargar la bitácora')
        } finally {
            setLoading(false)
        }
    }

    const fetchUsuarios = async () => {
        try {
            const { data, error } = await supabase
                .from('usuario')
                .select('id_usuario, nombre, apellido, email, rol')
                .order('nombre')

            if (error) throw error
            setUsuarios(data || [])
        } catch (error) {
            console.error('Error al cargar usuarios:', error)
        }
    }

    const filterLogs = () => {
        let filtered = logs

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.tabla_afectada.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.operacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.registro_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.usuario?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.detalles_adicionales?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filtrar por tabla
        if (selectedTable !== 'all') {
            filtered = filtered.filter(log => log.tabla_afectada === selectedTable)
        }

        // Filtrar por operación
        if (selectedOperation !== 'all') {
            filtered = filtered.filter(log => log.operacion === selectedOperation)
        }

        // Filtrar por usuario
        if (selectedUser !== 'all') {
            filtered = filtered.filter(log => log.id_usuario === selectedUser)
        }

        setFilteredLogs(filtered)
        setCurrentPage(1)
    }

    const getOperationBadge = (operation: string) => {
        switch (operation) {
            case 'INSERT':
                return <Badge variant="default" className="bg-green-100 text-green-800">Crear</Badge>
            case 'UPDATE':
                return <Badge variant="default" className="bg-blue-100 text-blue-800">Actualizar</Badge>
            case 'DELETE':
                return <Badge variant="destructive">Eliminar</Badge>
            case 'SELECT':
                return <Badge variant="secondary">Consultar</Badge>
            default:
                return <Badge variant="outline">{operation}</Badge>
        }
    }

    const getTableIcon = (table: string) => {
        switch (table) {
            case 'estudiante':
                return <User className="h-4 w-4" />
            case 'inscripcion':
                return <Activity className="h-4 w-4" />
            case 'carrera':
                return <Database className="h-4 w-4" />
            case 'materia':
                return <Database className="h-4 w-4" />
            case 'grupo':
                return <Database className="h-4 w-4" />
            case 'oferta':
                return <Database className="h-4 w-4" />
            case 'periodo':
                return <Calendar className="h-4 w-4" />
            case 'departamento':
                return <Database className="h-4 w-4" />
            case 'modalidad':
                return <Database className="h-4 w-4" />
            case 'factor':
                return <Database className="h-4 w-4" />
            case 'subfactor':
                return <Database className="h-4 w-4" />
            case 'estudiante_factor':
                return <Database className="h-4 w-4" />
            case 'materia_unidad':
                return <Database className="h-4 w-4" />
            case 'estudiante_unidad':
                return <Database className="h-4 w-4" />
            default:
                return <Database className="h-4 w-4" />
        }
    }

    const formatTableName = (table: string) => {
        const tableNames: { [key: string]: string } = {
            'estudiante': 'Estudiantes',
            'inscripcion': 'Inscripciones',
            'carrera': 'Carreras',
            'materia': 'Materias',
            'grupo': 'Grupos',
            'oferta': 'Ofertas',
            'periodo': 'Períodos',
            'departamento': 'Departamentos',
            'modalidad': 'Modalidades',
            'factor': 'Factores',
            'subfactor': 'Subfactores',
            'estudiante_factor': 'Factores de Estudiante',
            'materia_unidad': 'Unidades de Materia',
            'estudiante_unidad': 'Unidades de Estudiante'
        }
        return tableNames[table] || table
    }

    const handleViewDetails = (log: any) => {
        setSelectedLog(log)
        setShowDetailsModal(true)
    }

    const exportarLogs = () => {
        const datosExportar = filteredLogs.map(log => ({
            'Fecha': format(new Date(log.fecha_operacion), 'dd/MM/yyyy HH:mm:ss', { locale: es }),
            'Usuario': `${log.usuario?.nombre || ''} ${log.usuario?.apellido || ''}`.trim() || 'Sistema',
            'Email': log.usuario?.email || 'system@qualtec.com',
            'Rol': log.usuario?.rol || 'admin',
            'Tabla': formatTableName(log.tabla_afectada),
            'Operación': log.operacion,
            'ID Registro': log.registro_id || '',
            'IP': log.ip_address || '',
            'Detalles': log.detalles_adicionales || ''
        }))

        const ws = XLSX.utils.json_to_sheet(datosExportar)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Bitácora')
        XLSX.writeFile(wb, `bitacora_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success('Bitácora exportada exitosamente')
    }

    // Paginación
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentLogs = filteredLogs.slice(startIndex, endIndex)

    const renderPagination = () => {
        if (totalPages <= 1) return null

        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(i)
                            }}
                            isActive={currentPage === i}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                )
            }
        } else {
            // Lógica de paginación truncada
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(
                        <PaginationItem key={i}>
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentPage(i)
                                }}
                                isActive={currentPage === i}
                            >
                                {i}
                            </PaginationLink>
                        </PaginationItem>
                    )
                }
                pages.push(<PaginationEllipsis key="ellipsis1" />)
                pages.push(
                    <PaginationItem key={totalPages}>
                        <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(totalPages)
                            }}
                        >
                            {totalPages}
                        </PaginationLink>
                    </PaginationItem>
                )
            } else if (currentPage >= totalPages - 2) {
                pages.push(
                    <PaginationItem key={1}>
                        <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(1)
                            }}
                        >
                            1
                        </PaginationLink>
                    </PaginationItem>
                )
                pages.push(<PaginationEllipsis key="ellipsis1" />)
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(
                        <PaginationItem key={i}>
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentPage(i)
                                }}
                                isActive={currentPage === i}
                            >
                                {i}
                            </PaginationLink>
                        </PaginationItem>
                    )
                }
            } else {
                pages.push(
                    <PaginationItem key={1}>
                        <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(1)
                            }}
                        >
                            1
                        </PaginationLink>
                    </PaginationItem>
                )
                pages.push(<PaginationEllipsis key="ellipsis1" />)
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(
                        <PaginationItem key={i}>
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentPage(i)
                                }}
                                isActive={currentPage === i}
                            >
                                {i}
                            </PaginationLink>
                        </PaginationItem>
                    )
                }
                pages.push(<PaginationEllipsis key="ellipsis2" />)
                pages.push(
                    <PaginationItem key={totalPages}>
                        <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(totalPages)
                            }}
                        >
                            {totalPages}
                        </PaginationLink>
                    </PaginationItem>
                )
            }
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                if (currentPage > 1) setCurrentPage(currentPage - 1)
                            }}
                            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                    {pages}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                            }}
                            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Cargando bitácora...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Bitácora del Sistema</h1>
                        <p className="text-muted-foreground">
                            Registro de todas las operaciones realizadas en el sistema
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchLogs}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportarLogs}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <Field>
                                <Label htmlFor="search">Buscar</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Buscar en logs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </Field>

                            <Field>
                                <Label htmlFor="table">Tabla</Label>
                                <Select value={selectedTable} onValueChange={setSelectedTable}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las tablas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las tablas</SelectItem>
                                        {tablasDisponibles.map((tabla) => (
                                            <SelectItem key={tabla} value={tabla}>
                                                {formatTableName(tabla)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Label htmlFor="operation">Operación</Label>
                                <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las operaciones" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las operaciones</SelectItem>
                                        <SelectItem value="INSERT">Crear</SelectItem>
                                        <SelectItem value="UPDATE">Actualizar</SelectItem>
                                        <SelectItem value="DELETE">Eliminar</SelectItem>
                                        <SelectItem value="SELECT">Consultar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Label>&nbsp;</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchTerm('')
                                            setSelectedTable('all')
                                            setSelectedOperation('all')
                                            setSelectedUser('all')
                                        }}
                                    >
                                        Limpiar
                                    </Button>
                                </div>
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                {/* Estadísticas */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredLogs.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Creaciones</CardTitle>
                            <Database className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredLogs.filter(log => log.operacion === 'INSERT').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Actualizaciones</CardTitle>
                            <Database className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredLogs.filter(log => log.operacion === 'UPDATE').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Eliminaciones</CardTitle>
                            <Database className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredLogs.filter(log => log.operacion === 'DELETE').length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla de logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registro de Actividad</CardTitle>
                        <CardDescription>
                            Historial detallado de todas las operaciones realizadas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Tabla</TableHead>
                                        <TableHead>Operación</TableHead>
                                        <TableHead>ID Registro</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentLogs.length > 0 ? (
                                        currentLogs.map((log) => (
                                            <TableRow key={log.id_log}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        {format(new Date(log.fecha_operacion), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <div className="font-medium">
                                                                {log.usuario?.nombre ? `${log.usuario.nombre} ${log.usuario.apellido}` : 'Sistema'}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {log.usuario?.email || 'system@qualtec.com'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getTableIcon(log.tabla_afectada)}
                                                        {formatTableName(log.tabla_afectada)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getOperationBadge(log.operacion)}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-sm bg-muted px-2 py-1 rounded">
                                                        {log.registro_id || 'N/A'}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(log)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No se encontraron logs que coincidan con los filtros
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 py-4">
                                {renderPagination()}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modal de detalles */}
                <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Detalles del Log</DialogTitle>
                            <DialogDescription>
                                Información completa de la operación registrada
                            </DialogDescription>
                        </DialogHeader>

                        {selectedLog && (
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium">Fecha y Hora</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(selectedLog.fecha_operacion), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Usuario</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLog.usuario?.nombre ? `${selectedLog.usuario.nombre} ${selectedLog.usuario.apellido}` : 'Sistema'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Tabla Afectada</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {formatTableName(selectedLog.tabla_afectada)}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Operación</Label>
                                        <div className="mt-1">
                                            {getOperationBadge(selectedLog.operacion)}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">ID del Registro</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLog.registro_id || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">IP Address</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLog.ip_address || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {selectedLog.datos_anteriores && (
                                    <div>
                                        <Label className="text-sm font-medium">Datos Anteriores</Label>
                                        <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-auto max-h-32">
                                            {JSON.stringify(selectedLog.datos_anteriores, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {selectedLog.datos_nuevos && (
                                    <div>
                                        <Label className="text-sm font-medium">Datos Nuevos</Label>
                                        <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-auto max-h-32">
                                            {JSON.stringify(selectedLog.datos_nuevos, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {selectedLog.detalles_adicionales && (
                                    <div>
                                        <Label className="text-sm font-medium">Detalles Adicionales</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLog.detalles_adicionales}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    )
}
