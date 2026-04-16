import { Router } from 'express';
import { DisponibilidadController } from './disponibilidad.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const disponibilidadController = new DisponibilidadController();

/**
 * @route GET /api/disponibilidad
 * @desc Consultar horarios disponibles
 * @access Privado (cualquier usuario autenticado)
 */
router.get(
  '/',
  authenticate,
  disponibilidadController.consultarDisponibilidad
);

export default router;