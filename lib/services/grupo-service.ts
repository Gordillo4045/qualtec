/**
 * Service Layer - GrupoService
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base-service'
import { GrupoRepository, Grupo } from '../repositories/grupo-repository'

export class GrupoService extends BaseService<Grupo> {
    constructor(supabase: SupabaseClient) {
        super(new GrupoRepository(supabase))
    }

    protected async validateCreate(data: Partial<Grupo>): Promise<void> {
        if (!data.clave || data.clave.trim().length < 2) {
            throw new Error('La clave del grupo debe tener al menos 2 caracteres')
        }

        if (!data.id_carrera) {
            throw new Error('Debe seleccionar una carrera')
        }

        const existente = await (this.repository as GrupoRepository)
            .findByClave(data.clave.trim())
        
        if (existente) {
            throw new Error('Ya existe un grupo con esa clave')
        }
    }

    protected async validateUpdate(id: string | number, data: Partial<Grupo>): Promise<void> {
        const existente = await this.repository.findById(id)
        if (!existente) {
            throw new Error('Grupo no encontrado')
        }

        if (data.clave && data.clave.trim().length < 2) {
            throw new Error('La clave del grupo debe tener al menos 2 caracteres')
        }

        if (data.clave && data.clave.trim() !== existente.clave) {
            const otro = await (this.repository as GrupoRepository)
                .findByClave(data.clave.trim())
            
            if (otro && otro.id_grupo !== id) {
                throw new Error('Ya existe otro grupo con esa clave')
            }
        }
    }

    protected async validateDelete(id: string | number): Promise<void> {
        const grupo = await this.repository.findById(id)
        if (!grupo) {
            throw new Error('Grupo no encontrado')
        }
    }

    async getGruposConRelaciones(): Promise<any[]> {
        return (this.repository as GrupoRepository).getGruposConRelaciones()
    }
}

