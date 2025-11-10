/**
 * Repository Pattern - Implementación específica para Estudiante
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base-repository'

export interface Estudiante {
    id_estudiante: string
    numero_control: string
    ap_paterno: string
    ap_materno: string
    nombres: string
    genero?: string
    fecha_nacimiento?: string
    email?: string
    telefono?: string
    id_carrera?: number
    id_modalidad?: number
    estatus?: string
    fecha_ingreso?: string
}

export class EstudianteRepository extends BaseRepository<Estudiante> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'estudiante')
    }

    async findByNumeroControl(numeroControl: string): Promise<Estudiante | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('numero_control', numeroControl)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data as Estudiante
    }

    async findByCarrera(idCarrera: number): Promise<Estudiante[]> {
        return this.findBy('id_carrera', idCarrera)
    }

    async findByEstatus(estatus: string): Promise<Estudiante[]> {
        return this.findBy('estatus', estatus)
    }

    async searchByNombre(nombre: string): Promise<Estudiante[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .or(`nombres.ilike.%${nombre}%,ap_paterno.ilike.%${nombre}%,ap_materno.ilike.%${nombre}%`)

        if (error) throw error
        return data as Estudiante[]
    }
}

