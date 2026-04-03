/**
 * Repositorio de autenticación
 * 
 * Capa de acceso a datos para operaciones relacionadas con usuarios
 */

import prisma from '../../config/prisma';
import { User } from '../../../generated/prisma/client';


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

}

// Exportar instancia única del repositorio
export const authRepository = new AuthRepository();