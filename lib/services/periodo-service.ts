/**
 * Service Layer - PeriodoService
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base-service'
import { PeriodoRepository, Periodo } from '../repositories/periodo-repository'

export class PeriodoService extends BaseService<Periodo> {
    constructor(supabase: SupabaseClient) {
        super(new PeriodoRepository(supabase))
    }

    protected async validateCreate(data: Partial<Periodo>): Promise<void> {
        if (!data.anio || data.anio < 2000 || data.anio > 2100) {
            throw new Error('El año debe estar entre 2000 y 2100')
        }

        if (!data.etiqueta || data.etiqueta.trim().length < 2) {
            throw new Error('La etiqueta del periodo es requerida (mínimo 2 caracteres)')
        }

        const existente = await (this.repository as PeriodoRepository)
            .findByAnioYEtiqueta(data.anio, data.etiqueta.trim())
        
        if (existente) {
            throw new Error('Ya existe un periodo con ese año y etiqueta')
        }

        if (data.inicio && data.fin) {
            const inicio = new Date(data.inicio)
            const fin = new Date(data.fin)
            if (inicio >= fin) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin')
            }
        }
    }

    protected async validateUpdate(id: string | number, data: Partial<Periodo>): Promise<void> {
        const existente = await this.repository.findById(id)
        if (!existente) {
            throw new Error('Periodo no encontrado')
        }

        if (data.anio && (data.anio < 2000 || data.anio > 2100)) {
            throw new Error('El año debe estar entre 2000 y 2100')
        }

        if (data.etiqueta && data.etiqueta.trim().length < 2) {
            throw new Error('La etiqueta del periodo debe tener al menos 2 caracteres')
        }

        if (data.inicio && data.fin) {
            const inicio = new Date(data.inicio)
            const fin = new Date(data.fin)
            if (inicio >= fin) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin')
            }
        }
    }

    protected async validateDelete(id: string | number): Promise<void> {
        const periodo = await this.repository.findById(id)
        if (!periodo) {
            throw new Error('Periodo no encontrado')
        }
        // Aquí podrías validar que no tenga ofertas asociadas
    }
}

