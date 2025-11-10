/**
 * Service Layer Pattern - Capa de Servicio
 * 
 * Encapsula la lógica de negocio y coordina entre repositorios.
 * Proporciona una interfaz de alto nivel para operaciones de dominio.
 */

import { Repository } from '../repositories/base-repository'

export abstract class BaseService<T> {
    protected repository: Repository<T>

    constructor(repository: Repository<T>) {
        this.repository = repository
    }

    /**
     * Obtiene todos los registros
     */
    async getAll(): Promise<T[]> {
        return this.repository.findAll()
    }

    /**
     * Obtiene un registro por ID
     */
    async getById(id: string | number): Promise<T | null> {
        return this.repository.findById(id)
    }

    /**
     * Crea un nuevo registro con validación
     */
    async create(data: Partial<T>): Promise<T> {
        await this.validateCreate(data)
        return this.repository.create(data)
    }

    /**
     * Actualiza un registro con validación
     */
    async update(id: string | number, data: Partial<T>): Promise<T> {
        await this.validateUpdate(id, data)
        return this.repository.update(id, data)
    }

    /**
     * Elimina un registro con validación
     */
    async delete(id: string | number): Promise<boolean> {
        await this.validateDelete(id)
        return this.repository.delete(id)
    }

    /**
     * Métodos abstractos para validación (Template Method)
     */
    protected abstract validateCreate(data: Partial<T>): Promise<void>
    protected abstract validateUpdate(id: string | number, data: Partial<T>): Promise<void>
    protected abstract validateDelete(id: string | number): Promise<void>
}

