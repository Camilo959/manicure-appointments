# 👤 Módulo de Clientes

## 📋 Descripción

Módulo para cuentas opcionales de clientes.

El sistema mantiene dos caminos válidos para clientes:

- **Sin login (flujo público):** pueden agendar citas con `POST /api/citas` sin autenticación.
- **Con login (flujo opcional):** pueden crear cuenta y consultar su perfil e historial.

Este diseño preserva la experiencia rápida de agendamiento y agrega autogestión para quienes sí quieren cuenta.

## 🎯 Endpoints

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `POST` | `/api/clientes/register` | Crear cuenta de cliente (rol `CLIENTE`) | Público |
| `GET` | `/api/clientes/me` | Obtener perfil del cliente autenticado | CLIENTE |
| `GET` | `/api/clientes/me/citas` | Listar historial de citas del cliente autenticado | CLIENTE |

## ✅ Flujo canónico

- **Flujo canónico de cuenta cliente:** `POST /api/clientes/register`.

## 🔐 Reglas de negocio

- Se crea un `User` con rol `CLIENTE` y `activo = true`.
- El email debe ser único en `User`.
- La contraseña se almacena hasheada con `bcrypt`.
- Si ya existe `Cliente` con el mismo teléfono y no tiene cuenta, se vincula ese registro (`Cliente.userId`).
- Si ya existe `Cliente` con cuenta asociada (`userId` no nulo), se rechaza con conflicto.
- Los endpoints `/me` y `/me/citas` exigen autenticación JWT y rol `CLIENTE`.

## 🧩 Integración con Auth

- `auth` continúa como módulo de autenticación (login/token/me/logout).
- `POST /api/auth/login` acepta usuarios `CLIENTE` además de staff.
- `GET /api/auth/me` retorna `clienteId` cuando el usuario autenticado tiene relación con `Cliente`.

## 🔄 Convivencia con flujo público

- El agendamiento público (`POST /api/citas`) se mantiene sin cambios.
- La cuenta de cliente es **opcional**, no requisito para reservar.
- El sistema conserva creación/actualización implícita de `Cliente` por teléfono durante el agendamiento.

## 📮 Ejemplos de API

- Ver ejemplos de request/response en `EJEMPLOS_API.md`.
