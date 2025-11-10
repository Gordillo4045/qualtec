/**
 * Repository Pattern - Implementación específica para Periodo
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base-repository'

export interface Periodo {
    id_periodo: number
    anio: number
    etiqueta: string
    inicio: string | null
    fin: string | null
}

export class PeriodoRepository extends BaseRepository<Periodo> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'periodo')
    }

    async findByAnio(anio: number): Promise<Periodo[]> {
        return this.findBy('anio', anio)
    }

    async findByAnioYEtiqueta(anio: number, etiqueta: string): Promise<Periodo | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('anio', anio)
            .eq('etiqueta', etiqueta)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data as Periodo
    }
}

