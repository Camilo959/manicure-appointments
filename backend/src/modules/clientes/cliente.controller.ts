import type { NextFunction, Request, Response } from 'express';
import { ClienteRepository } from './cliente.repository';
import { ClienteService } from './cliente.service';

const repository = new ClienteRepository();
const service = new ClienteService(repository);

export const registrarCliente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.registrarCuenta(req.body);

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerMiPerfilCliente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.obtenerMiPerfil(req.user!.userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerMisCitasCliente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.obtenerMisCitas(req.user!.userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
