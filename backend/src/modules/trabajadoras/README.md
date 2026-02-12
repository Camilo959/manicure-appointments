# 👩‍💼 Módulo de Trabajadoras

## 📋 Descripción

Módulo completo de gestión de trabajadoras con arquitectura en capas, manejo robusto de errores y validaciones exhaustivas.

## 🏗️ Arquitectura

Este módulo sigue el patrón **Controller → Service → Repository** (3-tier architecture) para garantizar:

- **Separación de responsabilidades**: Cada capa tiene un propósito único
- **Testabilidad**: Cada capa se puede testear independientemente
- **Mantenibilidad**: Cambios en una capa no afectan a las demás
- **Escalabilidad**: Fácil agregar nueva funcionalidad

### 📁 Estructura de archivos

```
trabajadoras/
├── trabajadora.controller.ts    # Manejo de HTTP (req/res)
├── trabajadora.service.ts        # Lógica de negocio
├── trabajadora.repository.ts     # Acceso a datos (Prisma)
├── trabajadora.routes.ts         # Definición de rutas
├── trabajadora.validation.ts     # Validaciones con Zod
├── trabajadora.errors.ts         # Errores personalizados
├── trabajadora.types.ts          # TypeScript types/interfaces
└── README.md                     # Esta documentación
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
| `POST` | `/api/trabajadoras` | Crear trabajadora + user | ADMIN |
| `GET` | `/api/trabajadoras` | Listar trabajadoras | ADMIN, TRABAJADORA |
| `GET` | `/api/trabajadoras/:id` | Obtener por ID | ADMIN |
| `PUT` | `/api/trabajadoras/:id` | Actualizar trabajadora | ADMIN |
| `PATCH` | `/api/trabajadoras/:id/estado` | Cambiar estado (activa/inactiva) | ADMIN |
| `DELETE` | `/api/trabajadoras/:id` | Soft delete (desactivar) | ADMIN |

## 🔐 Reglas de negocio

### Al crear trabajadora

✅ Se crea automáticamente un `User` asociado con rol `TRABAJADORA`  
✅ El password se hashea con `bcrypt` (10 rounds)  
✅ El email debe ser único en toda la tabla `User`  
✅ Ambas entidades se crean en una **transacción atómica**  

### Al actualizar trabajadora

✅ Se valida que el email siga siendo único (si se cambia)  
✅ Si se proporciona nueva contraseña, se hashea antes de guardar  
✅ Los cambios se propagan al `User` asociado si corresponde  

### Al desactivar trabajadora

⚠️ **No se puede desactivar si**:
- Es la única trabajadora activa en el sistema
- Tiene citas pendientes/confirmadas/reprogramadas

✅ Al desactivar, también se desactiva el `User` asociado  

### Al reactivar trabajadora (Edge case importante)

⚠️ **No se puede reactivar si**:
- El usuario asociado fue eliminado manualmente de la base de datos
- El usuario asociado está inactivo (`User.activo = false`)

Este edge case protege contra inconsistencias de datos.

## 📦 Responsabilidades por capa

### Controller (`trabajadora.controller.ts`)

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
export const crearTrabajadora = async (req, res, next) => {
  try {
    const result = await service.crear(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error); // Delega al error middleware
  }
};
```

### Service (`trabajadora.service.ts`)

**Responsabilidades**:
- Aplicar reglas de negocio
- Validar condiciones previas (ej: email duplicado, última trabajadora activa)
- Hashear contraseñas
- Orquestar llamadas al repository
- Lanzar errores personalizados tipados
- Transformar datos para respuesta

**NO hace**:
- ❌ Manejo de req/res
- ❌ Queries directas a Prisma (delega al repository)

```typescript
async crear(data: CrearTrabajadoraInput) {
  // ✅ Validación de negocio
  const exists = await this.repository.buscarUsuarioPorEmail(data.email);
  if (exists) throw new TrabajadoraEmailDuplicateError(data.email);

  // ✅ Hashear password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // ✅ Delegar a repository
  const trabajadora = await this.repository.crear({ ...data, hashedPassword });

  // ✅ Transformar respuesta
  return { message: '...', trabajadora: { ... } };
}
```

### Repository (`trabajadora.repository.ts`)

**Responsabilidades**:
- Ejecutar queries de Prisma
- Manejar transacciones de base de datos
- Incluir relaciones necesarias
- Devolver datos crudos

**NO hace**:
- ❌ Lógica de negocio
- ❌ Transformaciones complejas
- ❌ Validaciones de reglas

```typescript
async crear(data) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ ... });
    const trabajadora = await tx.trabajadora.create({ ... });
    return trabajadora;
  });
}
```

## 🛡️ Manejo de errores

### Errores personalizados (`trabajadora.errors.ts`)

Todos heredan de `TrabajadoraError` con:
- `message`: Mensaje descriptivo
- `statusCode`: HTTP status code
- `code`: Código único para el frontend

```typescript
export class TrabajadoraNotFoundError extends TrabajadoraError {
  constructor(id: string) {
    super(`Trabajadora con ID ${id} no encontrada`, 404, 'TRABAJADORA_NOT_FOUND');
  }
}
```

### Errores disponibles

| Error | Status | Code | Cuándo |
|-------|--------|------|--------|
| `TrabajadoraNotFoundError` | 404 | `TRABAJADORA_NOT_FOUND` | ID no existe |
| `TrabajadoraEmailDuplicateError` | 409 | `EMAIL_DUPLICATE` | Email ya registrado |
| `TrabajadoraInactiveError` | 400 | `USER_INACTIVE` | User inactivo al reactivar |
| `TrabajadoraWithAppointmentsError` | 400 | `HAS_APPOINTMENTS` | Tiene citas agendadas |
| `LastActiveTrabajadoraError` | 400 | `LAST_ACTIVE_TRABAJADORA` | Única trabajadora activa |

### Propagación de errores

```
Service lanza error → Controller ejecuta next(error) → ErrorMiddleware procesa
```

## ✅ Validaciones (Zod)

### Validaciones de entrada

- **Nombre**: 3-100 caracteres, trim, no vacío
- **Email**: formato válido, lowercase, trim, único
- **Password**: 8-72 caracteres, 1 mayúscula, 1 minúscula, 1 número
- **UUID**: formato válido para IDs

### Schemas disponibles

```typescript
crearTrabajadoraSchema        // POST /trabajadoras
actualizarTrabajadoraSchema    // PUT /trabajadoras/:id
cambiarEstadoTrabajadoraSchema // PATCH /trabajadoras/:id/estado
obtenerTrabajadoraPorIdSchema  // GET /trabajadoras/:id
eliminarTrabajadoraSchema      // DELETE /trabajadoras/:id
```

## 🔒 Seguridad

### Autenticación
- JWT requerido en todas las rutas (middleware `authenticate`)
- Token debe estar en header `Authorization: Bearer <token>`

### Autorización
- Solo usuarios con rol `ADMIN` pueden:
  - Crear trabajadoras
  - Editar trabajadoras
  - Ver detalles individuales
  - Cambiar estado
  - Eliminar
- Usuarios con rol `TRABAJADORA` pueden:
  - Ver lista de trabajadoras activas (para agendar citas)

### Contraseñas
- Hasheadas con `bcrypt` (10 salt rounds)
- Nunca se devuelven en respuestas
- Requisitos: 8+ caracteres, mayúscula, minúscula, número

## 📊 Respuestas

### Formato estándar

```json
{
  "success": true,
  "message": "Trabajadora creada exitosamente",
  "trabajadora": {
    "id": "uuid",
    "nombre": "María García",
    "activa": true,
    "user": {
      "id": "uuid",
      "email": "maria@example.com",
      "activo": true
    },
    "createdAt": "2026-02-11T..."
  }
}
```

### En caso de error

```json
{
  "success": false,
  "message": "Ya existe una trabajadora con el email maria@example.com",
  "code": "EMAIL_DUPLICATE"
}
```

## 🧪 Testing (Recomendaciones)

### Tests unitarios (Service)

```typescript
describe('TrabajadoraService', () => {
  it('debe lanzar error si email duplicado', async () => {
    // Mock repository
    repository.buscarUsuarioPorEmail = jest.fn().mockResolvedValue({ id: '123' });
    
    await expect(service.crear(data))
      .rejects.toThrow(TrabajadoraEmailDuplicateError);
  });
});
```

### Tests de integración (Repository)

```typescript
describe('TrabajadoraRepository', () => {
  it('debe crear User + Trabajadora en transacción', async () => {
    const result = await repository.crear(data);
    
    expect(result.user).toBeDefined();
    expect(result.user.rol).toBe('TRABAJADORA');
  });
});
```

### Tests E2E (Routes)

```typescript
describe('POST /api/trabajadoras', () => {
  it('debe retornar 401 sin token', async () => {
    const res = await request(app).post('/api/trabajadoras').send(data);
    expect(res.status).toBe(401);
  });
});
```

## 🚀 Mejoras futuras

- [ ] Paginación en `GET /trabajadoras`
- [ ] Filtros (activa, búsqueda por nombre)
- [ ] Ordenamiento configurable
- [ ] Reasignación masiva de citas al desactivar
- [ ] Logs de auditoría (quién creó/modificó)
- [ ] Soft delete con `deletedAt` timestamp
- [ ] Validación de horarios de disponibilidad
- [ ] Upload de foto de perfil

## 📚 Decisiones de diseño

### ¿Por qué transacciones?

La creación de trabajadora involucra 2 operaciones (User + Trabajadora). Si falla una, ambas deben revertirse para evitar inconsistencias.

### ¿Por qué errores personalizados?

- Frontend puede tomar acciones específicas según el `code`
- Mensajes claros para debugging
- Status codes correctos automáticamente

### ¿Por qué soft delete?

- Mantiene integridad referencial (citas históricas)
- Permite auditoría
- Posibilita reactivación

### ¿Por qué separar Repository?

- Aisla lógica de Prisma
- Facilita cambio de ORM en el futuro
- Permite mockear fácilmente en tests

## 🤝 Contribución

Al agregar nuevas features:

1. Actualizar validaciones en `trabajadora.validation.ts`
2. Agregar lógica de negocio en `trabajadora.service.ts`
3. Crear queries necesarias en `trabajadora.repository.ts`
4. Exponer endpoint en `trabajadora.controller.ts` y `trabajadora.routes.ts`
5. Documentar en este README

---

**Autor**: Backend Team  
**Última actualización**: 2026-02-11
