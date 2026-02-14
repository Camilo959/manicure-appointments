# 📮 Ejemplos de uso de la API de Servicios

## 🔑 Prerequisitos

Todas las peticiones requieren:
- Token JWT válido de un usuario con rol `ADMIN` (excepto GET /servicios que también permite TRABAJADORA)
- Header: `Authorization: Bearer <tu_token_jwt>`
- Header: `Content-Type: application/json`

## 📝 Ejemplos de peticiones

### 1. Crear servicio

```bash
POST /api/servicios
```

**Request:**

```json
{
  "nombre": "Manicure Clásico",
  "duracionMinutos": 30,
  "precio": 25000
}
```

**Response exitosa (201):**

```json
{
  "success": true,
  "message": "Servicio creado exitosamente",
  "servicio": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Manicure Clásico",
    "duracionMinutos": 30,
    "precio": 25000,
    "activo": true,
    "createdAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Errores posibles:**

```json
// 409 - Nombre duplicado
{
  "success": false,
  "message": "Ya existe un servicio con ese nombre"
}

// 400 - Validación fallida (duración muy alta)
{
  "success": false,
  "message": "La duración no puede superar 480 minutos (8 horas)"
}

// 400 - Validación fallida (nombre muy corto)
{
  "success": false,
  "message": "El nombre debe tener al menos 3 caracteres"
}

// 403 - Sin permisos
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción"
}
```

**Curl:**

```bash
curl -X POST http://localhost:3000/api/servicios \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Manicure Clásico",
    "duracionMinutos": 30,
    "precio": 25000
  }'
```

---

### 2. Listar servicios

```bash
GET /api/servicios
```

**Sin parámetros**

**Response para ADMIN (200):**
*Admin ve TODOS los servicios (activos e inactivos)*

```json
{
  "success": true,
  "message": "Servicios obtenidos exitosamente",
  "servicios": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Manicure Clásico",
      "duracionMinutos": 30,
      "precio": 25000,
      "activo": true,
      "createdAt": "2026-02-13T10:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Manicure Gel",
      "duracionMinutos": 60,
      "precio": 35000,
      "activo": true,
      "createdAt": "2026-02-13T11:00:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "nombre": "Pedicure Premium",
      "duracionMinutos": 45,
      "precio": 45000,
      "activo": false,
      "createdAt": "2026-02-12T14:20:00.000Z"
    }
  ],
  "total": 3
}
```

**Response para TRABAJADORA (200):**
*Trabajadora ve SOLO servicios activos*

```json
{
  "success": true,
  "message": "Servicios obtenidos exitosamente",
  "servicios": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Manicure Clásico",
      "duracionMinutos": 30,
      "precio": 25000,
      "activo": true,
      "createdAt": "2026-02-13T10:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Manicure Gel",
      "duracionMinutos": 60,
      "precio": 35000,
      "activo": true,
      "createdAt": "2026-02-13T11:00:00.000Z"
    }
  ],
  "total": 2
}
```

**Curl:**

```bash
curl -X GET http://localhost:3000/api/servicios \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

### 3. Obtener servicio por ID

```bash
GET /api/servicios/:id
```

**Ejemplo:** `GET /api/servicios/550e8400-e29b-41d4-a716-446655440000`

**Response exitosa (200):**

```json
{
  "success": true,
  "message": "Servicio obtenido exitosamente",
  "servicio": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Manicure Clásico",
    "duracionMinutos": 30,
    "precio": 25000,
    "activo": true,
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Errores posibles:**

```json
// 404 - Servicio no encontrado
{
  "success": false,
  "message": "Servicio no encontrado"
}

// 400 - ID inválido
{
  "success": false,
  "message": "ID de servicio inválido"
}
```

**Curl:**

```bash
curl -X GET http://localhost:3000/api/servicios/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

### 4. Actualizar servicio

```bash
PUT /api/servicios/:id
```

**Request (todos los campos opcionales):**

```json
{
  "nombre": "Manicure Clásico Premium",
  "duracionMinutos": 45,
  "precio": 30000
}
```

**Response exitosa (200):**

```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "servicio": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Manicure Clásico Premium",
    "duracionMinutos": 45,
    "precio": 30000,
    "activo": true,
    "updatedAt": "2026-02-13T15:45:00.000Z"
  }
}
```

**Actualización parcial (solo un campo):**

```json
{
  "precio": 28000
}
```

**Response exitosa (200):**

```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "servicio": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Manicure Clásico Premium",
    "duracionMinutos": 45,
    "precio": 28000,
    "activo": true,
    "updatedAt": "2026-02-13T16:00:00.000Z"
  }
}
```

**Errores posibles:**

```json
// 404 - Servicio no encontrado
{
  "success": false,
  "message": "Servicio no encontrado"
}

// 409 - Nombre duplicado
{
  "success": false,
  "message": "Ya existe otro servicio con ese nombre"
}

// 400 - Validación fallida
{
  "success": false,
  "message": "La duración debe ser un número entero"
}
```

**Curl:**

```bash
curl -X PUT http://localhost:3000/api/servicios/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Manicure Clásico Premium",
    "duracionMinutos": 45,
    "precio": 30000
  }'
```

---

### 5. Cambiar estado de servicio (Activar/Desactivar)

```bash
PATCH /api/servicios/:id/estado
```

**Desactivar servicio:**

```json
{
  "activo": false
}
```

**Response exitosa (200):**

```json
{
  "success": true,
  "message": "Servicio desactivado exitosamente",
  "servicio": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Manicure Clásico",
    "activo": false,
    "updatedAt": "2026-02-13T17:00:00.000Z"
  }
}
```

**Activar servicio:**

```json
{
  "activo": true
}
```

**Response exitosa (200):**

```json
{
  "success": true,
  "message": "Servicio activado exitosamente",
  "servicio": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Manicure Clásico",
    "activo": true,
    "updatedAt": "2026-02-13T17:30:00.000Z"
  }
}
```

**Errores posibles:**

```json
// 400 - No se puede desactivar último servicio activo
{
  "success": false,
  "message": "No se puede desactivar el único servicio activo"
}

// 404 - Servicio no encontrado
{
  "success": false,
  "message": "Servicio no encontrado"
}

// 400 - Validación fallida
{
  "success": false,
  "message": "El estado activo es obligatorio"
}
```

**Curl (desactivar):**

```bash
curl -X PATCH http://localhost:3000/api/servicios/550e8400-e29b-41d4-a716-446655440000/estado \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "activo": false
  }'
```

**Curl (activar):**

```bash
curl -X PATCH http://localhost:3000/api/servicios/550e8400-e29b-41d4-a716-446655440000/estado \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "activo": true
  }'
```

---

## 🎯 Casos de uso completos

### Caso 1: Crear catálogo inicial de servicios

```bash
# 1. Crear Manicure Clásico
curl -X POST http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Manicure Clásico", "duracionMinutos": 30, "precio": 25000}'

# 2. Crear Manicure Gel
curl -X POST http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Manicure Gel", "duracionMinutos": 60, "precio": 35000}'

# 3. Crear Pedicure
curl -X POST http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Pedicure", "duracionMinutos": 45, "precio": 30000}'

# 4. Listar todos los servicios creados
curl -X GET http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN"
```

### Caso 2: Actualizar precios de temporada

```bash
# Admin actualiza precios para promoción
curl -X PUT http://localhost:3000/api/servicios/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"precio": 20000}'  # Precio promocional
```

### Caso 3: Desactivar servicio temporalmente

```bash
# 1. Desactivar servicio
curl -X PATCH http://localhost:3000/api/servicios/550e8400-e29b-41d4-a716-446655440002/estado \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"activo": false}'

# 2. Verificar que trabajadoras no lo vean
curl -X GET http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN_TRABAJADORA"
# No debe incluir el servicio desactivado

# 3. Admin sí puede verlo
curl -X GET http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN_ADMIN"
# Debe incluir el servicio desactivado
```

### Caso 4: Trabajadora consulta servicios disponibles

```bash
# Trabajadora obtiene solo servicios activos para agendar citas
curl -X GET http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN_TRABAJADORA"

# Response: Solo servicios con activo: true
```

---

## 🧪 Testing con Postman

### Variables de entorno sugeridas

```json
{
  "base_url": "http://localhost:3000",
  "admin_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "trabajadora_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "servicio_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Pre-request Script para guardar ID automáticamente

```javascript
// Guardar ID del servicio creado
pm.test("Save servicio ID", function () {
    var jsonData = pm.response.json();
    if (jsonData.servicio && jsonData.servicio.id) {
        pm.environment.set("servicio_id", jsonData.servicio.id);
    }
});
```

---

## 📊 Respuestas estándar

### Estructura de respuesta exitosa

```typescript
{
  success: true,
  message: string,
  servicio?: {...},
  servicios?: [...],
  total?: number
}
```

### Estructura de respuesta de error

```typescript
{
  success: false,
  message: string,
  code?: string,      // Código de error específico (opcional)
  errors?: [...],     // Errores de validación Zod (opcional)
}
```

---

## 🔐 Notas de seguridad

1. **Autenticación obligatoria**: Todos los endpoints requieren token JWT válido
2. **Autorización por rol**:
   - Solo `ADMIN` puede crear, actualizar y cambiar estado
   - `TRABAJADORA` solo puede listar servicios activos
3. **Validación estricta**: Zod valida todos los inputs
4. **Protección contra duplicados**: Nombres únicos (case insensitive)

---

## ⚠️ Errores comunes

### 1. Intentar crear servicio sin autenticación

```bash
# ❌ Sin header Authorization
curl -X POST http://localhost:3000/api/servicios \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test", "duracionMinutos": 30}'

# Response: 401 Unauthorized
```

### 2. Trabajadora intenta crear servicio

```bash
# ❌ Token de trabajadora (no tiene permisos)
curl -X POST http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN_TRABAJADORA" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test", "duracionMinutos": 30}'

# Response: 403 Forbidden
```

### 3. Duración inválida

```bash
# ❌ Duración mayor a 480 minutos
curl -X POST http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test", "duracionMinutos": 500}'

# Response: 400 Bad Request
# Message: "La duración no puede superar 480 minutos (8 horas)"
```

### 4. Nombre duplicado

```bash
# ❌ Servicio con nombre ya existente
curl -X POST http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Manicure Clásico", "duracionMinutos": 30}'

# Response: 409 Conflict
# Message: "Ya existe un servicio con ese nombre"
```

### 5. Desactivar único servicio activo

```bash
# ❌ Solo hay 1 servicio activo
curl -X PATCH http://localhost:3000/api/servicios/$SERVICIO_ID/estado \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"activo": false}'

# Response: 400 Bad Request
# Message: "No se puede desactivar el único servicio activo"
```

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0
