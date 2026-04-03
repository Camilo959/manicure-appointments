/**
 * Repositorio de autenticación
 * 
 * Capa de acceso a datos para operaciones relacionadas con usuarios
 */

import prisma from '../../config/prisma';
import { User, Rol } from '../../../generated/prisma/client';


/**
 * Repositorio para operaciones de autenticación
 */
export class AuthRepository {
    /**
     * Buscar un usuario por email
     * 
     * @param email - Email del usuario
     * @returns Usuario encontrado o null
     */
    async findUserByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Buscar un usuario por ID
     * 
     * @param id - ID del usuario
     * @returns Usuario encontrado o null
     */
    async findUserById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Buscar un usuario activo por email
     * 
     * Solo retorna usuarios con activo = true
     * 
     * @param email - Email del usuario
     * @returns Usuario activo encontrado o null
     */
    async findActiveUserByEmail(email: string): Promise<User | null> {
        return prisma.user.findFirst({
            where: {
                email,
                activo: true,
            },
        });
    }

    /**
     * Buscar un usuario con su trabajadora asociada
     * 
     * Útil para obtener información completa de una trabajadora
     * 
     * @param userId - ID del usuario
     * @returns Usuario con trabajadora o null
     */
    async findUserWithTrabajadora(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            include: {
                trabajadora: true,
            },
        });
    }

    /**
     * Verificar si existe un usuario con el email dado
     * 
     * @param email - Email a verificar
     * @returns true si existe, false si no
     */
    async emailExists(email: string): Promise<boolean> {
        const count = await prisma.user.count({
            where: { email },
        });

        return count > 0;
    }

    /**
     * Crear un nuevo usuario
     * 
     * @param data - Datos del usuario a crear
     * @returns Usuario creado
     */
    async createUser(data: {
        nombre: string;
        email: string;
        password: string;
        rol: Rol;
    }): Promise<User> {
        return prisma.user.create({
            data: {
                nombre: data.nombre,
                email: data.email,
                password: data.password,
                rol: data.rol,
                activo: true,
            },
        });
    }
}

// Exportar instancia única del repositorio
export const authRepository = new AuthRepository();