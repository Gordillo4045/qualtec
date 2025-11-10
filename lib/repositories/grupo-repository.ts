/**
 * Repository Pattern - Implementación específica para Grupo
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base-repository'

export interface Grupo {
    id_grupo: number
    id_carrera: number | null
    clave: string
    turno: string | null
}

export class GrupoRepository extends BaseRepository<Grupo> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'grupo')
    }

    async findByCarrera(idCarrera: number): Promise<Grupo[]> {
        return this.findBy('id_carrera', idCarrera)
    }

    async findByClave(clave: string): Promise<Grupo | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('clave', clave)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data as Grupo
    }

    async getGruposConRelaciones(): Promise<any[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select(`
                *,
                carrera:carrera(*)
            `)
            .order('clave', { ascending: true })

        if (error) throw error
        return data || []
    }
}

