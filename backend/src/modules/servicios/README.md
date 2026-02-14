# 💅 Módulo de Servicios

## 📋 Descripción

Módulo completo de gestión de servicios de manicura con arquitectura en capas, manejo robusto de errores y validaciones exhaustivas.

## 🏗️ Arquitectura

Este módulo sigue el patrón **Controller → Service → Repository** (3-tier architecture) para garantizar:

- **Separación de responsabilidades**: Cada capa tiene un propósito único
- **Testabilidad**: Cada capa se puede testear independientemente
- **Mantenibilidad**: Cambios en una capa no afectan a las demás
- **Escalabilidad**: Fácil agregar nueva funcionalidad

### 📁 Estructura de archivos

```
servicios/
├── servicio.controller.ts    # Manejo de HTTP (req/res)
├── servicio.service.ts        # Lógica de negocio
├── servicio.repository.ts     # Acceso a datos (Prisma)
├── servicio.routes.ts         # Definición de rutas
├── servicio.validation.ts     # Validaciones con Zod
├── EJEMPLOS_API.md            # Ejemplos de uso
└── README.md                  # Esta documentación
```

## 🔄 Flujo de datos

```
┌─────────────┐
│   Request   │ HTTP Request
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   Middlewares   │ Auth → Role → Validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │ • Recibe req/res
│                 │ • Extrae parámetros
│                 │ • Llama al service
│                 │ • Formatea respuesta
│                 │ • Maneja errores (next)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Service     │ • Validaciones de negocio
│                 │ • Orquesta operaciones
│                 │ • Transforma datos
│                 │ • Lanza errores tipados
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │ • Queries de Prisma
│                 │ • Transacciones DB
│                 │ • Return raw data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Database     │ PostgreSQL
└─────────────────┘
```

## 🎯 Endpoints

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `POST` | `/api/servicios` | Crear servicio | ADMIN |
| `GET` | `/api/servicios` | Listar servicios | ADMIN, TRABAJADORA |
| `GET` | `/api/servicios/:id` | Obtener por ID | ADMIN |
| `PUT` | `/api/servicios/:id` | Actualizar servicio | ADMIN |
| `PATCH` | `/api/servicios/:id/estado` | Cambiar estado (activo/inactivo) | ADMIN |

## 🔐 Reglas de negocio

### Al crear servicio

✅ El nombre debe ser único (case insensitive)  
✅ La duración debe ser entre 1 y 480 minutos (8 horas)  
✅ El servicio se crea activo por defecto  
✅ El nombre debe tener mínimo 3 caracteres y máximo 100  

### Al actualizar servicio

✅ Se valida que el nombre siga siendo único (si se cambia)  
✅ No puede haber otro servicio activo con el mismo nombre  
✅ La duración debe ser un número entero positivo  

### Al desactivar servicio

⚠️ **No se puede desactivar si**:
- Es el único servicio activo en el sistema

✅ Los servicios inactivos no aparecen para las trabajadoras  
✅ Los servicios inactivos siguen disponibles para el admin  

### Permisos por rol

**ADMIN**:
- Ve **todos** los servicios (activos e inactivos)
- Puede crear, actualizar y cambiar estado de servicios
- Puede ver cualquier servicio por ID

**TRABAJADORA**:
- Ve **solo** servicios activos
- No puede crear ni modificar servicios
- Los servicios activos se usan para crear citas

## 📦 Responsabilidades por capa

### Controller (`servicio.controller.ts`)

**Responsabilidades**:
- Extraer parámetros de `req.params`, `req.body`, `req.user`
- Llamar al método correspondiente del service
- Enviar respuesta HTTP con status code apropiado
- Pasar errores al middleware de manejo de errores

**NO hace**:
- ❌ Lógica de negocio
- ❌ Validaciones
- ❌ Acceso directo a base de datos

```typescript
export const crearServicio = async (req, res, next) => {
  try {
    const result = await service.crear(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error); // Delega al error middleware
  }
};
```

### Service (`servicio.service.ts`)

**Responsabilidades**:
- Aplicar reglas de negocio
- Validar condiciones previas (ej: nombre duplicado, único servicio activo)
- Orquestar llamadas al repository
- Lanzar errores descriptivos
- Transformar datos para respuesta
- Filtrar servicios según el rol del usuario

**NO hace**:
- ❌ Manejo de req/res
- ❌ Queries directas a base de datos

```typescript
async crear(data: CrearServicioInput) {
  // Validación de negocio
  const servicioExistente = await this.repository.buscarPorNombre(data.nombre);
  if (servicioExistente) {
    throw new Error('Ya existe un servicio con ese nombre');
  }

  // Delegación al repository
  const servicio = await this.repository.crear(data);
  
  // Transformación de datos
  return {
    message: 'Servicio creado exitosamente',
    servicio: { ...formatearServicio(servicio) },
  };
}
```

### Repository (`servicio.repository.ts`)

**Responsabilidades**:
- Ejecutar queries de Prisma
- Implementar transacciones si son necesarias
- Retornar datos crudos de la base de datos
- Implementar métodos de búsqueda específicos

**NO hace**:
- ❌ Validaciones de negocio
- ❌ Transformación de datos
- ❌ Manejo de errores de negocio

```typescript
async buscarPorNombre(nombre: string) {
  return await prisma.servicio.findFirst({
    where: {
      nombre: {
        equals: nombre,
        mode: 'insensitive', // Case insensitive
      },
    },
  });
}
```

## 🛡️ Validaciones

### Con Zod (`servicio.validation.ts`)

Todas las validaciones de entrada se hacen con **Zod** antes de llegar al controller:

```typescript
export const crearServicioSchema = z.object({
  body: z.object({
    nombre: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede superar 100 caracteres')
      .trim(),
    duracionMinutos: z
      .number()
      .int('La duración debe ser un número entero')
      .positive('La duración debe ser mayor a 0')
      .max(480, 'La duración no puede superar 480 minutos'),
    precio: z
      .number()
      .positive('El precio debe ser mayor a 0')
      .optional(),
  }),
});
```

**Ventajas**:
- ✅ Type-safety automático con TypeScript
- ✅ Mensajes de error descriptivos
- ✅ Validación centralizada en un solo lugar
- ✅ Fácil de mantener y extender

## 🚨 Manejo de errores

### Errores comunes

| Error | Causa | Status Code |
|-------|-------|-------------|
| Servicio no encontrado | ID inexistente | 404 |
| Nombre duplicado | Servicio con mismo nombre ya existe | 409 |
| Único servicio activo | Intentar desactivar el último activo | 400 |
| Validación fallida | Datos inválidos (Zod) | 400 |
| Sin autorización | Token inválido/expirado | 401 |
| Sin permisos | Rol insuficiente | 403 |

## 📊 Estructura de datos

### Modelo Servicio (Prisma)

```prisma
model Servicio {
  id               String          @id @default(uuid())
  nombre           String          @unique
  duracionMinutos  Int
  precio           Float           @default(0)
  activo           Boolean         @default(true)
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  
  // Relaciones
  citas            CitaServicio[]
}
```

### Tipos TypeScript

```typescript
export type CrearServicioInput = {
  nombre: string;
  duracionMinutos: number;
  precio?: number;
};

export type ActualizarServicioInput = {
  nombre?: string;
  duracionMinutos?: number;
  precio?: number;
};
```

## 🔍 Casos de uso

### Caso 1: Admin gestiona catálogo de servicios

1. Admin crea servicios: "Manicure Clásico", "Manicure Gel", "Pedicure"
2. Configura duración de cada servicio (30, 60, 45 minutos)
3. Admin puede ver todos los servicios (activos e inactivos)
4. Admin actualiza precios cuando sea necesario

### Caso 2: Trabajadora consulta servicios disponibles

1. Trabajadora hace login
2. Consulta GET /api/servicios
3. Solo ve servicios activos
4. Usa esos servicios para agendar citas

### Caso 3: Desactivar servicio temporalmente

1. Admin desactiva "Manicure Gel" temporalmente
2. Sistema valida que no sea el único servicio activo
3. El servicio deja de aparecer para trabajadoras
4. Admin puede reactivarlo cuando quiera

## 📝 Notas importantes

### Performance

- Las búsquedas por nombre son case-insensitive usando `mode: 'insensitive'`
- Se utiliza índice único en la columna `nombre` para búsquedas rápidas
- Las consultas están optimizadas con `orderBy` para resultados consistentes

### Seguridad

- Todos los endpoints requieren autenticación JWT
- Solo ADMIN puede crear/modificar servicios
- TRABAJADORA solo tiene acceso de lectura (servicios activos)
- Validación estricta de inputs con Zod

### Mantenibilidad

- Código modular y fácil de testear
- Separación clara de responsabilidades
- Tipos TypeScript inferidos automáticamente desde Zod
- Comentarios JSDoc en funciones clave

## 🧪 Testing (Recomendaciones)

### Unit tests por implementar

```typescript
// servicio.service.test.ts
describe('ServicioService', () => {
  test('debe crear servicio con datos válidos', async () => {
    // Arrange
    const data = { nombre: 'Test', duracionMinutos: 30 };
    
    // Act
    const result = await service.crear(data);
    
    // Assert
    expect(result.servicio.nombre).toBe('Test');
  });

  test('debe lanzar error si nombre duplicado', async () => {
    // Test duplicate name validation
  });

  test('no debe desactivar último servicio activo', async () => {
    // Test business rule
  });
});
```

## 🔗 Relaciones con otros módulos

- **Citas**: Los servicios se asignan a citas mediante `CitaServicio`
- **Auth**: Usa middleware de autenticación y autorización
- **Trabajadoras**: Las trabajadoras usan los servicios activos

## 📚 Referencias

- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Validation](https://zod.dev/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0
