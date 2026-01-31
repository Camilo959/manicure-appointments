/**
 * Middleware de autorización por roles
 * 
 * Valida que el usuario autenticado tenga uno de los roles permitidos
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Tipo de roles disponibles
 */
type UserRole = 'ADMIN' | 'TRABAJADORA';

/**
 * Middleware para autorizar acceso basado en roles
 * 
 * ⚠️ IMPORTANTE: Este middleware debe usarse DESPUÉS de `authenticate`
 * 
 * Uso:
 * ```
 * // Solo administradores
 * router.delete('/users/:id', authenticate, authorizeRoles('ADMIN'), controller.delete);
 * 
 * // Administradores o trabajadoras
 * router.get('/citas', authenticate, authorizeRoles('ADMIN', 'TRABAJADORA'), controller.list);
 * ```
 * 
 * @param allowedRoles - Uno o más roles permitidos
 * @returns Middleware de Express
 */
export function authorizeRoles(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        // 1. Verificar que el usuario esté autenticado
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Autenticación requerida',
                error: 'AUTHENTICATION_REQUIRED',
            });
            return;
        }

        // 2. Verificar que el usuario tenga un rol permitido
        const userRole = req.user.rol;

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso',
                error: 'FORBIDDEN',
                details: {
                    requiredRoles: allowedRoles,
                    userRole: userRole,
                },
            });
            return;
        }

        // 3. Usuario tiene permisos, continuar
        next();
    };
}

/**
 * Middleware que solo permite acceso a administradores
 * 
 * Alias conveniente de `authorizeRoles('ADMIN')`
 * 
 * Uso:
 * ```
 * router.delete('/users/:id', authenticate, requireAdmin, controller.delete);
 * ```
 */
export const requireAdmin = authorizeRoles('ADMIN');

/**
 * Middleware que permite acceso a administradores y trabajadoras
 * 
 * Alias conveniente de `authorizeRoles('ADMIN', 'TRABAJADORA')`
 * 
 * Uso:
 * ```
 * router.get('/citas', authenticate, requireStaff, controller.list);
 * ```
 */
export const requireStaff = authorizeRoles('ADMIN', 'TRABAJADORA');

/**
 * Middleware que verifica si el usuario es el dueño del recurso o es admin
 * 
 * Útil para rutas donde un usuario puede acceder a sus propios recursos
 * pero un admin puede acceder a todos
 * 
 * Uso:
 * ```
 * router.get('/users/:id', authenticate, requireOwnerOrAdmin('id'), controller.get);
 * ```
 * 
 * @param paramName - Nombre del parámetro que contiene el ID del usuario dueño
 * @returns Middleware de Express
 */
export function requireOwnerOrAdmin(paramName: string = 'id') {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Autenticación requerida',
                error: 'AUTHENTICATION_REQUIRED',
            });
            return;
        }

        const resourceOwnerId = req.params[paramName];
        const isOwner = req.user.userId === resourceOwnerId;
        const isAdmin = req.user.rol === 'ADMIN';

        if (!isOwner && !isAdmin) {
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso',
                error: 'FORBIDDEN',
            });
            return;
        }

        next();
    };
}