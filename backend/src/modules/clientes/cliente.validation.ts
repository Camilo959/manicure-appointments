import { z } from 'zod';

const TELEFONO_REGEX = /^(\+?57)?3\d{9}$/;

const nombreValidation = z
  .string({ message: 'El nombre es obligatorio' })
  .min(3, 'El nombre debe tener al menos 3 caracteres')
  .max(100, 'El nombre no puede superar 100 caracteres')
  .trim()
  .refine((val) => val.length > 0, 'El nombre no puede estar vacío');

const telefonoValidation = z
  .string({ message: 'El teléfono es obligatorio' })
  .trim()
  .regex(TELEFONO_REGEX, 'Formato de teléfono inválido. Ej: +573001234567');

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

export const registrarClienteSchema = z.object({
  body: z.object({
    nombre: nombreValidation,
    telefono: telefonoValidation,
    email: emailValidation,
    password: passwordValidation,
  }),
});

export type RegistrarClienteInput = z.infer<typeof registrarClienteSchema>['body'];
