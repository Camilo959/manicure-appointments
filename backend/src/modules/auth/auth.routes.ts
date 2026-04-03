/**
 * Rutas de autenticación
 * 
 * Define los endpoints relacionados con autenticación
 */

import { Router } from 'express';
import { getMe, login, logout, register } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();

/**
 * POST /auth/login
 * Iniciar sesión con email y contraseña
 * 
 * Body:
 * {
 *   "email": "admin@example.com",
 *   "password": "password123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Inicio de sesión exitoso",
 *   "data": {
 *     "user": {
 *       "id": "uuid",
 *       "nombre": "Admin",
 *       "email": "admin@example.com",
 *       "rol": "ADMIN"
 *     },
 *     "token": "jwt_token_here"
 *   }
 * }
 */
router.post('/login', validate(loginSchema), login);

/**
 * POST /auth/register
 * Registrar un nuevo usuario
 * 
 * Endpoint de registro público limitado:
 * - Siempre crea un User con rol TRABAJADORA
 * - No crea la entidad Trabajadora asociada
 *
 * Para gestión de personal (ADMIN y TRABAJADORA), usar POST /api/usuarios.
 * POST /api/trabajadoras se mantiene por compatibilidad para alta directa de trabajadoras.
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Usuario registrado exitosamente",
 *   "data": {
 *     "user": {
 *       "id": "uuid",
 *       "nombre": "María García",
 *       "email": "maria@example.com",
 *       "rol": "TRABAJADORA"
 *     },
 *     "token": "jwt_token_here"
 *   }
 * }
 */
router.post('/register', validate(registerSchema), register);

/**
 * GET /auth/me
 * Obtener información del usuario autenticado
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "nombre": "Admin",
 *     "email": "admin@example.com",
 *     "rol": "ADMIN",
 *     "activo": true,
 *     "trabajadoraId": "uuid" // solo cuando existe relación trabajadora
 *   }
 * }
 */
router.get('/me', authenticate, getMe);

/**
 * POST /auth/logout
 * Cerrar sesión (opcional con JWT stateless)
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Sesión cerrada exitosamente"
 * }
 */
router.post('/logout', authenticate, logout);

export default router;