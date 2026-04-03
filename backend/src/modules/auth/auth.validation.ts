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
    body: z.object({
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
    }),
});

/**
 * Tipo inferido del schema de login
 */
export type LoginInput = z.infer<typeof loginSchema>['body'];

/**
 * Schema de validación para registro de usuario
 */
export const registerSchema = z.object({
    body: z.object({
        nombre: z
            .string({
                message: 'El nombre es requerido',
            })
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .max(100, 'El nombre no puede exceder 100 caracteres')
            .trim(),

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
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
            ),
    }),
});

/**
 * Tipo inferido del schema de registro
 */
export type RegisterInput = z.infer<typeof registerSchema>['body'];

/**
 * Schema de validación para cambio de contraseña (para futuro)
 */
export const changePasswordSchema = z.object({
    body: z.object({
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
    }),
}).refine((data) => data.body.newPassword === data.body.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['body', 'confirmPassword'],
});

/**
 * Tipo inferido del schema de cambio de contraseña
 */
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];