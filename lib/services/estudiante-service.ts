/**
 * Service Layer - EstudianteService
 * Encapsula la lógica de negocio para estudiantes
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base-service'
import { EstudianteRepository, Estudiante } from '../repositories/estudiante-repository'

export class EstudianteService extends BaseService<Estudiante> {
    constructor(supabase: SupabaseClient) {
        super(new EstudianteRepository(supabase))
    }

    protected async validateCreate(data: Partial<Estudiante>): Promise<void> {
        // Validar que el número de control sea único
        const existente = await (this.repository as EstudianteRepository)
            .findByNumeroControl(data.numero_control || '')
        
        if (existente) {
            throw new Error('El número de control ya existe')
        }

        // Validar formato de email
        if (data.email && data.numero_control) {
            const emailEsperado = `l${data.numero_control.trim()}@tectijuana.edu.mx`.toLowerCase()
            if (data.email.toLowerCase() !== emailEsperado) {
                throw new Error(`El email debe tener el formato: ${emailEsperado}`)
            }
        }

        // Validar teléfono
        if (data.telefono) {
            const telefonoLimpiado = data.telefono.replace(/\D/g, '')
            if (telefonoLimpiado.length !== 10) {
                throw new Error('El teléfono debe tener exactamente 10 dígitos')
            }
        }

        // Validar fecha de nacimiento
        if (data.fecha_nacimiento) {
            const fecha = new Date(data.fecha_nacimiento)
            const hoy = new Date()
            const edadMinima = new Date()
            edadMinima.setFullYear(edadMinima.getFullYear() - 18)
            const edadMaxima = new Date()
            edadMaxima.setFullYear(edadMaxima.getFullYear() - 100)

            if (fecha > hoy) {
                throw new Error('La fecha de nacimiento no puede ser una fecha futura')
            }
            if (fecha > edadMinima) {
                throw new Error('El estudiante debe tener al menos 18 años')
            }
            if (fecha < edadMaxima) {
                throw new Error('La fecha de nacimiento no es válida (edad máxima: 100 años)')
            }
        }
    }

    protected async validateUpdate(id: string | number, data: Partial<Estudiante>): Promise<void> {
        // Validar que el estudiante exista
        const existente = await this.repository.findById(id)
        if (!existente) {
            throw new Error('Estudiante no encontrado')
        }

        // Validar que no se cambie el número de control si ya existe otro
        if (data.numero_control && data.numero_control !== existente.numero_control) {
            const otro = await (this.repository as EstudianteRepository)
                .findByNumeroControl(data.numero_control)
            
            if (otro && otro.id_estudiante !== id) {
                throw new Error('El número de control ya está en uso')
            }
        }

        // Validar formato de email si se actualiza
        if (data.email && data.numero_control) {
            const emailEsperado = `l${data.numero_control.trim()}@tectijuana.edu.mx`.toLowerCase()
            if (data.email.toLowerCase() !== emailEsperado) {
                throw new Error(`El email debe tener el formato: ${emailEsperado}`)
            }
        }
    }

    protected async validateDelete(id: string | number): Promise<void> {
        const estudiante = await this.repository.findById(id)
        if (!estudiante) {
            throw new Error('Estudiante no encontrado')
        }
        // Aquí podrías agregar más validaciones de negocio
        // Por ejemplo, verificar que no tenga inscripciones activas
    }

    // Métodos adicionales específicos del servicio
    async getEstudiantesConRelaciones(): Promise<any[]> {
        // Acceder al supabase del repositorio
        const repository = this.repository as EstudianteRepository
        const supabase = (repository as any).supabase as SupabaseClient
        
        const { data, error } = await supabase
            .from('estudiante')
            .select(`
                *,
                carrera:carrera(*),
                modalidad:modalidad(*)
            `)
            .order('numero_control', { ascending: true })

        if (error) throw error
        return data || []
    }

    async buscarPorNombre(nombre: string): Promise<Estudiante[]> {
        return (this.repository as EstudianteRepository).searchByNombre(nombre)
    }

    async getEstudiantesActivos(): Promise<Estudiante[]> {
        return (this.repository as EstudianteRepository).findByEstatus('activo')
    }
}

