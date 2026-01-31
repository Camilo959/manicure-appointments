/**
 * Utilidades para manejo de tokens JWT
 * 
 * Funciones para generar, verificar y decodificar tokens JWT
 */

import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import config from '../config/env';

/**
 * Payload del token JWT
 */
export interface JwtPayload {
    userId: string;
    rol: 'ADMIN' | 'TRABAJADORA';
}

/**
 * Token decodificado con información adicional
 */
export interface DecodedToken extends JwtPayload {
    iat: number;  // Issued at
    exp: number;  // Expiration time
}

/**
 * Generar un token JWT
 * 
 * @param payload - Información del usuario a incluir en el token
 * @returns Token JWT firmado
 */
export function generateToken(payload: JwtPayload): string {
    const secret: Secret = config.jwt.secret;
    const expiresIn: SignOptions['expiresIn'] = config.jwt.expiresIn as unknown as SignOptions['expiresIn'];

    if (!secret) throw new Error('JWT secret is not defined');
    if (!expiresIn) throw new Error('JWT expiration time is not defined');

    return jwt.sign(payload, secret, { expiresIn, algorithm: 'HS256' });
}

/**
 * Verificar y decodificar un token JWT
 * 
 * @param token - Token JWT a verificar
 * @returns Payload decodificado del token
 * @throws Error si el token es inválido o ha expirado
 */
export function verifyToken(token: string): DecodedToken {
    try {
        const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expirado');
        }

        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Token inválido');
        }

        throw new Error('Error al verificar token');
    }
}

/**
 * Decodificar un token sin verificar (útil para debugging)
 * ⚠️ NO usar para autenticación, solo para inspección
 * 
 * @param token - Token JWT a decodificar
 * @returns Payload decodificado o null si es inválido
 */
export function decodeTokenUnsafe(token: string): DecodedToken | null {
    try {
        const decoded = jwt.decode(token) as DecodedToken;
        return decoded;
    } catch (error) {
        console.error('❌ Error decodificando token:', error);
        return null;
    }
}

/**
 * Extraer token del header Authorization
 * 
 * @param authHeader - Header Authorization completo
 * @returns Token extraído o null
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
        return null;
    }

    // Formato esperado: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

/**
 * Verificar si un token está próximo a expirar
 * 
 * @param token - Token decodificado
 * @param thresholdMinutes - Minutos antes de expiración (default: 30)
 * @returns true si el token expira pronto
 */
export function isTokenExpiringSoon(
    token: DecodedToken,
    thresholdMinutes: number = 30
): boolean {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = token.exp - now;
    const thresholdSeconds = thresholdMinutes * 60;

    return expiresIn <= thresholdSeconds;
}