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