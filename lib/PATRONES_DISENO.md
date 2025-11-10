# Patrones de Diseño en QualTec

Este documento describe todos los patrones de diseño implementados en el proyecto QualTec.

## 📋 Índice de Patrones

### Patrones Creacionales
1. [Factory Method](#1-factory-method)
2. [Singleton](#2-singleton)
3. [Builder](#3-builder-pattern)

### Patrones Estructurales
4. [Adapter](#4-adapter)
5. [Facade](#5-facade)
6. [Composite](#6-composite)
7. [Decorator](#7-decorator)
8. [Proxy](#8-proxy)

### Patrones de Comportamiento
9. [Strategy](#9-strategy)
10. [Observer](#10-observer)
11. [Command](#11-command-pattern)
12. [Chain of Responsibility](#12-chain-of-responsibility)
13. [Mediator](#13-mediator)
14. [State](#14-state)
15. [Template Method](#15-template-method)
16. [Iterator](#16-iterator)

### Patrones React/Next.js
17. [Custom Hooks](#17-custom-hooks)
18. [Context API (Provider)](#18-context-api)
19. [Compound Components](#19-compound-components)
20. [Variant Pattern (CVA)](#20-variant-pattern)
21. [Slot Pattern](#21-slot-pattern)
22. [Service Layer](#22-service-layer)
23. [Repository Pattern](#23-repository-pattern)

---

## 1. Factory Method

**Ubicación:** `utils/supabase/client.ts`, `utils/supabase/server.ts`, `utils/supabase/middleware.ts`

**Descripción:** Proporciona una interfaz para crear objetos sin especificar su clase exacta.

```typescript
// Ejemplo de uso
import { createClient } from '@/utils/supabase/client'

const supabase = createClient() // Crea cliente para navegador
```

---

## 2. Singleton

**Ubicación:** Clientes Supabase

**Descripción:** Asegura que una clase tenga solo una instancia y proporciona acceso global.

**Nota:** Implementado implícitamente a través de la configuración de módulos de Next.js.

---

## 3. Builder Pattern

**Ubicación:** `lib/builders/query-builder.ts`

**Descripción:** Permite construir consultas complejas paso a paso.

**Ejemplo de uso:**

```typescript
import { QueryBuilder } from '@/lib/builders/query-builder'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

// Construir consulta paso a paso
const estudiantes = await new QueryBuilder(supabase, 'estudiante')
    .where('estatus', 'activo')
    .whereGreaterThan('fecha_ingreso', '2020-01-01')
    .orderBy('ap_paterno', true)
    .limit(50)
    .execute()
```

---

## 4. Adapter

**Ubicación:** Funciones de preparación de datos en `app/analitica/page.tsx`

**Descripción:** Adapta la estructura de datos de Supabase al formato requerido por Recharts.

**Ejemplo:**

```typescript
const getControlReprobacion = () => {
    // Adapta datos de Supabase al formato de Recharts
    return dataToAnalyze.map((item: any) => ({
        periodo: item.periodo?.nombre || 'N/A',
        reprobacion: Number(value.toFixed(1))
    }))
}
```

---

## 5. Facade

**Ubicación:** `lib/utils.ts`, funciones de servicio

**Descripción:** Proporciona una interfaz simplificada a un subsistema complejo.

**Ejemplo:**

```typescript
import { cn } from '@/lib/utils'

// Facade que simplifica la combinación de clases CSS
const className = cn('base-class', condition && 'conditional-class')
```

---

## 6. Composite

**Ubicación:** Estructura de componentes React

**Descripción:** Compone objetos en estructuras de árbol para representar jerarquías.

**Ejemplo:**

```tsx
<Layout>
    <Card>
        <CardHeader>
            <CardTitle>Título</CardTitle>
        </CardHeader>
        <CardContent>
            Contenido
        </CardContent>
    </Card>
</Layout>
```

---

## 7. Decorator

**Ubicación:** `components/auth-guard.tsx`

**Descripción:** Añade funcionalidad adicional a componentes sin modificar su estructura.

**Ejemplo:**

```tsx
<AuthGuard>
    <MyProtectedComponent />
</AuthGuard>
```

---

## 8. Proxy

**Ubicación:** `middleware.ts`, `components/auth-guard.tsx`

**Descripción:** Controla el acceso a objetos, interceptando solicitudes.

**Ejemplo:**

```typescript
// middleware.ts intercepta todas las solicitudes
export async function middleware(req: NextRequest) {
    // Verifica autenticación antes de permitir acceso
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    await supabase.auth.getSession()
    return res
}
```

---

## 9. Strategy

**Ubicación:** `app/analitica/page.tsx`

**Descripción:** Define una familia de algoritmos y los hace intercambiables.

**Ejemplo:**

```typescript
const cardReportStrategies = {
    'totalEstudiantes': generateReporteGeneralPDF,
    'reporteExcel': generateReporteGeneralExcel,
}

const handleCardGenerate = async (reportType: string) => {
    const strategy = cardReportStrategies[reportType]
    await strategy()
}
```

---

## 10. Observer

**Ubicación:** React hooks, `hooks/use-auth.ts`

**Descripción:** Define una dependencia uno-a-muchos entre objetos.

**Ejemplo:**

```typescript
// use-auth.ts
useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
            setUser(session?.user ?? null) // Notifica a observadores
        }
    )
    return () => subscription.unsubscribe()
}, [])
```

---

## 11. Command Pattern

**Ubicación:** `lib/commands/command-pattern.ts`

**Descripción:** Encapsula solicitudes como objetos, permitiendo operaciones reversibles.

**Ejemplo de uso:**

```typescript
import { CommandInvoker, CreateCommand, UpdateCommand } from '@/lib/commands/command-pattern'
import { EstudianteRepository } from '@/lib/repositories/estudiante-repository'

const invoker = new CommandInvoker()
const repo = new EstudianteRepository(supabase)

// Crear comando
const createCmd = new CreateCommand(
    (data) => repo.create(data),
    (id) => repo.delete(id),
    { numero_control: '21212372', nombres: 'Juan', ... }
)

// Ejecutar
await invoker.execute(createCmd)

// Deshacer
await invoker.undo()

// Rehacer
await invoker.redo()
```

---

## 12. Chain of Responsibility

**Ubicación:** `lib/validators/validation-chain.ts`

**Descripción:** Pasa solicitudes a lo largo de una cadena de manejadores.

**Ejemplo de uso:**

```typescript
import { ValidationChain } from '@/lib/validators/validation-chain'

const validator = new ValidationChain()
    .required()
    .minLength(3)
    .maxLength(50)
    .email()

const result = await validator.validate(formData, 'email', formData.email)

if (!result.isValid) {
    toast.error(result.error)
}
```

---

## 13. Mediator

**Ubicación:** `app/analitica/page.tsx`

**Descripción:** Centraliza la comunicación entre componentes.

**Ejemplo:** El componente `AnaliticaPage` actúa como mediador entre filtros y gráficos.

---

## 14. State

**Ubicación:** Componentes React con `useState`

**Descripción:** Permite que un objeto altere su comportamiento cuando su estado cambia.

**Ejemplo:**

```typescript
const [isEditing, setIsEditing] = useState(false)

// El comportamiento del componente cambia según el estado
{isEditing ? <EditForm /> : <ViewMode />}
```

---

## 15. Template Method

**Ubicación:** `lib/templates/crud-template.tsx`

**Descripción:** Define el esqueleto de un algoritmo en una clase base.

**Ejemplo de uso:**

```tsx
import { CRUDTemplate } from '@/lib/templates/crud-template'

<CRUDTemplate
    title="Estudiantes"
    fetchData={async () => {
        const repo = new EstudianteRepository(supabase)
        return repo.findAll()
    }}
    searchFields={['nombres', 'ap_paterno', 'numero_control']}
    columns={[
        { key: 'numero_control', label: 'Número de Control' },
        { key: 'nombres', label: 'Nombre' },
    ]}
    onEdit={(item) => handleEdit(item)}
    onDelete={(item) => handleDelete(item)}
/>
```

---

## 16. Iterator

**Ubicación:** Uso extensivo de métodos de array

**Descripción:** Proporciona una forma de acceder a elementos secuencialmente.

**Ejemplo:**

```typescript
estudiantes.forEach(estudiante => {
    // Procesar cada estudiante
})

const activos = estudiantes.filter(e => e.estatus === 'activo')
```

---

## 17. Custom Hooks

**Ubicación:** `hooks/use-auth.ts`, `hooks/use-audit.ts`, `hooks/use-mobile.ts`

**Descripción:** Encapsula lógica reutilizable de estado y efectos.

**Ejemplo:**

```typescript
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
    const { user, loading, signOut } = useAuth()
    // Usar lógica de autenticación
}
```

---

## 18. Context API

**Ubicación:** `components/ui/sidebar.tsx`, `components/ui/chart.tsx`

**Descripción:** Proporciona estado global compartido.

**Ejemplo:**

```typescript
import { useSidebar } from '@/components/ui/sidebar'

function MyComponent() {
    const { open, toggleSidebar } = useSidebar()
}
```

---

## 19. Compound Components

**Ubicación:** `components/ui/card.tsx`, `components/ui/field.tsx`

**Descripción:** Componentes que se usan juntos para formar una interfaz completa.

**Ejemplo:**

```tsx
<Card>
    <CardHeader>
        <CardTitle>Título</CardTitle>
    </CardHeader>
    <CardContent>Contenido</CardContent>
</Card>
```

---

## 20. Variant Pattern

**Ubicación:** `components/ui/button.tsx`

**Descripción:** Define variantes de estilo usando Class Variance Authority.

**Ejemplo:**

```tsx
<Button variant="destructive" size="lg">
    Eliminar
</Button>
```

---

## 21. Slot Pattern

**Ubicación:** `components/ui/button.tsx`

**Descripción:** Permite renderizar componentes como otros elementos.

**Ejemplo:**

```tsx
<Button asChild>
    <Link href="/dashboard">Ir al Dashboard</Link>
</Button>
```

---

## 22. Service Layer

**Ubicación:** `lib/services/base-service.ts`

**Descripción:** Encapsula lógica de negocio y coordina entre repositorios.

**Ejemplo de uso:**

```typescript
import { BaseService } from '@/lib/services/base-service'
import { EstudianteRepository } from '@/lib/repositories/estudiante-repository'

class EstudianteService extends BaseService<Estudiante> {
    constructor(supabase: SupabaseClient) {
        super(new EstudianteRepository(supabase))
    }

    protected async validateCreate(data: Partial<Estudiante>): Promise<void> {
        // Validaciones específicas de negocio
        if (!data.numero_control) {
            throw new Error('Número de control requerido')
        }
    }

    protected async validateUpdate(id: string, data: Partial<Estudiante>): Promise<void> {
        // Validaciones de actualización
    }

    protected async validateDelete(id: string): Promise<void> {
        // Validaciones de eliminación
    }
}
```

---

## 23. Repository Pattern

**Ubicación:** `lib/repositories/base-repository.ts`, `lib/repositories/estudiante-repository.ts`

**Descripción:** Abstrae el acceso a datos, proporcionando una interfaz uniforme.

**Ejemplo de uso:**

```typescript
import { EstudianteRepository } from '@/lib/repositories/estudiante-repository'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()
const repo = new EstudianteRepository(supabase)

// Operaciones CRUD uniformes
const estudiantes = await repo.findAll()
const estudiante = await repo.findById('123')
const nuevo = await repo.create({ numero_control: '21212372', ... })
await repo.update('123', { nombres: 'Juan' })
await repo.delete('123')

// Métodos específicos del dominio
const porControl = await repo.findByNumeroControl('21212372')
const porCarrera = await repo.findByCarrera(1)
const busqueda = await repo.searchByNombre('Juan')
```

---

## 📚 Resumen

El proyecto QualTec implementa **23 patrones de diseño** que cubren:

- **Creacionales:** Factory Method, Singleton, Builder
- **Estructurales:** Adapter, Facade, Composite, Decorator, Proxy
- **Comportamiento:** Strategy, Observer, Command, Chain of Responsibility, Mediator, State, Template Method, Iterator
- **React/Next.js:** Custom Hooks, Context API, Compound Components, Variant Pattern, Slot Pattern
- **Arquitectura:** Service Layer, Repository Pattern

Estos patrones proporcionan:
- ✅ Código más mantenible y escalable
- ✅ Separación de responsabilidades
- ✅ Reutilización de código
- ✅ Facilidad de testing
- ✅ Mejor organización del proyecto

---

## 🚀 Próximos Pasos

Para usar estos patrones en tu código:

1. **Repository Pattern:** Usa repositorios para acceso a datos
2. **Builder Pattern:** Usa QueryBuilder para consultas complejas
3. **Chain of Responsibility:** Usa ValidationChain para validaciones
4. **Command Pattern:** Usa CommandInvoker para operaciones reversibles
5. **Template Method:** Usa CRUDTemplate para páginas CRUD rápidas
6. **Service Layer:** Extiende BaseService para lógica de negocio

