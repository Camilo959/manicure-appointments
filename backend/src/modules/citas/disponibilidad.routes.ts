import { Router } from 'express';
import { DisponibilidadController } from './disponibilidad.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const disponibilidadController = new DisponibilidadController();

/**
 * @route GET /api/citas/disponibilidad
 * @desc Consultar horarios disponibles
 * @access Privado (cualquier usuario autenticado)
 */
router.get(
  '/disponibilidad',
  authenticate,
  disponibilidadController.consultarDisponibilidad
);

export default router;