/**
 * Rutas de autenticación
 * 
 * Define los endpoints relacionados con autenticación
 */

import { Router } from 'express';
import { getMe, login, logout } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema } from './auth.validation';

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