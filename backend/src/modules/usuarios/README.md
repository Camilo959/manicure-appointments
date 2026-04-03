# 👥 Módulo de Usuarios (Staff)

## 📋 Descripción

Módulo para gestionar altas de personal del negocio:

- `ADMIN`
- `TRABAJADORA`

Este módulo centraliza la creación de cuentas de staff y evita que `auth` asuma responsabilidades de onboarding.

## 🎯 Endpoint principal

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `POST` | `/api/usuarios` | Crear usuario de staff (`ADMIN` o `TRABAJADORA`) | ADMIN |

## ✅ Flujo canónico

- **Flujo canónico de alta de personal**: `POST /api/usuarios`.

## 🔐 Reglas de negocio

- Si `rol = ADMIN`: se crea solo `User`.
- Si `rol = TRABAJADORA`: se crea `User` + `Trabajadora` en transacción.
- El email debe ser único.
- La contraseña se almacena hasheada con `bcrypt` (10 rounds).

## 🔄 Compatibilidad

- **Ruta de compatibilidad**: `POST /api/trabajadoras` para alta directa de trabajadoras.
- `POST /api/auth/register` fue retirado para dejar `auth` únicamente como módulo de autenticación.