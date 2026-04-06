/**
 * Middleware de autorización por roles
 *
 * Valida que el usuario autenticado tenga uno de los roles permitidos.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Tipo de roles disponibles
 */
export type UserRole = 'ADMIN' | 'TRABAJADORA' | 'CLIENTE';

/**
 * Middleware para autorizar acceso basado en roles
 *
 * ⚠️ IMPORTANTE: Este middleware debe usarse DESPUÉS de `authenticate`
 */
export function authorizeRoles(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Autenticación requerida',
                error: 'AUTHENTICATION_REQUIRED',
            });
            return;
        }

        const userRole = req.user.rol;

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso',
                error: 'FORBIDDEN',
                details: {
                    requiredRoles: allowedRoles,
                    userRole,
                },
            });
            return;
        }

        next();
    };
}

/**
 * Alias conveniente de `authorizeRoles('ADMIN')`
 */
export const requireAdmin = authorizeRoles('ADMIN');

/**
 * Alias conveniente de `authorizeRoles('ADMIN', 'TRABAJADORA')`
 */
export const requireStaff = authorizeRoles('ADMIN', 'TRABAJADORA');

/**
 * Alias conveniente de `authorizeRoles('CLIENTE')`
 */
export const requireCliente = authorizeRoles('CLIENTE');

/**
 * Permite acceso al dueño del recurso o a un administrador.
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