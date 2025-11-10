/**
 * Repository Pattern - Implementación específica para Departamento
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base-repository'

export interface Departamento {
    id_departamento: number
    nombre: string
}

export class DepartamentoRepository extends BaseRepository<Departamento> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'departamento')
    }

    async findByNombre(nombre: string): Promise<Departamento | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('nombre', nombre)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data as Departamento
    }
}

