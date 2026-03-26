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

export const confirmarCita = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const citaConfirmada = await service.confirmarCita(String(req.params.id));

    res.status(200).json({
      success: true,
      message: 'Cita confirmada exitosamente',
      data: citaConfirmada,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelarCita = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await service.cancelarCita(String(req.params.id), req.body?.motivo);

    res.status(200).json({
      success: true,
      message: 'Cita cancelada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const cancelarCitaPorToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await service.cancelarCitaPorToken(String(req.params.token));

    res.status(200).json({
      success: true,
      message: 'Cita cancelada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};