export class CitaError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'CitaError';
  }
}

export class TrabajadoraNoDisponibleError extends CitaError {
  constructor(nombre: string) {
    super(
      `La trabajadora ${nombre} no está disponible en este momento`,
      400,
      'TRABAJADORA_NO_DISPONIBLE'
    );
  }
}

export class ServicioNoDisponibleError extends CitaError {
  constructor(nombreServicio: string) {
    super(
      `El servicio "${nombreServicio}" no está disponible`,
      400,
      'SERVICIO_NO_DISPONIBLE'
    );
  }
}

export class FechaEnPasadoError extends CitaError {
  constructor() {
    super(
      'No se pueden agendar citas en fechas pasadas',
      400,
      'FECHA_EN_PASADO'
    );
  }
}

export class FechaFueraDeRangoError extends CitaError {
  constructor(maxDiasAnticipacion: number = 90) {
    super(
      `Solo se pueden agendar citas hasta ${maxDiasAnticipacion} días en adelante`,
      400,
      'FECHA_FUERA_DE_RANGO'
    );
  }
}

export class HorarioNoDisponibleError extends CitaError {
  constructor(razon: string) {
    super(
      `Horario no disponible: ${razon}`,
      409,
      'HORARIO_NO_DISPONIBLE'
    );
  }
}

export class DiaBloqueadoError extends CitaError {
  constructor(fecha: string) {
    super(
      `El día ${fecha} está bloqueado y no se aceptan citas`,
      400,
      'DIA_BLOQUEADO'
    );
  }
}

export class SolapamientoCitaError extends CitaError {
  constructor() {
    super(
      'Ya existe una cita en ese horario. Por favor seleccione otro horario.',
      409,
      'SOLAPAMIENTO_CITA'
    );
  }
}

export class ServiciosNoEncontradosError extends CitaError {
  constructor(ids: string[]) {
    super(
      `Los siguientes servicios no fueron encontrados: ${ids.join(', ')}`,
      404,
      'SERVICIOS_NO_ENCONTRADOS'
    );
  }
}

export class DuracionInvalidaError extends CitaError {
  constructor() {
    super(
      'La duración total de los servicios excede el horario laboral',
      400,
      'DURACION_INVALIDA'
    );
  }
}

export class CitaNoEncontradaError extends CitaError {
  constructor() {
    super('Cita no encontrada', 404, 'CITA_NO_ENCONTRADA');
  }
}

export class CitaEstadoInvalidoError extends CitaError {
  constructor(estadoActual: string, accion: string, mensaje?: string) {
    super(
      mensaje || `No se puede ${accion} una cita en estado ${estadoActual}`,
      409,
      'CITA_ESTADO_INVALIDO'
    );
  }
}