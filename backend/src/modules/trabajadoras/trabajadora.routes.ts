import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  crearTrabajadora,
  listarTrabajadoras,
  obtenerTrabajadoraPorId,
  actualizarTrabajadora,
  cambiarEstadoTrabajadora,
} from './trabajadora.controller';
import {
  crearTrabajadoraSchema,
  actualizarTrabajadoraSchema,
  cambiarEstadoTrabajadoraSchema,
  obtenerTrabajadoraPorIdSchema,
} from './trabajadora.validation';

const router = Router();

/**
 * @route   POST /api/trabajadoras
 * @desc    Crear una nueva trabajadora
 * @access  Private - Solo ADMIN
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(crearTrabajadoraSchema),
  crearTrabajadora
);

/**
 * @route   GET /api/trabajadoras
 * @desc    Listar trabajadoras (todas para ADMIN, solo activas para TRABAJADORA)
 * @access  Private - ADMIN y TRABAJADORA
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('ADMIN', 'TRABAJADORA'),
  listarTrabajadoras
);

/**
 * @route   GET /api/trabajadoras/:id
 * @desc    Obtener una trabajadora por ID
 * @access  Private - Solo ADMIN
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(obtenerTrabajadoraPorIdSchema),
  obtenerTrabajadoraPorId
);

/**
 * @route   PUT /api/trabajadoras/:id
 * @desc    Actualizar una trabajadora
 * @access  Private - Solo ADMIN
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(actualizarTrabajadoraSchema),
  actualizarTrabajadora
);

/**
 * @route   PATCH /api/trabajadoras/:id/estado
 * @desc    Activar o desactivar una trabajadora
 * @access  Private - Solo ADMIN
 */
router.patch(
  '/:id/estado',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(cambiarEstadoTrabajadoraSchema),
  cambiarEstadoTrabajadora
);

export default router;