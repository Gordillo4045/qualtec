/**
 * Template Method Pattern - Método Plantilla
 * 
 * Define el esqueleto de un algoritmo en una clase base, permitiendo
 * que las subclases sobrescriban pasos específicos sin cambiar la estructura.
 */

'use client'

import { ReactNode } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Edit, Trash2, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface CRUDTemplateProps<T> {
    title: string
    description?: string
    fetchData: () => Promise<T[]>
    searchFields: (keyof T)[]
    columns: {
        key: keyof T
        label: string
        render?: (value: any, row: T) => ReactNode
    }[]
    onEdit?: (item: T) => void
    onDelete?: (item: T) => Promise<void>
    onExport?: (data: T[]) => void
    renderForm?: () => ReactNode
    renderFilters?: () => ReactNode
}

export function CRUDTemplate<T extends Record<string, any>>({
    title,
    description,
    fetchData,
    searchFields,
    columns,
    onEdit,
    onDelete,
    onExport,
    renderForm,
    renderFilters
}: CRUDTemplateProps<T>) {
    const [data, setData] = useState<T[]>([])
    const [filteredData, setFilteredData] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Template Method: Estructura común de carga de datos
    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        filterData()
    }, [data, searchTerm])

    const loadData = async () => {
        try {
            setLoading(true)
            const fetched = await fetchData()
            setData(fetched)
            setFilteredData(fetched)
        } catch (error) {
            toast.error('Error al cargar los datos')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Template Method: Filtrado común
    const filterData = () => {
        if (!searchTerm.trim()) {
            setFilteredData(data)
            return
        }

        const searchLower = searchTerm.toLowerCase()
        const filtered = data.filter(item =>
            searchFields.some(field => {
                const value = item[field]
                return value?.toString().toLowerCase().includes(searchLower)
            })
        )
        setFilteredData(filtered)
    }

    // Template Method: Manejo de eliminación
    const handleDelete = async (item: T) => {
        if (!onDelete) return

        if (!confirm('¿Está seguro de eliminar este registro?')) {
            return
        }

        try {
            await onDelete(item)
            toast.success('Registro eliminado correctamente')
            await loadData()
        } catch (error) {
            toast.error('Error al eliminar el registro')
            console.error(error)
        }
    }

    // Template Method: Exportación
    const handleExport = () => {
        if (onExport) {
            onExport(filteredData)
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        {/* Template Method: Barra de búsqueda y acciones */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            {renderFilters && renderFilters()}
                            {onExport && (
                                <Button onClick={handleExport} variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar
                                </Button>
                            )}
                            {renderForm && (
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nuevo
                                </Button>
                            )}
                        </div>

                        {/* Template Method: Tabla de datos */}
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {columns.map((col) => (
                                            <TableHead key={String(col.key)}>
                                                {col.label}
                                            </TableHead>
                                        ))}
                                        {(onEdit || onDelete) && (
                                            <TableHead className="w-[100px]">Acciones</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                                                className="text-center text-muted-foreground"
                                            >
                                                No se encontraron registros
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredData.map((item, index) => (
                                            <TableRow key={index}>
                                                {columns.map((col) => (
                                                    <TableCell key={String(col.key)}>
                                                        {col.render
                                                            ? col.render(item[col.key], item)
                                                            : String(item[col.key] || '')}
                                                    </TableCell>
                                                ))}
                                                {(onEdit || onDelete) && (
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {onEdit && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => onEdit(item)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {onDelete && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(item)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Template Method: Formulario (si se proporciona) */}
                {renderForm && renderForm()}
            </div>
        </Layout>
    )
}

