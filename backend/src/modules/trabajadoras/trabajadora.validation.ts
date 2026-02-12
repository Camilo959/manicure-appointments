import { z } from 'zod';

/**
 * Schema para crear una trabajadora
 */
export const crearTrabajadoraSchema = z.object({
  body: z.object({
    nombre: z
      .string({ message: 'El nombre es obligatorio' })
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede superar 100 caracteres')
      .trim(),
    email: z
      .string({ message: 'El email es obligatorio' })
      .email('Email inválido')
      .trim()
      .toLowerCase(),
    password: z
      .string({ message: 'La contraseña es obligatoria' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(50, 'La contraseña no puede superar 50 caracteres'),
  }),
});

/**
 * Schema para actualizar una trabajadora
 */
export const actualizarTrabajadoraSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de trabajadora inválido'),
  }),
  body: z.object({
    nombre: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede superar 100 caracteres')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Email inválido')
      .trim()
      .toLowerCase()
      .optional(),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(50, 'La contraseña no puede superar 50 caracteres')
      .optional(),
  }),
});

/**
 * Schema para cambiar estado de trabajadora
 */
export const cambiarEstadoTrabajadoraSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de trabajadora inválido'),
  }),
  body: z.object({
    activa: z.boolean({ message: 'El estado activa es obligatorio' }),
  }),
});

/**
 * Schema para obtener trabajadora por ID
 */
export const obtenerTrabajadoraPorIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de trabajadora inválido'),
  }),
});

export type CrearTrabajadoraInput = z.infer<typeof crearTrabajadoraSchema>['body'];
export type ActualizarTrabajadoraInput = z.infer<typeof actualizarTrabajadoraSchema>['body'];
export type CambiarEstadoTrabajadoraInput = z.infer<typeof cambiarEstadoTrabajadoraSchema>['body'];