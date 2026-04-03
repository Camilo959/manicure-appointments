/**
 * Servicio de autenticación
 * 
 * Contiene la lógica de negocio para autenticación y autorización
 */

import bcrypt from 'bcryptjs';
import { authRepository } from './auth.repository';
import { generateToken } from '../../utils/token.utils';
import { LoginInput, RegisterInput } from './auth.validation';
import {
    CredencialesInvalidasError,
    EmailYaRegistradoError,
    UsuarioInactivoError,
    UsuarioNoEncontradoError,
} from './auth.errors';

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
 * Respuesta exitosa de registro
 */
export interface RegisterResponse {
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
            throw new CredencialesInvalidasError();
        }

        // 2. Verificar contraseña
        const isPasswordValid = await this.verifyPassword(password, user.password);

        if (!isPasswordValid) {
            throw new CredencialesInvalidasError();
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
     * Registrar un nuevo usuario
     * 
     * @param userData - Datos del nuevo usuario
     * @returns Información del usuario y token JWT
     * @throws Error si el email ya está en uso
     */
    async register(userData: RegisterInput): Promise<RegisterResponse> {
        const { nombre, email, password } = userData;

        // 1. Validar que el email no esté en uso
        await this.validateEmailAvailable(email);

        // 2. Encriptar contraseña
        const hashedPassword = await this.hashPassword(password);

        // 3. Crear usuario en la base de datos
        const user = await authRepository.createUser({
            nombre,
            email,
            password: hashedPassword,
            rol: 'TRABAJADORA',
        });

        // 4. Generar token JWT
        const token = generateToken({
            userId: user.id,
            rol: user.rol,
        });

        // 5. Retornar información del usuario y token
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
            throw new UsuarioNoEncontradoError();
        }

        if (!user.activo) {
            throw new UsuarioInactivoError();
        }

        if (user.rol === 'TRABAJADORA') {
            const userWithTrabajadora = await authRepository.findUserWithTrabajadora(userId);

            if (!userWithTrabajadora) {
                throw new UsuarioNoEncontradoError();
            }

            return {
                id: userWithTrabajadora.id,
                nombre: userWithTrabajadora.nombre,
                email: userWithTrabajadora.email,
                rol: userWithTrabajadora.rol,
                activo: userWithTrabajadora.activo,
                ...(userWithTrabajadora.trabajadora && {
                    trabajadoraId: userWithTrabajadora.trabajadora.id,
                }),
            };
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
    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    /**
     * Verificar si una contraseña coincide con su hash
     * 
     * @param password - Contraseña en texto plano
     * @param hashedPassword - Contraseña encriptada
     * @returns true si coinciden, false si no
     */
    private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
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
            throw new EmailYaRegistradoError();
        }
    }
}

// Exportar instancia única del servicio
export const authService = new AuthService();