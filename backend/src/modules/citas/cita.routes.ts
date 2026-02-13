import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { agendarCitaPublica } from './cita.controller';
import { agendarCitaPublicaSchema } from './cita.validation';

const router = Router();

/**
 * @route   POST /api/citas
 * @desc    Agendar cita pública (sin autenticación)
 * @access  Public
 */
router.post(
  '/',
  validate(agendarCitaPublicaSchema),
  agendarCitaPublica
);

export default router;