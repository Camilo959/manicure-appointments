# 📮 Ejemplos de uso de la API de Autenticación

## 🔑 Descripción general

El módulo de autenticación proporciona endpoints para:
- **Login**: Obtener un token JWT con credenciales
- **Me**: Obtener información del usuario autenticado
- **Logout**: Cerrar sesión (opcional con JWT stateless)

> Nota: La gestión de personal (ADMIN y TRABAJADORA) se realiza por `POST /api/usuarios`.
> `POST /api/trabajadoras` se mantiene por compatibilidad para alta directa de trabajadoras.

## 📝 Ejemplos de peticiones

### 1. Login (Iniciar sesión)

```bash
POST /api/auth/login
```

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response exitosa (200):**

```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Administrador",
      "email": "admin@example.com",
      "rol": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJyb2wiOiJBRE1JTiIsImlhdCI6MTcwOTQyMDAwMCwiZXhwIjoxNzA5NDIwMDAwfQ.abc123..."
  }
}
```

**Login de Trabajadora:**

```json
{
  "email": "maria.garcia@example.com",
  "password": "SecurePass123"
}
```

**Response exitosa (200):**

```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "nombre": "María García",
      "email": "maria.garcia@example.com",
      "rol": "TRABAJADORA"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errores posibles:**

```json
// 401 - Credenciales inválidas (email no existe)
{
  "success": false,
  "message": "Email o contraseña incorrectos",
  "error": "INVALID_CREDENTIALS"
}

// 401 - Credenciales inválidas (contraseña incorrecta)
{
  "success": false,
  "message": "Email o contraseña incorrectos",
  "error": "INVALID_CREDENTIALS"
}

// 401 - Usuario inactivo
{
  "success": false,
  "message": "Email o contraseña incorrectos",
  "error": "INVALID_CREDENTIALS"
}

// 400 - Validación fallida (email inválido)
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "email",
      "message": "El formato del email no es válido"
    }
  ]
}

// 400 - Validación fallida (sin contraseña)
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "password",
      "message": "La contraseña no puede estar vacía"
    }
  ]
}
```

**Curl:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Nota de seguridad**: El mensaje de error es genérico ("Email o contraseña incorrectos") para no revelar si el email existe en el sistema.

---

### 2. Obtener usuario autenticado

```bash
GET /api/auth/me
```

**Headers requeridos:**
```
Authorization: Bearer <tu_token_jwt>
```

**Sin body**

**Response exitosa (200) - Admin:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Administrador",
    "email": "admin@example.com",
    "rol": "ADMIN",
    "activo": true
  }
}
```

**Response exitosa (200) - Trabajadora:**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "nombre": "María García",
    "email": "maria.garcia@example.com",
    "rol": "TRABAJADORA",
    "activo": true,
    "trabajadoraId": "770e8400-e29b-41d4-a716-446655440002"
  }
}
```

`trabajadoraId` se incluye únicamente cuando existe relación de `Trabajadora` asociada al usuario.

**Errores posibles:**

```json
// 401 - Sin token
{
  "success": false,
  "message": "Token no proporcionado",
  "error": "UNAUTHORIZED"
}

// 401 - Token inválido
{
  "success": false,
  "message": "Token inválido o expirado",
  "error": "UNAUTHORIZED"
}

// 401 - Token expirado
{
  "success": false,
  "message": "Token expirado",
  "error": "TOKEN_EXPIRED"
}

// 404 - Usuario no encontrado (usuario fue eliminado después de generar el token)
{
  "success": false,
  "message": "Usuario no encontrado",
  "error": "USER_NOT_FOUND"
}

// 403 - Usuario inactivo
{
  "success": false,
  "message": "Usuario inactivo",
  "error": "USER_INACTIVE"
}
```

**Curl:**

```bash
# Guardar token en variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Hacer request
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Cerrar sesión (Logout)

```bash
POST /api/auth/logout
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
  "message": "Sesión cerrada exitosamente"
}
```

**Errores posibles:**

```json
// 401 - Sin token
{
  "success": false,
  "message": "Token no proporcionado",
  "error": "UNAUTHORIZED"
}

// 401 - Token inválido
{
  "success": false,
  "message": "Token inválido o expirado",
  "error": "UNAUTHORIZED"
}
```

**Curl:**

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Nota importante**: Con JWT stateless, el logout se maneja principalmente en el cliente eliminando el token. El token seguirá siendo técnicamente válido hasta su expiración, pero el cliente no lo usará más.

---

## 🎯 Casos de uso completos

### Caso 1: Flujo completo de autenticación

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Guardar el token de la respuesta
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Verificar identidad
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Usar token en otros endpoints
curl -X GET http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN"

# 4. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

### Caso 2: Login fallido y reintento

```bash
# 1. Intentar login con contraseña incorrecta
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "wrongpassword"
  }'
# Response: 401 - Email o contraseña incorrectos

# 2. Reintentar con contraseña correcta
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
# Response: 200 - Login exitoso con token
```

### Caso 3: Token expirado

```bash
# 1. Usar token expirado
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $OLD_EXPIRED_TOKEN"
# Response: 401 - Token expirado

# 2. Hacer login nuevamente para obtener nuevo token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
# Response: 200 - Nuevo token
```

### Caso 4: Usar token en peticiones protegidas

```bash
# 1. Login y obtener token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}' \
  | jq -r '.data.token')

# 2. Usar token en diferentes endpoints
curl -X GET http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/api/trabajadoras \
  -H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/api/citas \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Testing con Postman

### Configuración inicial

#### Variables de entorno

```json
{
  "base_url": "http://localhost:3000",
  "admin_email": "admin@example.com",
  "admin_password": "admin123",
  "trabajadora_email": "maria.garcia@example.com",
  "trabajadora_password": "SecurePass123",
  "admin_token": "",
  "trabajadora_token": ""
}
```

#### Pre-request Script para Login

Para guardar automáticamente el token después de login:

```javascript
// En la pestaña "Tests" del request de login
pm.test("Login exitoso", function () {
    pm.response.to.have.status(200);
    
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.token).to.exist;
    
    // Guardar token según el rol
    if (jsonData.data.user.rol === 'ADMIN') {
        pm.environment.set("admin_token", jsonData.data.token);
    } else if (jsonData.data.user.rol === 'TRABAJADORA') {
        pm.environment.set("trabajadora_token", jsonData.data.token);
    }
});
```

#### Configuración de Authorization en Postman

Para endpoints protegidos:
1. Ir a la pestaña "Authorization"
2. Type: "Bearer Token"
3. Token: `{{admin_token}}` o `{{trabajadora_token}}`

### Tests automáticos

```javascript
// Test para /auth/login
pm.test("Status code es 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contiene token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.token).to.be.a('string');
    pm.expect(jsonData.data.token.length).to.be.above(20);
});

pm.test("Usuario tiene rol válido", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.user.rol).to.be.oneOf(['ADMIN', 'TRABAJADORA']);
});

// Test para /auth/me
pm.test("Usuario tiene información completa", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('id');
    pm.expect(jsonData.data).to.have.property('nombre');
    pm.expect(jsonData.data).to.have.property('email');
    pm.expect(jsonData.data).to.have.property('rol');
    pm.expect(jsonData.data).to.have.property('activo');
});
```

---

## 📊 Estructura del Token JWT

### Decodificación del token

Puedes decodificar el token en [jwt.io](https://jwt.io) para ver su contenido:

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "rol": "ADMIN",
  "iat": 1709420000,
  "exp": 1710024800
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret_key
)
```

### Interpretación

- `userId`: ID del usuario en la base de datos
- `rol`: Rol del usuario (ADMIN o TRABAJADORA)
- `iat`: Fecha de emisión (timestamp Unix)
- `exp`: Fecha de expiración (timestamp Unix, 7 días después de iat)

---

## 🔐 Buenas prácticas

### 1. Almacenamiento del token en el cliente

```javascript
// ✅ Bueno: localStorage (simple, funciona bien para SPA)
localStorage.setItem('token', response.data.token);
const token = localStorage.getItem('token');

// ✅ Mejor: sessionStorage (se limpia al cerrar navegador)
sessionStorage.setItem('token', response.data.token);

// ✅ Mejor aún: httpOnly cookie (más seguro contra XSS)
// Requiere configuración en el servidor
```

### 2. Envío del token

```javascript
// ✅ Correcto: En header Authorization
fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// ❌ Incorrecto: En query params (visible en logs)
fetch(`/api/auth/me?token=${token}`); // NO HACER ESTO
```

### 3. Manejo de token expirado

```javascript
// Interceptor de Axios (React/Vue)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4. Logout completo

```javascript
// En el cliente
async function logout() {
  try {
    // 1. Llamar al endpoint de logout (opcional)
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error en logout:', error);
  } finally {
    // 2. Eliminar token del cliente (SIEMPRE)
    localStorage.removeItem('token');
    
    // 3. Redirigir al login
    window.location.href = '/login';
  }
}
```

---

## ⚠️ Errores comunes y soluciones

### 1. "Token inválido o expirado"

**Problema**: El token JWT no es válido o ha expirado.

**Solución**:
```bash
# Hacer login nuevamente para obtener un nuevo token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### 2. "Token no proporcionado"

**Problema**: Falta el header `Authorization`.

**Solución**:
```bash
# ❌ Sin header
curl -X GET http://localhost:3000/api/auth/me

# ✅ Con header
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Formato de Authorization incorrecto

**Problema**: El formato del header no es correcto.

```bash
# ❌ Incorrecto
Authorization: $TOKEN
Authorization: Token $TOKEN
Authorization: JWT $TOKEN

# ✅ Correcto
Authorization: Bearer $TOKEN
```

### 4. "Email o contraseña incorrectos" pero las credenciales son correctas

**Causas posibles**:
- Usuario está inactivo (`activo = false`)
- Email tiene espacios adicionales
- Contraseña tiene espacios adicionales

**Solución**:
```bash
# Asegurarse de que no hay espacios
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 5. Token funciona en Postman pero no en el código

**Problema**: Diferencias en cómo se envía el token.

**Solución**:
```javascript
// ✅ Asegurarse de incluir "Bearer "
const config = {
  headers: {
    'Authorization': `Bearer ${token}` // Nota el espacio después de "Bearer"
  }
};
```

---

## 📱 Ejemplos de integración con Frontend

### React con Axios

```javascript
// api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

// Login
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  
  if (response.data.success) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

// Get current user
export const getMe = async () => {
  const token = localStorage.getItem('token');
  
  const response = await axios.get(`${API_URL}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};

// Logout
export const logout = async () => {
  const token = localStorage.getItem('token');
  
  try {
    await axios.post(`${API_URL}/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
```

### Vue.js con Fetch

```javascript
// services/authService.js
const API_URL = 'http://localhost:3000/api/auth';

export default {
  async login(email, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
    }
    
    return data;
  },
  
  async getMe() {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return await response.json();
  },
  
  logout() {
    localStorage.removeItem('token');
  },
};
```

---

## 🔒 Consideraciones de seguridad

### 1. Nunca expongas el token

```javascript
// ❌ NO HACER: Exponer token en logs
console.log('Token:', token);

// ❌ NO HACER: Enviar token en URL
fetch(`/api/auth/me?token=${token}`);

// ✅ HACER: Usar header Authorization
fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 2. Validar respuestas del servidor

```javascript
// ✅ Validar antes de guardar
if (response.data.success && response.data.data.token) {
  localStorage.setItem('token', response.data.data.token);
} else {
  console.error('Login falló');
}
```

### 3. Manejar tokens expirados

```javascript
// ✅ Interceptor para manejar 401
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado, limpiar y redirigir
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

**Última actualización**: Abril 2026  
**Versión**: 1.2.0
