/**
 * Service Layer - ModalidadService
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base-service'
import { ModalidadRepository, Modalidad } from '../repositories/modalidad-repository'

export class ModalidadService extends BaseService<Modalidad> {
    constructor(supabase: SupabaseClient) {
        super(new ModalidadRepository(supabase))
    }

    protected async validateCreate(data: Partial<Modalidad>): Promise<void> {
        if (!data.nombre || data.nombre.trim().length < 3) {
            throw new Error('El nombre de la modalidad debe tener al menos 3 caracteres')
        }

        const existente = await (this.repository as ModalidadRepository)
            .findByNombre(data.nombre.trim())
        
        if (existente) {
            throw new Error('Ya existe una modalidad con ese nombre')
        }
    }

    protected async validateUpdate(id: string | number, data: Partial<Modalidad>): Promise<void> {
        const existente = await this.repository.findById(id)
        if (!existente) {
            throw new Error('Modalidad no encontrada')
        }

        if (data.nombre && data.nombre.trim().length < 3) {
            throw new Error('El nombre de la modalidad debe tener al menos 3 caracteres')
        }

        if (data.nombre && data.nombre.trim() !== existente.nombre) {
            const otro = await (this.repository as ModalidadRepository)
                .findByNombre(data.nombre.trim())
            
            if (otro && otro.id_modalidad !== id) {
                throw new Error('Ya existe otra modalidad con ese nombre')
            }
        }
    }

    protected async validateDelete(id: string | number): Promise<void> {
        const modalidad = await this.repository.findById(id)
        if (!modalidad) {
            throw new Error('Modalidad no encontrada')
        }
    }
}

