/**
 * Servicio de autenticación
 * 
 * Contiene la lógica de negocio para autenticación y autorización
 */

import bcrypt from 'bcryptjs';
import { authRepository } from './auth.repository';
import { generateToken } from '../../utils/token.utils';
import { LoginInput } from './auth.validation';
import config from '../../config/env';

/**
 * Respuesta exitosa de login
 */
export interface LoginResponse {
    user: {
        id: string;
        nombre: string;
        email: string;
        rol: 'ADMIN' | 'TRABAJADORA';
    };
    token: string;
}

/**
 * Servicio para operaciones de autenticación
 */
export class AuthService {
    /**
     * Iniciar sesión con email y contraseña
     * 
     * @param credentials - Email y contraseña del usuario
     * @returns Información del usuario y token JWT
     * @throws Error si las credenciales son inválidas
     */
    async login(credentials: LoginInput): Promise<LoginResponse> {
        const { email, password } = credentials;

        // 1. Buscar usuario activo por email
        const user = await authRepository.findActiveUserByEmail(email);

        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        // 2. Verificar contraseña
        const isPasswordValid = await this.verifyPassword(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Credenciales inválidas');
        }

        // 3. Generar token JWT
        const token = generateToken({
            userId: user.id,
            rol: user.rol,
        });

        // 4. Retornar información del usuario y token
        return {
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
            },
            token,
        };
    }

    /**
     * Obtener información del usuario autenticado
     * 
     * @param userId - ID del usuario
     * @returns Información del usuario
     * @throws Error si el usuario no existe
     */
    async getAuthenticatedUser(userId: string) {
        const user = await authRepository.findUserById(userId);

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        if (!user.activo) {
            throw new Error('Usuario inactivo');
        }

        return {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            activo: user.activo,
        };
    }

    /**
     * Encriptar una contraseña
     * 
     * @param password - Contraseña en texto plano
     * @returns Contraseña encriptada
     */
    async hashPassword(password: string): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (error) {
            console.error('❌ Error encriptando contraseña:', error);
            throw new Error('Error al procesar contraseña');
        }
    }

    /**
     * Verificar si una contraseña coincide con su hash
     * 
     * @param password - Contraseña en texto plano
     * @param hashedPassword - Contraseña encriptada
     * @returns true si coinciden, false si no
     */
    async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        try {
            const isValid = await bcrypt.compare(password, hashedPassword);
            return isValid;
        } catch (error) {
            console.error('❌ Error verificando contraseña:', error);
            return false;
        }
    }

    /**
     * Validar que un email no esté en uso
     * 
     * @param email - Email a validar
     * @throws Error si el email ya existe
     */
    async validateEmailAvailable(email: string): Promise<void> {
        const exists = await authRepository.emailExists(email);

        if (exists) {
            throw new Error('El email ya está registrado');
        }
    }
}

// Exportar instancia única del servicio
export const authService = new AuthService();