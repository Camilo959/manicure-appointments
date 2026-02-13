import type { Request, Response, NextFunction } from 'express';
import { CitaService } from './cita.service';
import { CitaRepository } from './cita.repository';

const repository = new CitaRepository();
const service = new CitaService(repository);

/**
 * 📌 POST /api/citas
 * Endpoint público para agendar cita
 */
export const agendarCitaPublica = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const citaCreada = await service.agendarCitaPublica(req.body);

    res.status(201).json({
      success: true,
      message: 'Cita agendada exitosamente',
      data: citaCreada,
    });
  } catch (error) {
    // Los errores personalizados son manejados por el middleware global
    next(error);
  }
};