import { z } from 'zod';

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

export const crearUsuarioStaffSchema = z.object({
  body: z.object({
    nombre: nombreValidation,
    email: emailValidation,
    password: passwordValidation,
    rol: z.enum(['ADMIN', 'TRABAJADORA'], {
      message: 'El rol debe ser ADMIN o TRABAJADORA',
    }),
  }),
});

export type CrearUsuarioStaffInput = z.infer<typeof crearUsuarioStaffSchema>['body'];