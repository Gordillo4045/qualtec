/**
 * Repository Pattern - Patrón de Repositorio
 * 
 * Abstrae el acceso a datos, proporcionando una interfaz uniforme para operaciones CRUD.
 * Permite cambiar la implementación de almacenamiento sin afectar el código cliente.
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface Repository<T> {
    findAll(): Promise<T[]>
    findById(id: string | number): Promise<T | null>
    create(data: Partial<T>): Promise<T>
    update(id: string | number, data: Partial<T>): Promise<T>
    delete(id: string | number): Promise<boolean>
    findBy(field: string, value: any): Promise<T[]>
}

export abstract class BaseRepository<T> implements Repository<T> {
    protected supabase: SupabaseClient
    protected tableName: string

    constructor(supabase: SupabaseClient, tableName: string) {
        this.supabase = supabase
        this.tableName = tableName
    }

    async findAll(): Promise<T[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')

        if (error) throw error
        return data as T[]
    }

    async findById(id: string | number): Promise<T | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('id_' + this.tableName.split('_').pop(), id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // No encontrado
            throw error
        }
        return data as T
    }

    async create(data: Partial<T>): Promise<T> {
        const { data: created, error } = await this.supabase
            .from(this.tableName)
            .insert(data)
            .select()
            .single()

        if (error) throw error
        return created as T
    }

    async update(id: string | number, data: Partial<T>): Promise<T> {
        const idField = 'id_' + this.tableName.split('_').pop()
        const { data: updated, error } = await this.supabase
            .from(this.tableName)
            .update(data)
            .eq(idField, id)
            .select()
            .single()

        if (error) throw error
        return updated as T
    }

    async delete(id: string | number): Promise<boolean> {
        const idField = 'id_' + this.tableName.split('_').pop()
        const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq(idField, id)

        if (error) throw error
        return true
    }

    async findBy(field: string, value: any): Promise<T[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq(field, value)

        if (error) throw error
        return data as T[]
    }
}

