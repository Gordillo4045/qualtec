/**
 * Repository Pattern - Implementación específica para Modalidad
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base-repository'

export interface Modalidad {
    id_modalidad: number
    nombre: string
}

export class ModalidadRepository extends BaseRepository<Modalidad> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'modalidad')
    }

    async findByNombre(nombre: string): Promise<Modalidad | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('nombre', nombre)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data as Modalidad
    }
}

