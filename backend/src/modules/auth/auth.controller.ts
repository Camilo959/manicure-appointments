/**
 * Controlador de autenticación
 * 
 * Maneja las peticiones HTTP relacionadas con autenticación
 */

import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema, validate } from './auth.validation';

/**
 * Controlador para operaciones de autenticación
 */
export class AuthController {
    /**
     * POST /auth/login
     * Iniciar sesión
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            // 1. Validar datos de entrada
            const validatedData = validate(loginSchema, req.body);

            // 2. Ejecutar login
            const result = await authService.login(validatedData);

            // 3. Responder con éxito
            res.status(200).json({
                success: true,
                message: 'Inicio de sesión exitoso',
                data: result,
            });

        } catch (error) {
            // Manejar errores
            console.error('❌ Error en login:', error);

            // Error de validación
            if (error && typeof error === 'object' && 'errors' in error) {
                res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors,
                });
                return;
            }

            // Error de credenciales
            const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';

            if (errorMessage.includes('Credenciales inválidas')) {
                res.status(401).json({
                    success: false,
                    message: 'Email o contraseña incorrectos',
                    error: 'INVALID_CREDENTIALS',
                });
                return;
            }

            // Error genérico
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    }

    /**
     * GET /auth/me
     * Obtener información del usuario autenticado
     * 
     * Requiere middleware de autenticación
     */
    async getMe(req: Request, res: Response): Promise<void> {
        try {
            // El middleware de auth ya validó el token y adjuntó req.user
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'No autenticado',
                    error: 'UNAUTHORIZED',
                });
                return;
            }

            // Obtener información completa del usuario
            const user = await authService.getAuthenticatedUser(req.user.userId);

            res.status(200).json({
                success: true,
                data: user,
            });

        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);

            const errorMessage = error instanceof Error ? error.message : 'Error al obtener usuario';

            if (errorMessage.includes('no encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado',
                    error: 'USER_NOT_FOUND',
                });
                return;
            }

            if (errorMessage.includes('inactivo')) {
                res.status(403).json({
                    success: false,
                    message: 'Usuario inactivo',
                    error: 'USER_INACTIVE',
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    }

    /**
     * POST /auth/logout
     * Cerrar sesión
     * 
     * Nota: Con JWT stateless, el logout se maneja en el cliente
     * eliminando el token. Este endpoint es opcional y puede
     * usarse para logging o invalidación en blacklist (futuro)
     */
    async logout(req: Request, res: Response): Promise<void> {
        try {
            // Por ahora, simplemente confirmar el logout
            // En el futuro, aquí se podría:
            // - Agregar el token a una blacklist
            // - Registrar el evento de logout
            // - Invalidar refresh tokens

            res.status(200).json({
                success: true,
                message: 'Sesión cerrada exitosamente',
            });

        } catch (error) {
            console.error('❌ Error en logout:', error);

            res.status(500).json({
                success: false,
                message: 'Error al cerrar sesión',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    }
}

// Exportar instancia única del controlador
export const authController = new AuthController();