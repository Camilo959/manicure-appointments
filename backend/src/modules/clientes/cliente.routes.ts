import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireCliente } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  obtenerMiPerfilCliente,
  obtenerMisCitasCliente,
  registrarCliente,
} from './cliente.controller';
import { registrarClienteSchema } from './cliente.validation';

const router = Router();

/**
 * @route   POST /api/clientes/register
 * @desc    Crear cuenta opcional de cliente (login)
 * @access  Public
 */
router.post('/register', validate(registrarClienteSchema), registrarCliente);

/**
 * @route   GET /api/clientes/me
 * @desc    Obtener perfil del cliente autenticado
 * @access  Private - CLIENTE
 */
router.get('/me', authenticate, requireCliente, obtenerMiPerfilCliente);

/**
 * @route   GET /api/clientes/me/citas
 * @desc    Obtener historial de citas del cliente autenticado
 * @access  Private - CLIENTE
 */
router.get('/me/citas', authenticate, requireCliente, obtenerMisCitasCliente);

export default router;
