/**
 * Service Layer - CarreraService
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base-service'
import { CarreraRepository, Carrera } from '../repositories/carrera-repository'

export class CarreraService extends BaseService<Carrera> {
    constructor(supabase: SupabaseClient) {
        super(new CarreraRepository(supabase))
    }

    protected async validateCreate(data: Partial<Carrera>): Promise<void> {
        if (!data.nombre || data.nombre.trim().length < 3) {
            throw new Error('El nombre de la carrera debe tener al menos 3 caracteres')
        }

        if (!data.id_departamento) {
            throw new Error('Debe seleccionar un departamento')
        }

        if (data.clave) {
            const existente = await (this.repository as CarreraRepository)
                .findByClave(data.clave.trim())
            
            if (existente) {
                throw new Error('Ya existe una carrera con esa clave')
            }
        }
    }

    protected async validateUpdate(id: string | number, data: Partial<Carrera>): Promise<void> {
        const existente = await this.repository.findById(id)
        if (!existente) {
            throw new Error('Carrera no encontrada')
        }

        if (data.nombre && data.nombre.trim().length < 3) {
            throw new Error('El nombre de la carrera debe tener al menos 3 caracteres')
        }

        if (data.clave && data.clave.trim() !== existente.clave) {
            const otro = await (this.repository as CarreraRepository)
                .findByClave(data.clave.trim())
            
            if (otro && otro.id_carrera !== id) {
                throw new Error('Ya existe otra carrera con esa clave')
            }
        }
    }

    protected async validateDelete(id: string | number): Promise<void> {
        const carrera = await this.repository.findById(id)
        if (!carrera) {
            throw new Error('Carrera no encontrada')
        }
        // Aquí podrías validar que no tenga estudiantes o grupos asociados
    }

    async getCarrerasConRelaciones(): Promise<any[]> {
        return (this.repository as CarreraRepository).getCarrerasConRelaciones()
    }
}

