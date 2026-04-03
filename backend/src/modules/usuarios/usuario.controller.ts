import type { NextFunction, Request, Response } from 'express';
import { UsuarioRepository } from './usuario.repository';
import { UsuarioService } from './usuario.service';

const repository = new UsuarioRepository();
const service = new UsuarioService(repository);

export const crearUsuarioStaff = async (
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