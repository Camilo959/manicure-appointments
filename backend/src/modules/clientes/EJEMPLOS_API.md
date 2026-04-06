# 📮 Ejemplos de uso de la API de Clientes

## 🔑 Descripción general

El módulo de clientes permite:
- **Registro opcional de cuenta** para clientes (`POST /api/clientes/register`)
- **Consulta de perfil autenticado** (`GET /api/clientes/me`)
- **Consulta de historial propio de citas** (`GET /api/clientes/me/citas`)

> Nota: El agendamiento público (`POST /api/citas`) sigue disponible sin login.

## 🔐 Prerequisitos

Para endpoints privados (`/me` y `/me/citas`) necesitas:
- Token JWT válido de un usuario con rol `CLIENTE`
- Header: `Authorization: Bearer <tu_token_jwt>`

## 📝 Ejemplos de peticiones

### 1. Registrar cuenta de cliente

```bash
POST /api/clientes/register
```

**Request:**

```json
{
  "nombre": "Laura Gómez",
  "telefono": "+573001234567",
  "email": "laura.gomez@example.com",
  "password": "Password123"
}
```

**Response exitosa (201) - Cliente nuevo:**

```json
{
  "success": true,
  "message": "Cuenta de cliente creada exitosamente",
  "cliente": {
    "id": "5f6d6f2e-81df-4fd4-a6a5-c26757e53f88",
    "nombre": "Laura Gómez",
    "telefono": "+573001234567",
    "email": "laura.gomez@example.com"
  },
  "user": {
    "id": "346f4f1f-8438-4125-9c2e-c56dff6f8a28",
    "nombre": "Laura Gómez",
    "email": "laura.gomez@example.com",
    "rol": "CLIENTE",
    "activo": true,
    "createdAt": "2026-04-06T14:10:00.000Z"
  }
}
```

**Response exitosa (201) - Vinculación por teléfono existente:**

```json
{
  "success": true,
  "message": "Cuenta de cliente creada y vinculada exitosamente",
  "cliente": {
    "id": "e8f66ad3-8ee0-48fd-80e0-9643f3075ec8",
    "nombre": "Laura Gómez",
    "telefono": "+573001234567",
    "email": "laura.gomez@example.com"
  },
  "user": {
    "id": "a9b8e951-e4d1-4d89-a469-217c563dcf95",
    "nombre": "Laura Gómez",
    "email": "laura.gomez@example.com",
    "rol": "CLIENTE",
    "activo": true,
    "createdAt": "2026-04-06T14:10:00.000Z"
  }
}
```

**Errores posibles:**

```json
// 409 - Email ya registrado en User
{
  "success": false,
  "message": "Ya existe un usuario con el email laura.gomez@example.com",
  "error": "CLIENTE_EMAIL_DUPLICADO"
}

// 409 - Cliente por teléfono ya tiene cuenta
{
  "success": false,
  "message": "El cliente con teléfono +573001234567 ya tiene una cuenta asociada",
  "error": "CLIENTE_CUENTA_YA_EXISTE"
}

// 400 - Validación fallida
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "body.telefono",
      "message": "Formato de teléfono inválido. Ej: +573001234567"
    }
  ]
}
```

**Curl:**

```bash
curl -X POST http://localhost:3000/api/clientes/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laura Gómez",
    "telefono": "+573001234567",
    "email": "laura.gomez@example.com",
    "password": "Password123"
  }'
```

---

### 2. Obtener perfil del cliente autenticado

```bash
GET /api/clientes/me
```

**Headers requeridos:**
```
Authorization: Bearer <tu_token_jwt>
```

**Sin body**

**Response exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "5f6d6f2e-81df-4fd4-a6a5-c26757e53f88",
    "nombre": "Laura Gómez",
    "telefono": "+573001234567",
    "email": "laura.gomez@example.com",
    "user": {
      "id": "346f4f1f-8438-4125-9c2e-c56dff6f8a28",
      "email": "laura.gomez@example.com",
      "rol": "CLIENTE",
      "activo": true
    }
  }
}
```

**Errores posibles:**

```json
// 401 - Sin token
{
  "success": false,
  "message": "No se proporcionó token de autenticación",
  "error": "MISSING_TOKEN"
}

// 401 - Token inválido
{
  "success": false,
  "message": "Token inválido",
  "error": "INVALID_TOKEN"
}

// 403 - Token de rol no permitido (ADMIN/TRABAJADORA)
{
  "success": false,
  "message": "No tienes permisos para acceder a este recurso",
  "error": "FORBIDDEN",
  "details": {
    "requiredRoles": ["CLIENTE"],
    "userRole": "ADMIN"
  }
}

// 404 - Usuario sin perfil cliente vinculado
{
  "success": false,
  "message": "No se encontró el perfil del cliente autenticado",
  "error": "CLIENTE_NO_ENCONTRADO"
}
```

**Curl:**

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/clientes/me \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Obtener historial de citas del cliente autenticado

```bash
GET /api/clientes/me/citas
```

**Headers requeridos:**
```
Authorization: Bearer <tu_token_jwt>
```

**Sin body**

**Response exitosa (200) - Con citas:**

```json
{
  "success": true,
  "data": {
    "clienteId": "5f6d6f2e-81df-4fd4-a6a5-c26757e53f88",
    "total": 1,
    "citas": [
      {
        "id": "c1b8a4f7-2196-4b8f-885f-8c81bf4a3365",
        "numeroConfirmacion": "20260406-AB12",
        "estado": "PENDIENTE",
        "fechaInicio": "2026-04-08T15:00:00.000Z",
        "fechaFin": "2026-04-08T16:00:00.000Z",
        "duracionTotal": 60,
        "precioTotal": 50000,
        "trabajadora": {
          "id": "7256d1fe-d07a-4698-a740-2e2e2661300f",
          "nombre": "María García"
        },
        "servicios": [
          {
            "id": "95bc87dd-e627-4900-a4ce-f4f1f68ef0ea",
            "nombre": "Manicure Básico",
            "duracionMinutos": 60,
            "precio": 50000
          }
        ]
      }
    ]
  }
}
```

**Response exitosa (200) - Sin citas:**

```json
{
  "success": true,
  "data": {
    "clienteId": "5f6d6f2e-81df-4fd4-a6a5-c26757e53f88",
    "total": 0,
    "citas": []
  }
}
```

**Errores posibles:**

```json
// 401 - Sin token
{
  "success": false,
  "message": "No se proporcionó token de autenticación",
  "error": "MISSING_TOKEN"
}

// 403 - Rol no permitido
{
  "success": false,
  "message": "No tienes permisos para acceder a este recurso",
  "error": "FORBIDDEN"
}

// 404 - Perfil cliente inexistente
{
  "success": false,
  "message": "No se encontró el perfil del cliente autenticado",
  "error": "CLIENTE_NO_ENCONTRADO"
}
```

**Curl:**

```bash
curl -X GET http://localhost:3000/api/clientes/me/citas \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Caso de uso completo

### Registro + Login + Perfil + Historial

```bash
# 1) Registrar cuenta de cliente
curl -X POST http://localhost:3000/api/clientes/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laura Gómez",
    "telefono": "+573001234567",
    "email": "laura.gomez@example.com",
    "password": "Password123"
  }'

# 2) Login para obtener token (módulo auth)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "laura.gomez@example.com",
    "password": "Password123"
  }'

# Guarda token de la respuesta en TOKEN
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3) Consultar perfil
curl -X GET http://localhost:3000/api/clientes/me \
  -H "Authorization: Bearer $TOKEN"

# 4) Consultar historial propio de citas
curl -X GET http://localhost:3000/api/clientes/me/citas \
  -H "Authorization: Bearer $TOKEN"
```
