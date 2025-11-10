/**
 * Builder Pattern - Patrón Constructor
 * 
 * Permite construir consultas complejas paso a paso.
 * Facilita la creación de consultas dinámicas y legibles.
 */

import { SupabaseClient } from '@supabase/supabase-js'

export class QueryBuilder<T> {
    private query: any
    private supabase: SupabaseClient
    private tableName: string

    constructor(supabase: SupabaseClient, tableName: string) {
        this.supabase = supabase
        this.tableName = tableName
        this.query = supabase.from(tableName).select('*')
    }

    /**
     * Agrega un filtro de igualdad
     */
    where(field: string, value: any): this {
        this.query = this.query.eq(field, value)
        return this
    }

    /**
     * Agrega un filtro de desigualdad
     */
    whereNot(field: string, value: any): this {
        this.query = this.query.neq(field, value)
        return this
    }

    /**
     * Agrega un filtro "mayor que"
     */
    whereGreaterThan(field: string, value: any): this {
        this.query = this.query.gt(field, value)
        return this
    }

    /**
     * Agrega un filtro "menor que"
     */
    whereLessThan(field: string, value: any): this {
        this.query = this.query.lt(field, value)
        return this
    }

    /**
     * Agrega un filtro "like" (búsqueda parcial)
     */
    whereLike(field: string, pattern: string): this {
        this.query = this.query.ilike(field, `%${pattern}%`)
        return this
    }

    /**
     * Agrega un filtro "in" (valores múltiples)
     */
    whereIn(field: string, values: any[]): this {
        this.query = this.query.in(field, values)
        return this
    }

    /**
     * Agrega un filtro "is null"
     */
    whereNull(field: string): this {
        this.query = this.query.is(field, null)
        return this
    }

    /**
     * Agrega un filtro "is not null"
     */
    whereNotNull(field: string): this {
        this.query = this.query.not(field, 'is', null)
        return this
    }

    /**
     * Agrega ordenamiento ascendente
     */
    orderBy(field: string, ascending: boolean = true): this {
        this.query = this.query.order(field, { ascending })
        return this
    }

    /**
     * Limita el número de resultados
     */
    limit(count: number): this {
        this.query = this.query.limit(count)
        return this
    }

    /**
     * Agrega paginación
     */
    paginate(page: number, pageSize: number): this {
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        this.query = this.query.range(from, to)
        return this
    }

    /**
     * Selecciona campos específicos
     */
    select(fields: string): this {
        this.query = this.supabase.from(this.tableName).select(fields) as any
        return this
    }

    /**
     * Ejecuta la consulta y retorna los resultados
     */
    async execute(): Promise<T[]> {
        const { data, error } = await this.query
        if (error) throw error
        return data as T[]
    }

    /**
     * Ejecuta la consulta y retorna un solo resultado
     */
    async executeSingle(): Promise<T | null> {
        const { data, error } = await this.query.single()
        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data as T
    }

    /**
     * Cuenta los resultados sin retornarlos
     */
    async count(): Promise<number> {
        const { count, error } = await this.query.select('*', { count: 'exact', head: true })
        if (error) throw error
        return count || 0
    }
}

