/**
 * Service Layer - DepartamentoService
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base-service'
import { DepartamentoRepository, Departamento } from '../repositories/departamento-repository'

export class DepartamentoService extends BaseService<Departamento> {
    constructor(supabase: SupabaseClient) {
        super(new DepartamentoRepository(supabase))
    }

    protected async validateCreate(data: Partial<Departamento>): Promise<void> {
        if (!data.nombre || data.nombre.trim().length < 3) {
            throw new Error('El nombre del departamento debe tener al menos 3 caracteres')
        }

        const existente = await (this.repository as DepartamentoRepository)
            .findByNombre(data.nombre.trim())
        
        if (existente) {
            throw new Error('Ya existe un departamento con ese nombre')
        }
    }

    protected async validateUpdate(id: string | number, data: Partial<Departamento>): Promise<void> {
        const existente = await this.repository.findById(id)
        if (!existente) {
            throw new Error('Departamento no encontrado')
        }

        if (data.nombre && data.nombre.trim().length < 3) {
            throw new Error('El nombre del departamento debe tener al menos 3 caracteres')
        }

        if (data.nombre && data.nombre.trim() !== existente.nombre) {
            const otro = await (this.repository as DepartamentoRepository)
                .findByNombre(data.nombre.trim())
            
            if (otro && otro.id_departamento !== id) {
                throw new Error('Ya existe otro departamento con ese nombre')
            }
        }
    }

    protected async validateDelete(id: string | number): Promise<void> {
        const departamento = await this.repository.findById(id)
        if (!departamento) {
            throw new Error('Departamento no encontrado')
        }
        // Aquí podrías validar que no tenga carreras asociadas
    }
}

