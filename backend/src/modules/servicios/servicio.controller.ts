import type { Request, Response, NextFunction } from 'express';
import { ServicioService } from './servicio.service';
import { ServicioRepository } from './servicio.repository';
import { Rol } from '../../../generated/prisma/client';
import { AppError } from '../../middlewares/error.middleware';
import { ServicioError } from './servicio.errors';

const repository = new ServicioRepository();
const service = new ServicioService(repository);

function normalizarErrorServicio(error: unknown): Error {
  if (error instanceof ServicioError) {
    return new AppError(error.message, error.statusCode, error.code);
  }

  return error as Error;
}

/**
 * Controlador para crear un nuevo servicio
 */
export const crearServicio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.crear(req.body);

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(normalizarErrorServicio(error));
  }
};

/**
 * Controlador para listar servicios
 */
export const listarServicios = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rol: Rol = req.user?.rol === 'ADMIN' ? Rol.ADMIN : Rol.TRABAJADORA;
    const result = await service.listar(rol);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(normalizarErrorServicio(error));
  }
};

/**
 * Controlador para obtener un servicio por ID
 */
export const obtenerServicioPorId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await service.obtenerPorId(id as string);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(normalizarErrorServicio(error));
  }
};

/**
 * Controlador para actualizar un servicio
 */
export const actualizarServicio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await service.actualizar(id as string, req.body);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(normalizarErrorServicio(error));
  }
};

/**
 * Controlador para cambiar estado de un servicio
 */
export const cambiarEstadoServicio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    const result = await service.cambiarEstado(id as string, activo);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(normalizarErrorServicio(error));
  }
};