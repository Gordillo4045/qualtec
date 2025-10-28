'use client'
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { useAudit } from "@/hooks/use-audit"
import { useAuth } from "@/hooks/use-auth"
import {
    User,
    Mail,
    Calendar,
    Activity,
    Database,
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw,
    Eye,
    Trash2,
    Edit
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function TestAuditPage() {
    const [loading, setLoading] = useState(false)
    const [logs, setLogs] = useState<any[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const { user } = useAuth()
    const { logOperation, isAuthenticated, currentUserId } = useAudit()
    const supabase = createClient()

    useEffect(() => {
        fetchRecentLogs()
    }, [])

    const fetchRecentLogs = async () => {
        try {
            setRefreshing(true)
            const { data, error } = await supabase
                .from('audit_log')
                .select(`
                    *,
                    usuario:usuario(nombre, apellido, email, rol)
                `)
                .order('fecha_operacion', { ascending: false })
                .limit(10)

            if (error) throw error
            setLogs(data || [])
        } catch (error) {
            console.error('Error al cargar logs:', error)
            toast.error('Error al cargar los logs recientes')
        } finally {
            setRefreshing(false)
        }
    }

    const testCreateOperation = async () => {
        if (!isAuthenticated) {
            toast.error('Debes estar autenticado para probar la auditoría')
            return
        }

        setLoading(true)
        try {
            // Crear un registro de prueba
            const { data, error } = await supabase
                .from('estudiante')
                .insert({
                    numero_control: `TEST${Date.now()}`,
                    ap_paterno: 'Prueba',
                    ap_materno: 'Auditoría',
                    nombres: 'Usuario',
                    genero: 'M',
                    email: 'test@example.com',
                    id_carrera: 1,
                    id_modalidad: 1,
                    estatus: 'activo'
                })
                .select()
                .single()

            if (error) throw error

            // Registrar manualmente en auditoría
            await logOperation(
                'estudiante',
                'INSERT',
                data.id_estudiante,
                null,
                data,
                `Prueba de auditoría desde frontend - ${user?.email}`
            )

            toast.success('Operación de prueba completada exitosamente')
            await fetchRecentLogs() // Actualizar logs
        } catch (error) {
            console.error('Error en prueba:', error)
            toast.error('Error en la operación de prueba')
        } finally {
            setLoading(false)
        }
    }

    const testUpdateOperation = async () => {
        if (!isAuthenticated) {
            toast.error('Debes estar autenticado para probar la auditoría')
            return
        }

        setLoading(true)
        try {
            // Obtener un estudiante existente
            const { data: estudiantes, error: fetchError } = await supabase
                .from('estudiante')
                .select('*')
                .limit(1)

            if (fetchError || !estudiantes || estudiantes.length === 0) {
                toast.error('No hay estudiantes para actualizar')
                return
            }

            const estudiante = estudiantes[0]
            const oldData = { ...estudiante }

            // Actualizar el estudiante
            const { data, error } = await supabase
                .from('estudiante')
                .update({
                    nombres: `Actualizado ${Date.now()}`
                })
                .eq('id_estudiante', estudiante.id_estudiante)
                .select()
                .single()

            if (error) throw error

            // Registrar manualmente en auditoría
            await logOperation(
                'estudiante',
                'UPDATE',
                data.id_estudiante,
                oldData,
                data,
                `Prueba de actualización desde frontend - ${user?.email}`
            )

            toast.success('Operación de actualización completada exitosamente')
            await fetchRecentLogs() // Actualizar logs
        } catch (error) {
            console.error('Error en prueba:', error)
            toast.error('Error en la operación de prueba')
        } finally {
            setLoading(false)
        }
    }

    const testDeleteOperation = async () => {
        if (!isAuthenticated) {
            toast.error('Debes estar autenticado para probar la auditoría')
            return
        }

        setLoading(true)
        try {
            // Obtener un estudiante de prueba para eliminar
            const { data: estudiantes, error: fetchError } = await supabase
                .from('estudiante')
                .select('*')
                .like('numero_control', 'TEST%')
                .limit(1)

            if (fetchError || !estudiantes || estudiantes.length === 0) {
                toast.error('No hay estudiantes de prueba para eliminar')
                return
            }

            const estudiante = estudiantes[0]

            // Registrar antes de eliminar
            await logOperation(
                'estudiante',
                'DELETE',
                estudiante.id_estudiante,
                estudiante,
                null,
                `Prueba de eliminación desde frontend - ${user?.email}`
            )

            // Eliminar el estudiante
            const { error } = await supabase
                .from('estudiante')
                .delete()
                .eq('id_estudiante', estudiante.id_estudiante)

            if (error) throw error

            toast.success('Operación de eliminación completada exitosamente')
            await fetchRecentLogs() // Actualizar logs
        } catch (error) {
            console.error('Error en prueba:', error)
            toast.error('Error en la operación de prueba')
        } finally {
            setLoading(false)
        }
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

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Prueba de Auditoría</h1>
                        <p className="text-muted-foreground">
                            Página para probar el sistema de auditoría con usuarios autenticados
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchRecentLogs}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Actualizar Logs
                    </Button>
                </div>

                {/* Información del Usuario */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Información del Usuario
                        </CardTitle>
                        <CardDescription>
                            Estado actual de la autenticación y auditoría
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-3">
                                {user ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <div>
                                    <div className="font-medium">Usuario Autenticado</div>
                                    <div className="text-sm text-muted-foreground">
                                        {user ? 'Sí' : 'No'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {isAuthenticated ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <div>
                                    <div className="font-medium">Auditoría Habilitada</div>
                                    <div className="text-sm text-muted-foreground">
                                        {isAuthenticated ? 'Sí' : 'No'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {user && (
                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">Email</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">ID</div>
                                        <div className="text-sm text-muted-foreground font-mono">{user.id}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">Nombre</div>
                                        <div className="text-sm text-muted-foreground">
                                            {user.user_metadata?.full_name || user.user_metadata?.name || 'No disponible'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">ID Usuario Auditoría</div>
                                        <div className="text-sm text-muted-foreground font-mono">
                                            {currentUserId || 'No disponible'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Operaciones de Prueba */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Operaciones de Prueba
                        </CardTitle>
                        <CardDescription>
                            Prueba las operaciones de auditoría con tu usuario autenticado
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Button
                                onClick={testCreateOperation}
                                disabled={loading || !isAuthenticated}
                                className="h-auto p-4 flex flex-col items-center gap-2"
                            >
                                <Edit className="h-6 w-6" />
                                <span>Probar Creación</span>
                                <span className="text-xs opacity-75">Crear estudiante de prueba</span>
                            </Button>

                            <Button
                                onClick={testUpdateOperation}
                                disabled={loading || !isAuthenticated}
                                variant="outline"
                                className="h-auto p-4 flex flex-col items-center gap-2"
                            >
                                <Edit className="h-6 w-6" />
                                <span>Probar Actualización</span>
                                <span className="text-xs opacity-75">Actualizar estudiante existente</span>
                            </Button>

                            <Button
                                onClick={testDeleteOperation}
                                disabled={loading || !isAuthenticated}
                                variant="destructive"
                                className="h-auto p-4 flex flex-col items-center gap-2"
                            >
                                <Trash2 className="h-6 w-6" />
                                <span>Probar Eliminación</span>
                                <span className="text-xs opacity-75">Eliminar estudiante de prueba</span>
                            </Button>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <span className="font-medium text-sm">Información</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Estas operaciones crearán, actualizarán o eliminarán registros de prueba y los registrarán
                                en la auditoría con tu usuario autenticado. Los logs aparecerán automáticamente en la
                                sección "Logs Recientes" después de cada operación.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs Recientes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Logs Recientes
                        </CardTitle>
                        <CardDescription>
                            Últimos 10 registros de auditoría para verificar el funcionamiento
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {logs.length > 0 ? (
                            <div className="space-y-4">
                                {logs.map((log) => (
                                    <div key={log.id_log} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getTableIcon(log.tabla_afectada)}
                                                <span className="font-medium">
                                                    {formatTableName(log.tabla_afectada)}
                                                </span>
                                                {getOperationBadge(log.operacion)}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(log.fecha_operacion), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                                            </div>
                                        </div>

                                        <div className="grid gap-2 md:grid-cols-2 text-sm">
                                            <div>
                                                <span className="font-medium">Usuario:</span>{' '}
                                                <span className="text-muted-foreground">
                                                    {log.usuario?.nombre ? `${log.usuario.nombre} ${log.usuario.apellido}` : 'Sistema'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Email:</span>{' '}
                                                <span className="text-muted-foreground">
                                                    {log.usuario?.email || 'system@qualtec.com'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">ID Registro:</span>{' '}
                                                <code className="text-xs bg-muted px-1 rounded">
                                                    {log.registro_id || 'N/A'}
                                                </code>
                                            </div>
                                            <div>
                                                <span className="font-medium">Detalles:</span>{' '}
                                                <span className="text-muted-foreground">
                                                    {log.detalles_adicionales || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No hay logs recientes para mostrar</p>
                                <p className="text-sm">Realiza una operación de prueba para generar logs</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}
