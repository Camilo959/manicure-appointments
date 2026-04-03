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

## 🔐 Reglas de negocio

- Si `rol = ADMIN`: se crea solo `User`.
- Si `rol = TRABAJADORA`: se crea `User` + `Trabajadora` en transacción.
- El email debe ser único.
- La contraseña se almacena hasheada con `bcrypt` (10 rounds).

## 🔄 Compatibilidad

- `POST /api/trabajadoras` sigue disponible por compatibilidad.
- `POST /api/auth/register` sigue disponible temporalmente, pero es limitado y no crea perfil de `Trabajadora`.

## 🧭 Próximo paso (PR2)

- Retirar/deprecar de forma definitiva `POST /api/auth/register` para dejar `auth` únicamente como módulo de autenticación.