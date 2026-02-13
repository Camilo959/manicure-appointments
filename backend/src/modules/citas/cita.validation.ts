import { z } from 'zod';

/**
 * Regex para validar teléfono chileno (ejemplo)
 * Ajustar según tu país
 */
const TELEFONO_REGEX = /^(\+?56)?[9]\d{8}$/;

/**
 * Regex para formato de hora HH:mm
 */
const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validación de teléfono
 */
const telefonoValidation = z
  .string({ message: 'El teléfono es obligatorio' })
  .regex(TELEFONO_REGEX, 'Formato de teléfono inválido. Ej: +56912345678')
  .trim();

/**
 * Validación de email opcional
 */
const emailOpcionalValidation = z
  .string()
  .email('Email inválido')
  .trim()
  .toLowerCase()
  .optional()
  .or(z.literal(''));

/**
 * Validación de fecha YYYY-MM-DD
 */
const fechaValidation = z
  .string({ message: 'La fecha es obligatoria' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Usar YYYY-MM-DD')
  .refine((fecha) => {
    const fechaObj = new Date(fecha);
    return !isNaN(fechaObj.getTime());
  }, 'Fecha inválida');

/**
 * Validación de hora HH:mm
 */
const horaValidation = z
  .string({ message: 'La hora es obligatoria' })
  .regex(HORA_REGEX, 'Formato de hora inválido. Usar HH:mm (00:00 - 23:59)');

/**
 * Schema para agendar cita pública
 */
export const agendarCitaPublicaSchema = z.object({
  body: z.object({
    nombreCliente: z
      .string({ message: 'El nombre del cliente es obligatorio' })
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede superar 100 caracteres')
      .trim()
      .refine((val) => val.length > 0, 'El nombre no puede estar vacío'),

    telefono: telefonoValidation,

    email: emailOpcionalValidation,

    trabajadoraId: z
      .string({ message: 'El ID de la trabajadora es obligatorio' })
      .uuid('ID de trabajadora inválido'),

    fecha: fechaValidation,

    horaInicio: horaValidation,

    serviciosIds: z
      .array(z.string().uuid('ID de servicio inválido'), {
        message: 'Debe proporcionar al menos un servicio',
      })
      .min(1, 'Debe seleccionar al menos un servicio')
      .max(10, 'No puede seleccionar más de 10 servicios'),
  }),
});

/**
 * Type exports
 */
export type AgendarCitaPublicaInput = z.infer<
  typeof agendarCitaPublicaSchema
>['body'];