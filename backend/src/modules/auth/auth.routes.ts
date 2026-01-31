/**
 * Rutas de autenticación
 * 
 * Define los endpoints relacionados con autenticación
 */

import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

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
router.post('/login', (req, res) => authController.login(req, res));

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
 *     "activo": true
 *   }
 * }
 */
router.get('/me', authenticate, (req, res) => authController.getMe(req, res));

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
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));

export default router;