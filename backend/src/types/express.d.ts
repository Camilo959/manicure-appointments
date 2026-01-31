/**
 * Extensiones de tipos para Express
 * 
 * Este archivo extiende los tipos de Express para incluir
 * información del usuario autenticado en el objeto Request
 */

import { Request } from 'express';
import { JwtPayload } from '../utils/token.utils';

/**
 * Usuario autenticado incluido en el request
 */
export interface AuthUser extends JwtPayload {
    userId: string;
    rol: 'ADMIN' | 'TRABAJADORA';
}

/**
 * Extensión del tipo Request de Express
 */
declare global {
    namespace Express {
        interface Request {
            /**
             * Usuario autenticado (disponible después del middleware de auth)
             */
            user?: AuthUser;
        }
    }
}

export { };