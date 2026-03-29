export class ServicioError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ServicioError';
  }
}

export class ServicioNoEncontradoError extends ServicioError {
  constructor() {
    super('Servicio no encontrado', 404, 'SERVICIO_NO_ENCONTRADO');
  }
}

export class NombreDuplicadoError extends ServicioError {
  constructor() {
    super('Ya existe un servicio con ese nombre', 409, 'NOMBRE_DUPLICADO');
  }
}

export class UnicoServicioActivoError extends ServicioError {
  constructor() {
    super('No se puede desactivar el único servicio activo', 400, 'UNICO_SERVICIO_ACTIVO');
  }
}

export class ServicioConCitasFuturasError extends ServicioError {
  constructor() {
    super(
      'No se puede desactivar un servicio con citas futuras pendientes o confirmadas',
      409,
      'SERVICIO_CON_CITAS_FUTURAS'
    );
  }
}
