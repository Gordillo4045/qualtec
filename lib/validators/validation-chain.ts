/**
 * Chain of Responsibility Pattern - Cadena de Responsabilidad
 * 
 * Permite pasar solicitudes a lo largo de una cadena de manejadores.
 * Cada manejador decide si procesa la solicitud o la pasa al siguiente.
 */

export interface ValidationResult {
    isValid: boolean
    error?: string
    field?: string
}

export abstract class ValidationHandler {
    protected nextHandler?: ValidationHandler

    setNext(handler: ValidationHandler): ValidationHandler {
        this.nextHandler = handler
        return handler
    }

    async handle(data: any, field: string, value: any): Promise<ValidationResult> {
        const result = await this.validate(data, field, value)

        if (!result.isValid) {
            return result
        }

        if (this.nextHandler) {
            return this.nextHandler.handle(data, field, value)
        }

        return { isValid: true }
    }

    protected abstract validate(data: any, field: string, value: any): Promise<ValidationResult>
}

/**
 * Validador: Campo requerido
 */
export class RequiredValidator extends ValidationHandler {
    protected async validate(data: any, field: string, value: any): Promise<ValidationResult> {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return {
                isValid: false,
                error: `El campo ${field} es requerido`,
                field
            }
        }
        return { isValid: true }
    }
}

/**
 * Validador: Longitud mínima
 */
export class MinLengthValidator extends ValidationHandler {
    constructor(private minLength: number) {
        super()
    }

    protected async validate(data: any, field: string, value: any): Promise<ValidationResult> {
        if (value && typeof value === 'string' && value.length < this.minLength) {
            return {
                isValid: false,
                error: `El campo ${field} debe tener al menos ${this.minLength} caracteres`,
                field
            }
        }
        return { isValid: true }
    }
}

/**
 * Validador: Longitud máxima
 */
export class MaxLengthValidator extends ValidationHandler {
    constructor(private maxLength: number) {
        super()
    }

    protected async validate(data: any, field: string, value: any): Promise<ValidationResult> {
        if (value && typeof value === 'string' && value.length > this.maxLength) {
            return {
                isValid: false,
                error: `El campo ${field} no puede tener más de ${this.maxLength} caracteres`,
                field
            }
        }
        return { isValid: true }
    }
}

/**
 * Validador: Formato de email
 */
export class EmailValidator extends ValidationHandler {
    private emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

    protected async validate(data: any, field: string, value: any): Promise<ValidationResult> {
        if (value && typeof value === 'string' && !this.emailRegex.test(value)) {
            return {
                isValid: false,
                error: `El campo ${field} debe tener un formato de email válido`,
                field
            }
        }
        return { isValid: true }
    }
}

/**
 * Validador: Formato de teléfono (10 dígitos)
 */
export class PhoneValidator extends ValidationHandler {
    protected async validate(data: any, field: string, value: any): Promise<ValidationResult> {
        if (value) {
            const cleaned = value.replace(/\D/g, '')
            if (cleaned.length !== 10) {
                return {
                    isValid: false,
                    error: `El campo ${field} debe tener exactamente 10 dígitos`,
                    field
                }
            }
        }
        return { isValid: true }
    }
}

/**
 * Validador: Rango numérico
 */
export class RangeValidator extends ValidationHandler {
    constructor(private min: number, private max: number) {
        super()
    }

    protected async validate(data: any, field: string, value: any): Promise<ValidationResult> {
        if (value !== null && value !== undefined) {
            const num = Number(value)
            if (isNaN(num) || num < this.min || num > this.max) {
                return {
                    isValid: false,
                    error: `El campo ${field} debe estar entre ${this.min} y ${this.max}`,
                    field
                }
            }
        }
        return { isValid: true }
    }
}

/**
 * Validador: Fecha válida y rango de edad
 */
export class DateRangeValidator extends ValidationHandler {
    constructor(private minAge?: number, private maxAge?: number) {
        super()
    }

    protected async validate(data: any, field: string, value: any): Promise<ValidationResult> {
        if (value) {
            const date = new Date(value)
            if (isNaN(date.getTime())) {
                return {
                    isValid: false,
                    error: `El campo ${field} debe ser una fecha válida`,
                    field
                }
            }

            if (this.minAge || this.maxAge) {
                const today = new Date()
                const age = today.getFullYear() - date.getFullYear()
                const monthDiff = today.getMonth() - date.getMonth()
                const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())
                    ? age - 1
                    : age

                if (this.minAge && actualAge < this.minAge) {
                    return {
                        isValid: false,
                        error: `El campo ${field} indica una edad menor a ${this.minAge} años`,
                        field
                    }
                }

                if (this.maxAge && actualAge > this.maxAge) {
                    return {
                        isValid: false,
                        error: `El campo ${field} indica una edad mayor a ${this.maxAge} años`,
                        field
                    }
                }
            }
        }
        return { isValid: true }
    }
}

/**
 * Constructor de cadena de validación
 */
export class ValidationChain {
    private chain: ValidationHandler

    constructor() {
        this.chain = new RequiredValidator() // Primer validador por defecto
    }

    required(): this {
        this.chain = new RequiredValidator()
        return this
    }

    minLength(length: number): this {
        const validator = new MinLengthValidator(length)
        this.chain.setNext(validator)
        return this
    }

    maxLength(length: number): this {
        const validator = new MaxLengthValidator(length)
        this.chain.setNext(validator)
        return this
    }

    email(): this {
        const validator = new EmailValidator()
        this.chain.setNext(validator)
        return this
    }

    phone(): this {
        const validator = new PhoneValidator()
        this.chain.setNext(validator)
        return this
    }

    range(min: number, max: number): this {
        const validator = new RangeValidator(min, max)
        this.chain.setNext(validator)
        return this
    }

    dateRange(minAge?: number, maxAge?: number): this {
        const validator = new DateRangeValidator(minAge, maxAge)
        this.chain.setNext(validator)
        return this
    }

    async validate(data: any, field: string, value: any): Promise<ValidationResult> {
        return this.chain.handle(data, field, value)
    }
}

