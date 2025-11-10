/**
 * Command Pattern - Patrón de Comando
 * 
 * Encapsula una solicitud como un objeto, permitiendo parametrizar clientes
 * con diferentes solicitudes, encolar solicitudes, y soportar operaciones reversibles.
 */

export interface Command {
    execute(): Promise<void>
    undo(): Promise<void>
    canUndo(): boolean
}

export interface CommandResult {
    success: boolean
    message?: string
    error?: Error
}

/**
 * Comando base abstracto
 */
export abstract class BaseCommand implements Command {
    protected executed: boolean = false
    protected undone: boolean = false

    abstract execute(): Promise<void>
    abstract undo(): Promise<void>

    canUndo(): boolean {
        return this.executed && !this.undone
    }

    protected markExecuted(): void {
        this.executed = true
        this.undone = false
    }

    protected markUndone(): void {
        this.undone = true
    }
}

/**
 * Invocador - Ejecuta y gestiona comandos
 */
export class CommandInvoker {
    private history: Command[] = []
    private currentIndex: number = -1
    private maxHistorySize: number = 50

    async execute(command: Command): Promise<CommandResult> {
        try {
            await command.execute()

            // Eliminar comandos después del índice actual (si se deshizo algo)
            if (this.currentIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.currentIndex + 1)
            }

            this.history.push(command)
            this.currentIndex = this.history.length - 1

            // Limitar tamaño del historial
            if (this.history.length > this.maxHistorySize) {
                this.history.shift()
                this.currentIndex--
            }

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error as Error
            }
        }
    }

    async undo(): Promise<CommandResult> {
        if (this.currentIndex < 0) {
            return {
                success: false,
                message: 'No hay comandos para deshacer'
            }
        }

        const command = this.history[this.currentIndex]
        if (!command.canUndo()) {
            return {
                success: false,
                message: 'Este comando no se puede deshacer'
            }
        }

        try {
            await command.undo()
            this.currentIndex--
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error as Error
            }
        }
    }

    async redo(): Promise<CommandResult> {
        if (this.currentIndex >= this.history.length - 1) {
            return {
                success: false,
                message: 'No hay comandos para rehacer'
            }
        }

        this.currentIndex++
        const command = this.history[this.currentIndex]

        try {
            await command.execute()
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error as Error
            }
        }
    }

    canUndo(): boolean {
        return this.currentIndex >= 0 &&
            this.history[this.currentIndex]?.canUndo() === true
    }

    canRedo(): boolean {
        return this.currentIndex < this.history.length - 1
    }

    clearHistory(): void {
        this.history = []
        this.currentIndex = -1
    }

    getHistorySize(): number {
        return this.history.length
    }
}

/**
 * Comando concreto: Crear registro
 */
export class CreateCommand<T> extends BaseCommand {
    private createdId?: string | number
    private originalData?: Partial<T>

    constructor(
        private createFn: (data: Partial<T>) => Promise<T>,
        private deleteFn: (id: string | number) => Promise<void>,
        private data: Partial<T>
    ) {
        super()
    }

    async execute(): Promise<void> {
        const result = await this.createFn(this.data)
        this.createdId = (result as any).id_estudiante || (result as any).id || result
        this.markExecuted()
    }

    async undo(): Promise<void> {
        if (this.createdId) {
            await this.deleteFn(this.createdId)
            this.markUndone()
        }
    }
}

/**
 * Comando concreto: Actualizar registro
 */
export class UpdateCommand<T> extends BaseCommand {
    private previousData?: T

    constructor(
        private updateFn: (id: string | number, data: Partial<T>) => Promise<T>,
        private getFn: (id: string | number) => Promise<T | null>,
        private id: string | number,
        private newData: Partial<T>
    ) {
        super()
    }

    async execute(): Promise<void> {
        // Guardar estado anterior
        this.previousData = await this.getFn(this.id) || undefined
        await this.updateFn(this.id, this.newData)
        this.markExecuted()
    }

    async undo(): Promise<void> {
        if (this.previousData) {
            await this.updateFn(this.id, this.previousData as Partial<T>)
            this.markUndone()
        }
    }
}

/**
 * Comando concreto: Eliminar registro
 */
export class DeleteCommand<T> extends BaseCommand {
    private deletedData?: T

    constructor(
        private deleteFn: (id: string | number) => Promise<void>,
        private createFn: (data: Partial<T>) => Promise<T>,
        private id: string | number,
        private getFn: (id: string | number) => Promise<T | null>
    ) {
        super()
    }

    async execute(): Promise<void> {
        // Guardar datos antes de eliminar
        this.deletedData = await this.getFn(this.id) || undefined
        await this.deleteFn(this.id)
        this.markExecuted()
    }

    async undo(): Promise<void> {
        if (this.deletedData) {
            await this.createFn(this.deletedData as Partial<T>)
            this.markUndone()
        }
    }
}

