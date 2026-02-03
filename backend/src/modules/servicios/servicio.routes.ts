import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  crearServicio,
  listarServicios,
  obtenerServicioPorId,
  actualizarServicio,
  cambiarEstadoServicio,
} from './servicio.controller';
import {
  crearServicioSchema,
  actualizarServicioSchema,
  cambiarEstadoServicioSchema,
  obtenerServicioPorIdSchema,
} from './servicio.validation';

const router = Router();

/**
 * @route   POST /api/servicios
 * @desc    Crear un nuevo servicio
 * @access  Private - Solo ADMIN
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(crearServicioSchema),
  crearServicio
);

/**
 * @route   GET /api/servicios
 * @desc    Listar servicios (todos para ADMIN, solo activos para TRABAJADORA)
 * @access  Private - ADMIN y TRABAJADORA
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('ADMIN', 'TRABAJADORA'),
  listarServicios
);

/**
 * @route   GET /api/servicios/:id
 * @desc    Obtener un servicio por ID
 * @access  Private - Solo ADMIN
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(obtenerServicioPorIdSchema),
  obtenerServicioPorId
);

/**
 * @route   PUT /api/servicios/:id
 * @desc    Actualizar un servicio
 * @access  Private - Solo ADMIN
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(actualizarServicioSchema),
  actualizarServicio
);

/**
 * @route   PATCH /api/servicios/:id/estado
 * @desc    Activar o desactivar un servicio
 * @access  Private - Solo ADMIN
 */
router.patch(
  '/:id/estado',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(cambiarEstadoServicioSchema),
  cambiarEstadoServicio
);

export default router;