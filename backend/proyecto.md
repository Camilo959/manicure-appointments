# Manicure Appointments - Sistema de Gestión de Citas

## Descripción del Proyecto

Sistema backend completo para la gestión de citas en un salón de manicure. Permite a los clientes agendar citas de forma pública, mientras que las administradoras y trabajadoras gestionan servicios, disponibilidad y estado de las citas desde un panel autenticado.

El sistema está desarrollado en **TypeScript** con **Express.js 5** y **PostgreSQL** (vía Prisma ORM), implementando autenticación JWT, control de acceso por roles, notificaciones por correo electrónico, validación exhaustiva de datos y protección contra condiciones de carrera mediante transacciones serializables.

Toda la interfaz del backend (mensajes de error, validaciones, formatos de fecha y moneda) está localizada en **español (Colombia)**.

---

## Objetivos

- Ofrecer un endpoint público para que los clientes agenden citas sin necesidad de registro.
- Permitir cuentas opcionales de cliente para autogestión (perfil e historial) sin romper el flujo público.
- Garantizar integridad de los datos: evitar solapamiento de citas, validar horarios laborales y días bloqueados.
- Proveer un sistema de roles (ADMIN / TRABAJADORA / CLIENTE) con permisos diferenciados.
- Enviar notificaciones por correo electrónico al crear, confirmar o cancelar citas.
- Mantener una arquitectura limpia, modular y testeada con cobertura de pruebas unitarias e integración.

---

## Funcionalidades

### Autenticación y Autorización
- El módulo `auth` quedó enfocado en autenticación: login, validación de token y endpoint `/auth/me`.
- La creación de personal se centralizó en el módulo `usuarios` (`POST /api/usuarios`, solo ADMIN).
- La creación de cuentas de cliente se centralizó en el módulo `clientes` (`POST /api/clientes/register`, público).
- Login con email/password → JWT con expiración configurable (por defecto 7 días).
- Middleware de autenticación (`authenticate`) y autorización por roles (`requireAdmin`, `requireStaff`, `requireCliente`).
- Contraseñas hasheadas con bcrypt (salt rounds configurables).
- Requisitos de contraseña: mínimo 8 caracteres, mayúscula, minúscula y dígito.

### Gestión de Usuarios (Módulo `usuarios`)
- Alta de personal del negocio (ADMIN y TRABAJADORA) mediante endpoint protegido para ADMIN.
- Creación transaccional:
  - Si `rol = ADMIN`: crea solo `User`.
  - Si `rol = TRABAJADORA`: crea `User + Trabajadora`.
- Validación de email único y password fuerte.
- Se agregó manejo de errores tipados para este módulo en el middleware global.

### Gestión de Citas (Módulo `citas`)
- **Agendamiento público** (`POST /api/citas`): cualquier persona puede agendar sin autenticarse.
  - Recibe: nombre del cliente, teléfono, email (opcional), trabajadora, fecha, hora de inicio y lista de servicios.
  - Devuelve: datos de la cita con número de confirmación (`YYYYMMDD-XXXX`) y token de cancelación.
- **Validaciones temporales**: no se permiten citas en el pasado, en días bloqueados, ni fuera del horario laboral (8:00 – 18:00).
- **Detección de conflictos**: transacción `SERIALIZABLE` con bloqueo `FOR UPDATE` para prevenir solapamiento de horarios.
- **Estados de cita**: `PENDIENTE`, `CONFIRMADA`, `CANCELADA`, `REPROGRAMADA`, `COMPLETADA`, `NO_ASISTIO`.
- **Disponibilidad** (`GET /api/disponibilidad`): consulta de slots disponibles con intervalos de 15 minutos, considerando citas existentes y duración total de los servicios seleccionados.

### Gestión de Servicios (Módulo `servicios`)
- CRUD completo (solo ADMIN).
- Validación de nombre único y rango de duración (hasta 480 min).
- Activación/desactivación (soft-delete) vía `PATCH /api/servicios/:id/estado`.

### Gestión de Trabajadoras (Módulo `trabajadoras`)
- CRUD completo (solo ADMIN).
- Relación 1-1 con User (cada trabajadora tiene cuenta de acceso).
- Conteo de citas por trabajadora en listado.
- Soft-delete con protección: no se puede desactivar la última trabajadora activa.
- Protección contra eliminación de trabajadoras con citas activas.
- `POST /api/trabajadoras` se mantiene por compatibilidad operativa, pero el flujo canónico de alta de personal es `POST /api/usuarios`.

### Gestión de Clientes (Módulo `clientes`)
- Soporta cuenta opcional de cliente sin afectar el agendamiento público.
- Registro de cuenta: `POST /api/clientes/register`.
  - Crea `User` con rol `CLIENTE`.
  - Si existe un `Cliente` con el teléfono y sin cuenta, lo vincula (`Cliente.userId`).
  - Si ese `Cliente` ya tiene cuenta, responde conflicto.
- Perfil autenticado: `GET /api/clientes/me` (rol `CLIENTE`).
- Historial autenticado: `GET /api/clientes/me/citas` (rol `CLIENTE`).
- Se mantiene la creación/actualización implícita de `Cliente` por teléfono durante `POST /api/citas`.

### Notificaciones por Email (Módulo `notificaciones`)
- Integración con **Resend** como proveedor de email.
- Tres tipos de notificación con plantillas HTML:
  - `CITA_CREADA` – al agendar una cita.
  - `CITA_CONFIRMADA` – al confirmar una cita.
  - `CITA_CANCELADA` – al cancelar una cita.
- Degradación elegante: si la API key no está configurada, registra advertencia pero no bloquea el flujo.
- Envío asíncrono: no bloquea la respuesta al cliente.
- Formato localizado: fechas en español, precios en pesos colombianos (COP).

### Manejo de Errores
- Clases de error tipadas con códigos HTTP específicos:
  - `TrabajadoraNoDisponibleError` (400), `ServicioNoDisponibleError` (400), `FechaEnPasadoError` (400)
  - `HorarioNoDisponibleError` (409), `SolapamientoCitaError` (409), `DiaBloqueadoError` (400)
  - `NotFoundError` (404), `ConflictError` (409), `UnauthorizedError` (401), `ForbiddenError` (403)
- Middleware global `errorHandler` que captura todas las excepciones y devuelve respuestas consistentes.

### Validación de Datos
- Esquemas **Zod** para todos los endpoints.
- Middleware `validate` que valida body, query y params automáticamente.
- Validaciones específicas: formato de teléfono colombiano (`+57 3XXXXXXXXX`), formato de fecha (`YYYY-MM-DD`), formato de hora (`HH:mm`), UUIDs.

---

## Arquitectura

### Stack Tecnológico

| Capa            | Tecnología                        |
|-----------------|-----------------------------------|
| Runtime         | Node.js + TypeScript              |
| Framework       | Express.js 5.x                    |
| Base de datos   | PostgreSQL                        |
| ORM             | Prisma 7.3 + @prisma/adapter-pg   |
| Autenticación   | JWT (jsonwebtoken, HS256)         |
| Hashing         | bcryptjs                          |
| Validación      | Zod 4.x                           |
| Email           | Resend                            |
| Fechas          | date-fns                          |
| Testing         | Jest 30.x + Supertest             |
| Dev Server      | ts-node-dev                       |

### Patrón de Arquitectura: 3 Capas

```
┌─────────────────────────────────────────────┐
│                  Routes                      │  ← Definición de rutas + middleware
├─────────────────────────────────────────────┤
│               Controllers                    │  ← Manejo HTTP (req/res)
├─────────────────────────────────────────────┤
│                Services                      │  ← Lógica de negocio
├─────────────────────────────────────────────┤
│              Repositories                    │  ← Acceso a datos (Prisma)
├─────────────────────────────────────────────┤
│            PostgreSQL (Prisma)               │  ← Base de datos
└─────────────────────────────────────────────┘
```

### Modelo de Datos

```
        User 1──1 Trabajadora 1──M Cita M──M Servicio
         │                           │         (vía CitaServicio)
         │                           │
         └──1 Cliente────────────────┘

DiaBloqueado (independiente)
```

**Modelos principales:**

| Modelo         | Campos clave                                                                 |
|----------------|------------------------------------------------------------------------------|
| `User`         | id, nombre, email, password, rol (ADMIN/TRABAJADORA/CLIENTE), activo         |
| `Trabajadora`  | id, nombre, activa, userId (FK → User)                                       |
| `Cliente`      | id, nombre, telefono (unique), email, userId? (FK unique → User)             |
| `Servicio`     | id, nombre, duracionMinutos, precio, activo                                  |
| `Cita`         | id, fechaInicio, fechaFin, estado, duracionTotal, precioTotal, numeroConfirmacion, tokenCancelacion, clienteId, trabajadoraId |
| `CitaServicio` | id, citaId, servicioId, precioUnitario                                       |
| `DiaBloqueado` | id, fecha (unique), motivo                                                   |

### Estructura de Carpetas

```
backend/
├── src/
│   ├── app.ts                    # Configuración de Express
│   ├── server.ts                 # Punto de entrada
│   ├── config/
│   │   ├── env.ts                # Variables de entorno
│   │   └── prisma.ts             # Cliente Prisma
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # Autenticación JWT
│   │   ├── error.middleware.ts    # Manejo global de errores
│   │   ├── role.middleware.ts     # Autorización por roles
│   │   └── validate.middleware.ts # Validación Zod
│   ├── types/                    # Tipos compartidos
│   ├── utils/                    # Utilidades (JWT, etc.)
│   ├── modules/
│   │   ├── auth/                 # Autenticación (login / me / logout)
│   │   ├── citas/                # Agendamiento y disponibilidad
│   │   ├── servicios/            # CRUD de servicios
│   │   ├── usuarios/             # Gestión de personal (ADMIN/TRABAJADORA)
│   │   ├── trabajadoras/         # CRUD de trabajadoras
│   │   ├── clientes/             # Cuenta opcional de cliente (register/me/me-citas)
│   │   └── notificaciones/       # Emails con Resend
│   └── __tests__/
│       ├── integration/          # Tests de integración
│       ├── unit/                 # Tests unitarios
│       └── setup/                # Configuración de tests
├── prisma/
│   ├── schema.prisma             # Esquema de base de datos
│   ├── seed.ts                   # Datos semilla
│   └── migrations/               # Migraciones
├── generated/                    # Cliente Prisma generado
├── jest.config.js
├── tsconfig.json
└── package.json
```

### Endpoints de la API

| Método   | Ruta                              | Acceso       | Descripción                          |
|----------|-----------------------------------|--------------|--------------------------------------|
| `GET`    | `/health`                         | Público      | Health check                         |
| `POST`   | `/api/auth/login`                 | Público      | Iniciar sesión                       |
| `GET`    | `/api/auth/me`                    | Autenticado  | Obtener usuario actual               |
| `POST`   | `/api/auth/logout`                | Autenticado  | Cerrar sesión                        |
| `POST`   | `/api/usuarios`                   | ADMIN        | Crear usuario de staff (ADMIN/TRABAJADORA) |
| `POST`   | `/api/clientes/register`          | Público      | Crear cuenta de cliente (rol CLIENTE) |
| `GET`    | `/api/clientes/me`                | CLIENTE      | Obtener perfil del cliente autenticado |
| `GET`    | `/api/clientes/me/citas`          | CLIENTE      | Consultar historial de citas propio |
| `POST`   | `/api/citas`                      | Público      | Agendar cita                         |
| `PATCH`  | `/api/citas/:id/confirmar`        | Público      | Confirmar cita                       |
| `PATCH`  | `/api/citas/:id/cancelar`         | Público      | Cancelar cita por id                 |
| `PATCH`  | `/api/citas/cancelar/:token`      | Público      | Cancelar cita por token              |
| `GET`    | `/api/disponibilidad`             | Autenticado  | Consultar disponibilidad             |
| `POST`   | `/api/servicios`                  | ADMIN        | Crear servicio                       |
| `GET`    | `/api/servicios`                  | Staff        | Listar servicios                     |
| `GET`    | `/api/servicios/:id`              | ADMIN        | Obtener servicio                     |
| `PUT`    | `/api/servicios/:id`              | ADMIN        | Actualizar servicio                  |
| `PATCH`  | `/api/servicios/:id/estado`       | ADMIN        | Cambiar estado de servicio           |
| `POST`   | `/api/trabajadoras`               | ADMIN        | Crear trabajadora (compatibilidad)   |
| `GET`    | `/api/trabajadoras`               | Staff        | Listar trabajadoras                  |
| `GET`    | `/api/trabajadoras/:id`           | ADMIN        | Obtener trabajadora                  |
| `PUT`    | `/api/trabajadoras/:id`           | ADMIN        | Actualizar trabajadora               |
| `PATCH`  | `/api/trabajadoras/:id/estado`    | ADMIN        | Cambiar estado de trabajadora        |
| `DELETE` | `/api/trabajadoras/:id`           | ADMIN        | Eliminar trabajadora (soft-delete)   |

> Nota operativa: `POST /api/auth/register` fue retirado para dejar `auth` únicamente como módulo de autenticación.

### Variables de Entorno

| Variable             | Descripción                           | Default        |
|----------------------|---------------------------------------|----------------|
| `NODE_ENV`           | Entorno (development / production)    | development    |
| `PORT`               | Puerto del servidor                   | 3000           |
| `DATABASE_URL`       | Cadena de conexión PostgreSQL         | —              |
| `JWT_SECRET`         | Clave secreta para JWT (≥32 chars)    | —              |
| `JWT_EXPIRES_IN`     | Expiración del token                  | 7d             |
| `BCRYPT_SALT_ROUNDS` | Rondas de hashing                     | 10             |
| `RESEND_API_KEY`     | API key de Resend (opcional)          | —              |
| `RESEND_FROM_EMAIL`  | Dirección de email remitente          | —              |

---

## Tareas Pendientes

### Alta Prioridad
- [ ] **Frontend**: la carpeta `frontend/` está vacía – implementar interfaz de usuario (formulario de agendamiento público, panel de administración).
- [ ] **Gestión completa de estados**: endpoints para marcar citas como `COMPLETADA`, `NO_ASISTIO`, `REPROGRAMADA`.

### Media Prioridad
- [ ] **Revocación de tokens**: implementar blacklist de JWT para invalidar tokens antes de su expiración (logout real).
- [ ] **Gestión de días bloqueados**: crear endpoints para CRUD de `DiaBloqueado` (actualmente existe el modelo pero no hay rutas).
- [ ] **Reprogramación de citas**: endpoint para cambiar fecha/hora de una cita existente.
- [ ] **Ampliar cobertura de tests**: agregar tests unitarios para módulos de servicios y trabajadoras, y más tests de integración.
- [ ] **Convergencia de onboarding**: evaluar retiro progresivo de `POST /api/trabajadoras` como ruta de compatibilidad y centralizar alta de staff en `POST /api/usuarios`.
- [ ] **Gestión administrativa de clientes**: evaluar CRUD interno de clientes para staff (búsqueda, edición y auditoría), separado del flujo self-service de cliente.

### Baja Prioridad
- [ ] **Paginación**: agregar paginación a listados de citas, servicios, trabajadoras y clientes.
- [ ] **Filtros y búsqueda**: filtrar citas por estado, fecha, trabajadora, cliente.
- [ ] **Historial de citas por cliente**: endpoint para consultar citas pasadas de un cliente por teléfono o número de confirmación.
- [ ] **Dashboard de estadísticas**: métricas para la administradora (citas por día/semana, ingresos, trabajadoras con más citas, etc.).
- [ ] **Recordatorios automáticos**: programar envío de emails recordando la cita al cliente (ej. 24h antes).
- [ ] **Rate limiting**: protección contra abuso en endpoints públicos.
- [ ] **Logging estructurado**: integrar un logger (Winston/Pino) para registros de producción.
- [ ] **CI/CD**: pipeline de integración continua (ejecutar tests, lint, build) y despliegue automático.
- [ ] **Documentación de API**: generar documentación interactiva con Swagger/OpenAPI.

---

## Scripts Disponibles

```bash
npm run dev           # Servidor de desarrollo con hot-reload
npm run build         # Compilar TypeScript
npm start             # Ejecutar build compilado
npm test              # Ejecutar tests
npm run test:watch    # Tests en modo watch
npm run test:ci       # Tests con cobertura (CI)
npm run prisma:seed   # Ejecutar datos semilla
npm run test:db       # Probar conexión a base de datos
```

---

## Registro de Cambios Operativos (Abril 2026)

- **PR1 - Staff + compatibilidad**:
  - Se creó el módulo `usuarios` con endpoint `POST /api/usuarios` para crear personal (`ADMIN` y `TRABAJADORA`).
  - Si el rol es `TRABAJADORA`, la creación de `User + Trabajadora` ocurre en una transacción.
  - Se mantuvo `POST /api/trabajadoras` por compatibilidad.

- **PR2 - Limpieza de auth**:
  - Se retiró `POST /api/auth/register`.
  - El módulo `auth` quedó enfocado en login, token, `/auth/me` y logout.
  - Se ajustaron pruebas de integración y documentación de módulos para reflejar el nuevo flujo canónico.

- **PR3 - Cuenta opcional de cliente**:
  - Se agregó el rol `CLIENTE` al sistema de autenticación/autorización.
  - Se creó el módulo `clientes` con endpoints:
    - `POST /api/clientes/register`
    - `GET /api/clientes/me`
    - `GET /api/clientes/me/citas`
  - Se extendió `/api/auth/me` para incluir `clienteId` cuando aplica.
  - Se actualizó el modelo para relación opcional `Cliente.userId` (1:1 con `User`).
  - Se añadieron pruebas de integración para `clientes` y cobertura de `auth/me` en usuarios `CLIENTE`.
