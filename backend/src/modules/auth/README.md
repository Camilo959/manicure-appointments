# 🔐 Módulo de Autenticación

## 📋 Descripción

Módulo completo de autenticación y autorización con JWT, arquitectura en capas, manejo robusto de errores y validaciones exhaustivas.

## 🏗️ Arquitectura

Este módulo sigue el patrón **Controller → Service → Repository** (3-tier architecture) para garantizar:

- **Separación de responsabilidades**: Cada capa tiene un propósito único
- **Testabilidad**: Cada capa se puede testear independientemente
- **Mantenibilidad**: Cambios en una capa no afectan a las demás
- **Escalabilidad**: Fácil agregar nueva funcionalidad

### 📁 Estructura de archivos

```
auth/
├── auth.controller.ts    # Manejo de HTTP (req/res)
├── auth.service.ts        # Lógica de negocio
├── auth.repository.ts     # Acceso a datos (Prisma)
├── auth.routes.ts         # Definición de rutas
├── auth.validation.ts     # Validaciones con Zod
├── EJEMPLOS_API.md        # Ejemplos de uso
└── README.md              # Esta documentación
```

## 🔄 Flujo de datos

```
┌─────────────┐
│   Request   │ HTTP Request
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   Middlewares   │ Validation (solo login)
│                 │ Auth (solo /me y /logout)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │ • Recibe req/res
│                 │ • Valida datos (login)
│                 │ • Llama al service
│                 │ • Formatea respuesta
│                 │ • Maneja errores específicos
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Service     │ • Validación de credenciales
│                 │ • Hash de contraseñas (bcrypt)
│                 │ • Generación de JWT
│                 │ • Lógica de negocio
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │ • Queries de Prisma
│                 │ • Búsqueda de usuarios
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
| `POST` | `/api/auth/login` | Iniciar sesión | Público |
| `GET` | `/api/auth/me` | Obtener usuario autenticado | Privado |
| `POST` | `/api/auth/logout` | Cerrar sesión | Privado |

## 🔐 Sistema de autenticación

### JWT (JSON Web Token)

Este módulo utiliza **JWT stateless** para autenticación:

**Ventajas**:
- ✅ No requiere almacenar sesiones en el servidor
- ✅ Escalable horizontalmente
- ✅ Stateless (sin estado en servidor)
- ✅ Compatible con arquitecturas distribuidas

**Desventajas**:
- ⚠️ No se puede revocar un token antes de su expiración (sin blacklist)
- ⚠️ El token debe guardarse de forma segura en el cliente

### Estructura del Token

```typescript
{
  userId: string;    // ID del usuario
  rol: 'ADMIN' | 'TRABAJADORA';  // Rol del usuario
  iat: number;       // Fecha de emisión (issued at)
  exp: number;       // Fecha de expiración
}
```

### Configuración

```typescript
// Token expira en 7 días por defecto
JWT_EXPIRES_IN = '7d'
JWT_SECRET = 'tu_secret_key_aqui'
```

## 🔐 Reglas de negocio

### Al hacer login

✅ Email debe estar registrado en la base de datos  
✅ Usuario debe estar activo (`activo = true`)  
✅ Contraseña debe coincidir con el hash almacenado  
✅ Se retorna un JWT válido por 7 días  
✅ El password nunca se envía en la respuesta  

### Al obtener usuario autenticado (/me)

✅ Token JWT debe ser válido  
✅ Token no debe estar expirado  
✅ Usuario debe existir y estar activo  
✅ Se retorna información del usuario sin el password  

### Al hacer logout

✅ Token JWT debe ser válido  
✅ El logout es manejado en el cliente (eliminando el token)  
⚠️ Por ahora no se invalida el token en el servidor (stateless)  
💡 Futuro: implementar blacklist para invalidación temprana  

## 📦 Responsabilidades por capa

### Controller (`auth.controller.ts`)

**Responsabilidades**:
- Extraer parámetros de `req.body` y `req.user`
- Validar datos de entrada (login)
- Llamar al método correspondiente del service
- Enviar respuesta HTTP con status code apropiado
- Manejar errores específicos con mensajes claros

**NO hace**:
- ❌ Lógica de negocio
- ❌ Generación de tokens
- ❌ Hash de contraseñas
- ❌ Acceso directo a base de datos

```typescript
async login(req: Request, res: Response): Promise<void> {
  try {
    // Validar datos
    const validatedData = validate(loginSchema, req.body);
    
    // Ejecutar login
    const result = await authService.login(validatedData);
    
    // Responder con éxito
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: result,
    });
  } catch (error) {
    // Manejo específico de errores
    if (errorMessage.includes('Credenciales inválidas')) {
      res.status(401).json({ ... });
    }
  }
}
```

### Service (`auth.service.ts`)

**Responsabilidades**:
- Buscar usuario por email
- Verificar contraseñas con bcrypt
- Generar tokens JWT
- Aplicar reglas de negocio
- Hash de contraseñas (para creación de usuarios)
- Validar disponibilidad de emails

**NO hace**:
- ❌ Manejo de req/res
- ❌ Queries directas a base de datos

```typescript
async login(credentials: LoginInput): Promise<LoginResponse> {
  // 1. Buscar usuario activo
  const user = await authRepository.findActiveUserByEmail(email);
  if (!user) throw new Error('Credenciales inválidas');
  
  // 2. Verificar contraseña
  const isValid = await this.verifyPassword(password, user.password);
  if (!isValid) throw new Error('Credenciales inválidas');
  
  // 3. Generar token
  const token = generateToken({ userId: user.id, rol: user.rol });
  
  // 4. Retornar datos
  return { user: {...}, token };
}
```

### Repository (`auth.repository.ts`)

**Responsabilidades**:
- Ejecutar queries de Prisma
- Buscar usuarios por email o ID
- Verificar existencia de emails
- Buscar usuarios con relaciones (trabajadora)
- Contar usuarios por rol

**NO hace**:
- ❌ Validaciones de negocio
- ❌ Transformación de datos
- ❌ Manejo de errores de negocio
- ❌ Hash de contraseñas

```typescript
async findActiveUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findFirst({
    where: {
      email,
      activo: true,
    },
  });
}
```

## 🛡️ Validaciones

### Con Zod (`auth.validation.ts`)

Todas las validaciones de entrada se hacen con **Zod**:

```typescript
export const loginSchema = z.object({
  email: z
    .string()
    .email('El formato del email no es válido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'La contraseña no puede estar vacía'),
});
```

**Ventajas**:
- ✅ Type-safety automático con TypeScript
- ✅ Mensajes de error descriptivos
- ✅ Validación centralizada
- ✅ Transformación de datos (toLowerCase, trim)

### Validación de contraseñas

```typescript
// Al crear usuario (otros módulos usan esto)
password: z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')

// Al hacer login (solo verificar que no esté vacío)
password: z
  .string()
  .min(1, 'La contraseña no puede estar vacía')
```

## 🚨 Manejo de errores

### Errores comunes

| Error | Causa | Status Code |
|-------|-------|-------------|
| Credenciales inválidas | Email no existe o contraseña incorrecta | 401 |
| Usuario inactivo | Usuario existe pero está desactivado | 403 |
| Usuario no encontrado | ID en token no existe | 404 |
| Token inválido | JWT malformado o firma inválida | 401 |
| Token expirado | JWT superó el tiempo de expiración | 401 |
| Validación fallida | Datos inválidos (Zod) | 400 |
| Error interno | Error del servidor | 500 |

### Mensajes de error

**Por seguridad**, los errores de login son genéricos:
- ❌ NO: "El email no existe" o "Contraseña incorrecta"
- ✅ SÍ: "Email o contraseña incorrectos"

Esto previene que atacantes identifiquen emails válidos.

## 🔒 Seguridad

### Encriptación de contraseñas

```typescript
// Usando bcrypt con 10 rounds (configurable)
const hashedPassword = await bcrypt.hash(password, 10);

// Verificación
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Almacenamiento de tokens (Cliente)

**Buenas prácticas**:
- ✅ localStorage: Simple pero vulnerable a XSS
- ✅ httpOnly cookies: Más seguro pero requiere configuración CORS
- ✅ Memoria + refresh token: Más complejo pero más seguro

**Implementación actual**: localStorage (cliente decide)

### Headers de autenticación

```
Authorization: Bearer <token_jwt>
```

## 📊 Estructura de datos

### Modelo User (Prisma)

```prisma
model User {
  id          String      @id @default(uuid())
  nombre      String
  email       String      @unique
  password    String      // Hash de bcrypt
  rol         Rol         @default(TRABAJADORA)
  activo      Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relaciones
  trabajadora Trabajadora?
}

enum Rol {
  ADMIN
  TRABAJADORA
}
```

### Tipos TypeScript

```typescript
export interface LoginResponse {
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: 'ADMIN' | 'TRABAJADORA';
  };
  token: string;
}

export type LoginInput = {
  email: string;
  password: string;
};
```

### Payload del Token JWT

```typescript
export interface TokenPayload {
  userId: string;
  rol: 'ADMIN' | 'TRABAJADORA';
}
```

## 🔍 Casos de uso

### Caso 1: Login de Admin

1. Admin envía email y contraseña
2. Sistema busca usuario activo por email
3. Sistema verifica contraseña con bcrypt
4. Sistema genera token JWT con rol ADMIN
5. Cliente guarda token y lo usa en requests subsecuentes

### Caso 2: Login de Trabajadora

1. Trabajadora envía email y contraseña
2. Mismo flujo que Admin
3. Token incluye rol TRABAJADORA
4. Los endpoints validan el rol antes de permitir acceso

### Caso 3: Acceso a endpoints protegidos

1. Cliente envía request con header `Authorization: Bearer <token>`
2. Middleware `authenticate` valida el token
3. Middleware extrae userId y rol del token
4. Middleware adjunta `req.user` con la información
5. Controller puede acceder a `req.user.userId` y `req.user.rol`

### Caso 4: Token expirado

1. Cliente envía request con token expirado
2. Middleware `authenticate` detecta expiración
3. Responde con 401 Unauthorized
4. Cliente debe hacer login nuevamente

## 🔗 Middlewares relacionados

### authenticate (`auth.middleware.ts`)

Valida el token JWT y adjunta información del usuario a `req.user`:

```typescript
export const authenticate = async (req, res, next) => {
  try {
    // Extraer token del header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // Verificar y decodificar token
    const decoded = verifyToken(token);
    
    // Adjuntar a request
    req.user = {
      userId: decoded.userId,
      rol: decoded.rol,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
```

### authorizeRoles (`role.middleware.ts`)

Valida que el usuario tenga uno de los roles permitidos:

```typescript
export const authorizeRoles = (...roles: Rol[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        message: 'No tienes permisos para realizar esta acción',
      });
    }
    next();
  };
};
```

### Uso en rutas

```typescript
router.get(
  '/servicios',
  authenticate,                      // 1. Validar token
  authorizeRoles('ADMIN', 'TRABAJADORA'),  // 2. Validar rol
  listarServicios                    // 3. Ejecutar controlador
);
```

## 📝 Notas importantes

### Performance

- JWT es stateless: no requiere consultas a DB para validar token
- La verificación de contraseñas con bcrypt es computacionalmente costosa (intencional)
- Solo se consulta la DB en login y en /me

### Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Tokens firmados con secret key
- ✅ Mensajes de error genéricos para login
- ✅ Solo usuarios activos pueden autenticarse
- ✅ Validación estricta de inputs con Zod
- ⚠️ JWT no se puede revocar (stateless)

### Mantenibilidad

- Código modular y fácil de testear
- Separación clara de responsabilidades
- Tipos TypeScript inferidos desde Zod
- Comentarios JSDoc en funciones clave

## 🧪 Testing (Recomendaciones)

### Unit tests por implementar

```typescript
// auth.service.test.ts
describe('AuthService', () => {
  describe('login', () => {
    test('debe retornar token válido con credenciales correctas', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });
      
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    test('debe lanzar error con email inexistente', async () => {
      await expect(authService.login({
        email: 'noexiste@example.com',
        password: 'password123',
      })).rejects.toThrow('Credenciales inválidas');
    });

    test('debe lanzar error con contraseña incorrecta', async () => {
      await expect(authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      })).rejects.toThrow('Credenciales inválidas');
    });

    test('no debe permitir login de usuario inactivo', async () => {
      await expect(authService.login({
        email: 'inactivo@example.com',
        password: 'password123',
      })).rejects.toThrow('Credenciales inválidas');
    });
  });

  describe('hashPassword', () => {
    test('debe hashear contraseña correctamente', async () => {
      const password = 'password123';
      const hashed = await authService.hashPassword(password);
      
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });
  });

  describe('verifyPassword', () => {
    test('debe retornar true con contraseña correcta', async () => {
      const password = 'password123';
      const hashed = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(password, hashed);
      
      expect(isValid).toBe(true);
    });

    test('debe retornar false con contraseña incorrecta', async () => {
      const hashed = await authService.hashPassword('password123');
      const isValid = await authService.verifyPassword('wrongpassword', hashed);
      
      expect(isValid).toBe(false);
    });
  });
});
```

### Integration tests

```typescript
describe('POST /api/auth/login', () => {
  test('debe retornar 200 y token con credenciales válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  test('debe retornar 401 con contraseña incorrecta', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'wrongpassword',
      });
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

## 🚀 Mejoras futuras

### 1. Refresh Tokens

Implementar sistema de refresh tokens para mejorar seguridad:
- Access token de corta duración (15 minutos)
- Refresh token de larga duración (30 días)
- Almacenar refresh tokens en DB para revocación

### 2. Token Blacklist

Para invalidar tokens antes de su expiración:
- Almacenar tokens invalidados en Redis (rápido)
- Verificar blacklist en middleware de autenticación
- Útil para logout inmediato o compromiso de seguridad

### 3. Two-Factor Authentication (2FA)

Añadir segundo factor de autenticación:
- TOTP (Google Authenticator, Authy)
- SMS (menos seguro pero más accesible)
- Email con código de verificación

### 4. Password Reset

Flujo para recuperación de contraseña:
- Envío de email con token temporal
- Validación de token y cambio de contraseña
- Expiración de token después de uso o tiempo

### 5. Registro de actividad

Logging de eventos de autenticación:
- Intentos fallidos de login
- Logins exitosos con IP y user agent
- Cambios de contraseña
- Detección de patrones sospechosos

## 🔗 Relaciones con otros módulos

- **Trabajadoras**: Usa `authService.hashPassword()` para crear usuarios
- **Todos los módulos**: Usan middlewares `authenticate` y `authorizeRoles`
- **Citas**: Usa `req.user.userId` para identificar trabajadora

## 📚 Referencias

- [JWT.io](https://jwt.io/) - Documentación de JWT
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Documentación de bcrypt
- [Zod Validation](https://zod.dev/) - Validaciones type-safe
- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) - Best practices

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0
