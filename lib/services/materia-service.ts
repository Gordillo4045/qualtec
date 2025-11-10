/**
 * Service Layer - MateriaService
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base-service'
import { MateriaRepository, Materia } from '../repositories/materia-repository'

export class MateriaService extends BaseService<Materia> {
    constructor(supabase: SupabaseClient) {
        super(new MateriaRepository(supabase))
    }

    protected async validateCreate(data: Partial<Materia>): Promise<void> {
        if (!data.nombre || data.nombre.trim().length < 3) {
            throw new Error('El nombre de la materia debe tener al menos 3 caracteres')
        }

        if (!data.clave || data.clave.trim().length < 2) {
            throw new Error('La clave de la materia es requerida (mínimo 2 caracteres)')
        }

        if (!data.id_departamento) {
            throw new Error('Debe seleccionar un departamento')
        }

        const existente = await (this.repository as MateriaRepository)
            .findByClave(data.clave.trim())
        
        if (existente) {
            throw new Error('Ya existe una materia con esa clave')
        }

        if (data.creditos && (data.creditos < 0 || data.creditos > 20)) {
            throw new Error('Los créditos deben estar entre 0 y 20')
        }
    }

    protected async validateUpdate(id: string | number, data: Partial<Materia>): Promise<void> {
        const existente = await this.repository.findById(id)
        if (!existente) {
            throw new Error('Materia no encontrada')
        }

        if (data.nombre && data.nombre.trim().length < 3) {
            throw new Error('El nombre de la materia debe tener al menos 3 caracteres')
        }

        if (data.clave && data.clave.trim() !== existente.clave) {
            const otro = await (this.repository as MateriaRepository)
                .findByClave(data.clave.trim())
            
            if (otro && otro.id_materia !== id) {
                throw new Error('Ya existe otra materia con esa clave')
            }
        }

        if (data.creditos && (data.creditos < 0 || data.creditos > 20)) {
            throw new Error('Los créditos deben estar entre 0 y 20')
        }
    }

    protected async validateDelete(id: string | number): Promise<void> {
        const materia = await this.repository.findById(id)
        if (!materia) {
            throw new Error('Materia no encontrada')
        }
    }

    async getMateriasConRelaciones(): Promise<any[]> {
        return (this.repository as MateriaRepository).getMateriasConRelaciones()
    }
}

