import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { aplicarRateLimitAgendarCita } from '../../middlewares/cita-rate-limit.middleware';
import {
  agendarCitaPublica,
  cancelarCita,
  cancelarCitaPorToken,
  confirmarCita,
} from './cita.controller';
import {
  agendarCitaPublicaSchema,
  cancelarCitaPorTokenSchema,
  cancelarCitaSchema,
  confirmarCitaSchema,
} from './cita.validation';

const router = Router();

/**
 * @route   POST /api/citas
 * @desc    Agendar cita pública (sin autenticación)
 * @access  Public
 */
router.post(
  '/',
  validate(agendarCitaPublicaSchema),
  aplicarRateLimitAgendarCita,
  agendarCitaPublica
);

router.patch(
  '/:id/confirmar',
  validate(confirmarCitaSchema),
  confirmarCita
);

router.patch(
  '/:id/cancelar',
  validate(cancelarCitaSchema),
  cancelarCita
);

router.patch(
  '/cancelar/:token',
  validate(cancelarCitaPorTokenSchema),
  cancelarCitaPorToken
);

export default router;