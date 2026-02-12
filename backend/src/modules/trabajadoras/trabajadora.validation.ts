import { z } from 'zod';

/**
 * Validaciones reutilizables
 */

const nombreValidation = z
  .string({ message: 'El nombre es obligatorio' })
  .min(3, 'El nombre debe tener al menos 3 caracteres')
  .max(100, 'El nombre no puede superar 100 caracteres')
  .trim()
  .refine((val) => val.length > 0, 'El nombre no puede estar vacío');

const emailValidation = z
  .string({ message: 'El email es obligatorio' })
  .email('Email inválido')
  .trim()
  .toLowerCase()
  .refine((val) => val.length > 0, 'El email no puede estar vacío');

const passwordValidation = z
  .string({ message: 'La contraseña es obligatoria' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede superar 72 caracteres')
  .refine(
    (val) => /[A-Z]/.test(val),
    'La contraseña debe contener al menos una mayúscula'
  )
  .refine(
    (val) => /[a-z]/.test(val),
    'La contraseña debe contener al menos una minúscula'
  )
  .refine(
    (val) => /[0-9]/.test(val),
    'La contraseña debe contener al menos un número'
  );

const uuidValidation = z
  .string({ message: 'ID es obligatorio' })
  .uuid('ID de trabajadora inválido');

/**
 * Schema para crear trabajadora
 */
export const crearTrabajadoraSchema = z.object({
  body: z.object({
    nombre: nombreValidation,
    email: emailValidation,
    password: passwordValidation,
  }),
});

/**
 * Schema para actualizar trabajadora
 */
export const actualizarTrabajadoraSchema = z.object({
  params: z.object({
    id: uuidValidation,
  }),
  body: z
    .object({
      nombre: nombreValidation.optional(),
      email: emailValidation.optional(),
      password: passwordValidation.optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      'Debe proporcionar al menos un campo para actualizar'
    ),
});

/**
 * Schema para obtener trabajadora por ID
 */
export const obtenerTrabajadoraPorIdSchema = z.object({
  params: z.object({
    id: uuidValidation,
  }),
});

/**
 * Schema para eliminar (soft delete) trabajadora
 */
export const eliminarTrabajadoraSchema = z.object({
  params: z.object({
    id: uuidValidation,
  }),
});

/**
 * Schema para cambiar estado explícitamente (alternativa al DELETE)
 */
export const cambiarEstadoTrabajadoraSchema = z.object({
  params: z.object({
    id: uuidValidation,
  }),
  body: z.object({
    activa: z.boolean({ message: 'El estado activa es obligatorio' }),
  }),
});

/**
 * Type exports
 */
export type CrearTrabajadoraInput = z.infer<typeof crearTrabajadoraSchema>['body'];
export type ActualizarTrabajadoraInput = z.infer<typeof actualizarTrabajadoraSchema>['body'];
export type CambiarEstadoTrabajadoraInput = z.infer<typeof cambiarEstadoTrabajadoraSchema>['body'];