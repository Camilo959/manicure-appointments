/**
 * Controlador de autenticación
 * 
 * Maneja las peticiones HTTP relacionadas con autenticación
 */

import { NextFunction, Request, Response } from 'express';
import { authService } from './auth.service';
import { AuthError } from './auth.errors';

/**
 * POST /auth/login
 * Iniciar sesión
 */
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await authService.login(req.body);

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /auth/register
 * Registrar un nuevo usuario
 */
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await authService.register(req.body);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /auth/me
 * Obtener información del usuario autenticado
 */
export const getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthError('No autenticado', 401, 'UNAUTHORIZED');
        }

        const user = await authService.getAuthenticatedUser(req.user.userId);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /auth/logout
 * Cerrar sesión
 */
export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente',
        });
    } catch (error) {
        next(error);
    }
};