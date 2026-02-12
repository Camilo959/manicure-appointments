# 📮 Ejemplos de uso de la API de Trabajadoras

## 🔑 Prerequisitos

Todas las peticiones requieren:
- Token JWT válido de un usuario con rol `ADMIN` (excepto GET /trabajadoras)
- Header: `Authorization: Bearer <tu_token_jwt>`
- Header: `Content-Type: application/json`

## 📝 Ejemplos de peticiones

### 1. Crear trabajadora

```bash
POST /api/trabajadoras
```

**Request:**

```json
{
  "nombre": "María García",
  "email": "maria.garcia@example.com",
  "password": "SecurePass123"
}
```

**Response exitosa (201):**

```json
{
  "success": true,
  "message": "Trabajadora creada exitosamente",
  "trabajadora": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "María García",
    "activa": true,
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "email": "maria.garcia@example.com",
      "activo": true
    },
    "createdAt": "2026-02-11T10:30:00.000Z"
  }
}
```

**Errores posibles:**

```json
// 409 - Email duplicado
{
  "success": false,
  "message": "Ya existe una trabajadora con el email maria.garcia@example.com",
  "code": "EMAIL_DUPLICATE"
}

// 400 - Validación fallida
{
  "success": false,
  "message": "La contraseña debe tener al menos 8 caracteres"
}
```

**Curl:**

```bash
curl -X POST http://localhost:3000/api/trabajadoras \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María García",
    "email": "maria.garcia@example.com",
    "password": "SecurePass123"
  }'
```

---

### 2. Listar trabajadoras

```bash
GET /api/trabajadoras
```

**Sin parámetros**

**Response para ADMIN (200):**

```json
{
  "success": true,
  "message": "Trabajadoras obtenidas exitosamente",
  "trabajadoras": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "María García",
      "activa": true,
      "email": "maria.garcia@example.com",
      "userId": "660e8400-e29b-41d4-a716-446655440000",
      "citasActivas": 5,
      "createdAt": "2026-02-11T10:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Laura Martínez",
      "activa": false,
      "email": "laura.martinez@example.com",
      "userId": "660e8400-e29b-41d4-a716-446655440001",
      "citasActivas": 0,
      "createdAt": "2026-02-10T14:20:00.000Z"
    }
  ],
  "total": 2
}
```

**Response para TRABAJADORA (200):**

```json
{
  "success": true,
  "message": "Trabajadoras obtenidas exitosamente",
  "trabajadoras": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "María García",
      "activa": true,
      "email": "maria.garcia@example.com",
      "userId": "660e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-02-11T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

**Curl:**

```bash
curl -X GET http://localhost:3000/api/trabajadoras \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

### 3. Obtener trabajadora por ID

```bash
GET /api/trabajadoras/:id
```

**Response (200):**

```json
{
  "success": true,
  "message": "Trabajadora obtenida exitosamente",
  "trabajadora": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "María García",
    "activa": true,
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "email": "maria.garcia@example.com",
      "activo": true,
      "createdAt": "2026-02-11T10:30:00.000Z"
    },
    "tieneCitasAgendadas": true,
    "createdAt": "2026-02-11T10:30:00.000Z",
    "updatedAt": "2026-02-11T10:30:00.000Z"
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "message": "Trabajadora con ID 550e8400-e29b-41d4-a716-446655440000 no encontrada",
  "code": "TRABAJADORA_NOT_FOUND"
}
```

**Curl:**

```bash
curl -X GET http://localhost:3000/api/trabajadoras/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

### 4. Actualizar trabajadora

```bash
PUT /api/trabajadoras/:id
```

**Request (puedes enviar uno o más campos):**

```json
{
  "nombre": "María García López",
  "email": "maria.garcia.lopez@example.com",
  "password": "NewSecurePass456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Trabajadora actualizada exitosamente",
  "trabajadora": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "María García López",
    "activa": true,
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "email": "maria.garcia.lopez@example.com",
      "activo": true
    },
    "updatedAt": "2026-02-11T15:45:00.000Z"
  }
}
```

**Errores posibles:**

```json
// 404
{
  "success": false,
  "message": "Trabajadora con ID ... no encontrada",
  "code": "TRABAJADORA_NOT_FOUND"
}

// 409 - Email duplicado
{
  "success": false,
  "message": "Ya existe una trabajadora con el email ...",
  "code": "EMAIL_DUPLICATE"
}
```

**Curl:**

```bash
curl -X PUT http://localhost:3000/api/trabajadoras/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María García López"
  }'
```

---

### 5. Cambiar estado (activar/desactivar)

```bash
PATCH /api/trabajadoras/:id/estado
```

**Request para desactivar:**

```json
{
  "activa": false
}
```

**Request para activar:**

```json
{
  "activa": true
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Trabajadora desactivada exitosamente",
  "trabajadora": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "María García",
    "activa": false,
    "user": {
      "activo": false
    },
    "updatedAt": "2026-02-11T16:00:00.000Z"
  }
}
```

**Errores específicos:**

```json
// 400 - Tiene citas agendadas
{
  "success": false,
  "message": "No se puede desactivar la trabajadora porque tiene citas agendadas. Cancele o reasigne las citas primero.",
  "code": "HAS_APPOINTMENTS"
}

// 400 - Última trabajadora activa
{
  "success": false,
  "message": "No se puede desactivar la única trabajadora activa del sistema",
  "code": "LAST_ACTIVE_TRABAJADORA"
}

// 400 - User inactivo al intentar reactivar
{
  "success": false,
  "message": "No se puede activar una trabajadora sin usuario activo",
  "code": "USER_INACTIVE"
}
```

**Curl:**

```bash
# Desactivar
curl -X PATCH http://localhost:3000/api/trabajadoras/550e8400-e29b-41d4-a716-446655440000/estado \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"activa": false}'

# Activar
curl -X PATCH http://localhost:3000/api/trabajadoras/550e8400-e29b-41d4-a716-446655440000/estado \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"activa": true}'
```

---

### 6. Eliminar trabajadora (soft delete)

```bash
DELETE /api/trabajadoras/:id
```

**Sin body** (automáticamente desactiva)

**Response (200):**

```json
{
  "success": true,
  "message": "Trabajadora desactivada exitosamente",
  "trabajadora": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "María García",
    "activa": false,
    "user": {
      "activo": false
    },
    "updatedAt": "2026-02-11T16:30:00.000Z"
  }
}
```

**Errores posibles:**

Los mismos que en `PATCH /estado` con `activa: false`:
- `HAS_APPOINTMENTS` (400)
- `LAST_ACTIVE_TRABAJADORA` (400)
- `TRABAJADORA_NOT_FOUND` (404)

**Curl:**

```bash
curl -X DELETE http://localhost:3000/api/trabajadoras/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 🧪 Colección de Postman

### Variables de entorno

```json
{
  "baseUrl": "http://localhost:3000/api",
  "adminToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "trabajadoraId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Pre-request Script (opcional)

```javascript
// Auto-login si el token expiró
if (!pm.environment.get("adminToken")) {
  pm.sendRequest({
    url: pm.environment.get("baseUrl") + "/auth/login",
    method: "POST",
    header: { "Content-Type": "application/json" },
    body: {
      mode: "raw",
      raw: JSON.stringify({
        email: "admin@example.com",
        password: "AdminPass123"
      })
    }
  }, (err, res) => {
    if (!err) {
      const token = res.json().token;
      pm.environment.set("adminToken", token);
    }
  });
}
```

---

## 🔍 Casos de uso comunes

### Flujo completo de gestión

```bash
# 1. Login como admin
POST /api/auth/login
{"email": "admin@example.com", "password": "..."}
# Guardar token de respuesta

# 2. Crear trabajadora
POST /api/trabajadoras
{"nombre": "María", "email": "maria@...", "password": "..."}
# Guardar ID de respuesta

# 3. Listar todas
GET /api/trabajadoras

# 4. Ver detalles
GET /api/trabajadoras/{id}

# 5. Actualizar datos
PUT /api/trabajadoras/{id}
{"nombre": "María López"}

# 6. Desactivar temporalmente
PATCH /api/trabajadoras/{id}/estado
{"activa": false}

# 7. Reactivar
PATCH /api/trabajadoras/{id}/estado
{"activa": true}

# 8. Eliminar (soft delete)
DELETE /api/trabajadoras/{id}
```

### Validar antes de desactivar

```bash
# 1. Ver si tiene citas
GET /api/trabajadoras/{id}
# Verificar "tieneCitasAgendadas": true/false

# 2. Si tiene citas, re-asignar o cancelar
# (endpoints de módulo de citas)

# 3. Verificar si es la última activa
GET /api/trabajadoras
# Contar cuántas tienen "activa": true

# 4. Desactivar
DELETE /api/trabajadoras/{id}
```

---

## 🐛 Debugging

### Ver logs del servidor

```bash
# Si hay error, revisar console del backend
# Debería mostrar el stack trace completo
```

### Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `401 Unauthorized` | Token inválido/expirado | Volver a hacer login |
| `403 Forbidden` | Rol incorrecto | Usar usuario ADMIN |
| `409 EMAIL_DUPLICATE` | Email ya existe | Usar otro email |
| `400 HAS_APPOINTMENTS` | Tiene citas activas | Cancelar/reasignar primero |
| `400 LAST_ACTIVE_TRABAJADORA` | Única trabajadora | Crear otra antes de desactivar |

---

## 📊 Testing con Jest + Supertest

```javascript
describe('Trabajadoras API', () => {
  let adminToken;
  let trabajadoraId;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Test1234' });
    adminToken = loginRes.body.token;
  });

  it('POST /trabajadoras - debe crear trabajadora', async () => {
    const res = await request(app)
      .post('/api/trabajadoras')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Test Trabajadora',
        email: 'test@trabajadora.com',
        password: 'TestPass123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.trabajadora).toHaveProperty('id');
    
    trabajadoraId = res.body.trabajadora.id;
  });

  it('GET /trabajadoras - debe listar trabajadoras', async () => {
    const res = await request(app)
      .get('/api/trabajadoras')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.trabajadoras)).toBe(true);
  });

  it('DELETE /trabajadoras/:id - debe desactivar', async () => {
    const res = await request(app)
      .delete(`/api/trabajadoras/${trabajadoraId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.trabajadora.activa).toBe(false);
  });
});
```

---

**Última actualización**: 2026-02-11
