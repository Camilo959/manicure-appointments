import type { Request, Response, NextFunction } from 'express';
import { TrabajadoraService } from './trabajadora.service';
import { TrabajadoraRepository } from './trabajadora.repository';

const repository = new TrabajadoraRepository();
const service = new TrabajadoraService(repository);

/**
 * Controlador para crear una nueva trabajadora
 */
export const crearTrabajadora = async (
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
    next(error);
  }
};

/**
 * Controlador para listar trabajadoras
 */
export const listarTrabajadoras = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rol = req.user?.rol || 'TRABAJADORA';
    const result = await service.listar(rol);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener una trabajadora por ID
 */
export const obtenerTrabajadoraPorId = async (
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
    next(error);
  }
};

/**
 * Controlador para actualizar una trabajadora
 */
export const actualizarTrabajadora = async (
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
    next(error);
  }
};

/**
 * Controlador para cambiar estado de una trabajadora
 */
export const cambiarEstadoTrabajadora = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { activa } = req.body;
    const result = await service.cambiarEstado(id as string, activa);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para eliminar (soft delete) una trabajadora
 */
export const eliminarTrabajadora = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await service.cambiarEstado(id as string, false);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};