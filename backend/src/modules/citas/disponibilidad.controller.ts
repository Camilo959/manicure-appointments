import { Request, Response, NextFunction } from 'express';
import { DisponibilidadService } from './disponibilidad.service';
import { consultarDisponibilidadSchema } from '../../types/disponibilidad.types';
import prisma from '../../config/prisma';

export class DisponibilidadController {
  private disponibilidadService: DisponibilidadService;

  constructor() {
    this.disponibilidadService = new DisponibilidadService(prisma);
  }

  /**
   * GET /api/citas/disponibilidad?fecha=YYYY-MM-DD&trabajadoraId=uuid&serviciosIds[]=uuid&serviciosIds[]=uuid
   */
  consultarDisponibilidad = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Parsear serviciosIds (puede venir como string o array)
      let serviciosIds = req.query.serviciosIds;
      if (typeof serviciosIds === 'string') {
        serviciosIds = [serviciosIds];
      }

      const input = consultarDisponibilidadSchema.parse({
        fecha: req.query.fecha,
        trabajadoraId: req.query.trabajadoraId,
        serviciosIds,
      });

      const disponibilidad = await this.disponibilidadService.consultarDisponibilidad(input);

      res.status(200).json({
        success: true,
        data: disponibilidad,
      });
    } catch (error) {
      next(error);
    }
  };
}