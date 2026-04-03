import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { crearUsuarioStaff } from './usuario.controller';
import { crearUsuarioStaffSchema } from './usuario.validation';

const router = Router();

/**
 * @route   POST /api/usuarios
 * @desc    Crear usuario de staff (ADMIN o TRABAJADORA)
 * @access  Private - Solo ADMIN
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(crearUsuarioStaffSchema),
  crearUsuarioStaff
);

export default router;