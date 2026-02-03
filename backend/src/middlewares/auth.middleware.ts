/**
 * Middleware de autenticación
 * 
 * Valida el token JWT en las peticiones y adjunta
 * el usuario autenticado al objeto request
 */

import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/token.utils';

/**
 * Middleware para proteger rutas que requieren autenticación
 * 
 * Uso:
 * ```
 * router.get('/protected', authenticate, controller.method);
 * ```
 * 
 * Después de este middleware, `req.user` estará disponible
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // 1. Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación',
        error: 'MISSING_TOKEN',
      });
      return;
    }

    // 2. Verificar y decodificar token
    const decoded = verifyToken(token);

    // 3. Adjuntar usuario al request
    req.user = {
      userId: decoded.userId,
      rol: decoded.rol,
    };

    // 4. Continuar al siguiente middleware/controlador
    next();

  } catch (error) {
    // Manejar errores de token
    const errorMessage = error instanceof Error ? error.message : 'Error de autenticación';

    let statusCode = 401;
    let errorCode = 'INVALID_TOKEN';

    if (errorMessage.includes('expirado')) {
      errorCode = 'TOKEN_EXPIRED';
    } else if (errorMessage.includes('inválido')) {
      errorCode = 'INVALID_TOKEN';
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: errorCode,
    });
  }
}

/**
 * Middleware opcional de autenticación
 * 
 * Similar a `authenticate` pero no falla si no hay token,
 * simplemente no adjunta el usuario al request
 * 
 * Útil para rutas que tienen funcionalidad diferente
 * si el usuario está autenticado o no
 * 
 * Uso:
 * ```
 * router.get('/public-or-private', optionalAuthenticate, controller.method);
 * ```
 */
export function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      // No hay token, continuar sin usuario
      next();
      return;
    }

    // Intentar verificar token
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      rol: decoded.rol,
    };

    next();

  } catch (error) {
    // Si hay error, simplemente continuar sin usuario
    // (no exponer información de error en autenticación opcional)
    next();
  }
}