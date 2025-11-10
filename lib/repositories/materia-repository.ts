/**
 * Repository Pattern - Implementación específica para Materia
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base-repository'

export interface Materia {
    id_materia: number
    id_departamento: number | null
    clave: string
    nombre: string
    creditos: number | null
}

export class MateriaRepository extends BaseRepository<Materia> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'materia')
    }

    async findByDepartamento(idDepartamento: number): Promise<Materia[]> {
        return this.findBy('id_departamento', idDepartamento)
    }

    async findByClave(clave: string): Promise<Materia | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('clave', clave)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data as Materia
    }

    async getMateriasConRelaciones(): Promise<any[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select(`
                *,
                departamento:departamento(*)
            `)
            .order('nombre', { ascending: true })

        if (error) throw error
        return data || []
    }
}

