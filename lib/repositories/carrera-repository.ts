/**
 * Repository Pattern - Implementación específica para Carrera
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base-repository'

export interface Carrera {
    id_carrera: number
    id_departamento: number | null
    nombre: string
    clave: string | null
}

export class CarreraRepository extends BaseRepository<Carrera> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'carrera')
    }

    async findByDepartamento(idDepartamento: number): Promise<Carrera[]> {
        return this.findBy('id_departamento', idDepartamento)
    }

    async findByClave(clave: string): Promise<Carrera | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('clave', clave)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data as Carrera
    }

    async getCarrerasConRelaciones(): Promise<any[]> {
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

