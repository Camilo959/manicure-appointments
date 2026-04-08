import type { Request, Response, NextFunction } from 'express';
import { CitaRepository } from '../modules/citas/cita.repository';
import { CitaRateLimitService } from '../modules/citas/cita.rate-limit.service';
import type { AgendarCitaPublicaInput } from '../modules/citas/cita.types';

const repository = new CitaRepository();
const rateLimitService = new CitaRateLimitService(repository);

function obtenerIpCliente(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export const aplicarRateLimitAgendarCita = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body as AgendarCitaPublicaInput;

    await rateLimitService.validarIntentoAgendamiento(
      {
        telefono: body.telefono,
        fecha: body.fecha,
        horaInicio: body.horaInicio,
        trabajadoraId: body.trabajadoraId,
      },
      obtenerIpCliente(req)
    );

    next();
  } catch (error) {
    next(error);
  }
};
