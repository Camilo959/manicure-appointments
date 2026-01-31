/**
 * Validaciones para el módulo de autenticación
 * 
 * Esquemas de validación usando Zod
 */

import { z } from 'zod';

/**
 * Schema de validación para login
 */
export const loginSchema = z.object({
    email: z
        .string({
            message: 'El email es requerido',
        })
        .email({ message: 'El formato del email no es válido' })
        .toLowerCase()
        .trim(),

    password: z
        .string({
            message: 'La contraseña es requerida',
        })
        .min(1, 'La contraseña no puede estar vacía'),
});

/**
 * Tipo inferido del schema de login
 */
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema de validación para cambio de contraseña (para futuro)
 */
export const changePasswordSchema = z.object({
    currentPassword: z
        .string({
            message: 'La contraseña actual es requerida',
        })
        .min(1, 'La contraseña actual no puede estar vacía'),

    newPassword: z
        .string({
            message: 'La nueva contraseña es requerida',
        })
        .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número'
        ),

    confirmPassword: z
        .string({
            message: 'La confirmación de contraseña es requerida',
        }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

/**
 * Tipo inferido del schema de cambio de contraseña
 */
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Validar un objeto contra un schema de Zod
 * 
 * @param schema - Schema de Zod a usar
 * @param data - Datos a validar
 * @returns Datos validados y parseados
 * @throws Error con los mensajes de validación si falla
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Formatear errores de Zod
            const formattedErrors = error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            throw {
                message: 'Error de validación',
                errors: formattedErrors,
            };
        }

        throw error;
    }
}