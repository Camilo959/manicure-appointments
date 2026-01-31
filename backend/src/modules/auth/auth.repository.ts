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
        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            return user;
        } catch (error) {
            console.error('❌ Error buscando usuario por email:', error);
            throw new Error('Error al buscar usuario');
        }
    }

    /**
     * Buscar un usuario por ID
     * 
     * @param id - ID del usuario
     * @returns Usuario encontrado o null
     */
    async findUserById(id: string): Promise<User | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
            });

            return user;
        } catch (error) {
            console.error('❌ Error buscando usuario por ID:', error);
            throw new Error('Error al buscar usuario');
        }
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
        try {
            const user = await prisma.user.findFirst({
                where: {
                    email,
                    activo: true,
                },
            });

            return user;
        } catch (error) {
            console.error('❌ Error buscando usuario activo:', error);
            throw new Error('Error al buscar usuario');
        }
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
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    trabajadora: true,
                },
            });

            return user;
        } catch (error) {
            console.error('❌ Error buscando usuario con trabajadora:', error);
            throw new Error('Error al buscar usuario');
        }
    }

    /**
     * Verificar si existe un usuario con el email dado
     * 
     * @param email - Email a verificar
     * @returns true si existe, false si no
     */
    async emailExists(email: string): Promise<boolean> {
        try {
            const count = await prisma.user.count({
                where: { email },
            });

            return count > 0;
        } catch (error) {
            console.error('❌ Error verificando email:', error);
            throw new Error('Error al verificar email');
        }
    }

    /**
     * Contar usuarios por rol
     * 
     * @param rol - Rol a contar
     * @returns Número de usuarios con ese rol
     */
    async countUsersByRole(rol: Rol): Promise<number> {
        try {
            const count = await prisma.user.count({
                where: { rol },
            });

            return count;
        } catch (error) {
            console.error('❌ Error contando usuarios por rol:', error);
            throw new Error('Error al contar usuarios');
        }
    }
}

// Exportar instancia única del repositorio
export const authRepository = new AuthRepository();