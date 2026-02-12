/**
 * Errores personalizados para el módulo de trabajadoras
 */

export class TrabajadoraError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'TrabajadoraError';
  }
}

export class TrabajadoraNotFoundError extends TrabajadoraError {
  constructor(id: string) {
    super(`Trabajadora con ID ${id} no encontrada`, 404, 'TRABAJADORA_NOT_FOUND');
  }
}

export class TrabajadoraEmailDuplicateError extends TrabajadoraError {
  constructor(email: string) {
    super(`Ya existe una trabajadora con el email ${email}`, 409, 'EMAIL_DUPLICATE');
  }
}

export class TrabajadoraInactiveError extends TrabajadoraError {
  constructor() {
    super('No se puede activar una trabajadora sin usuario activo', 400, 'USER_INACTIVE');
  }
}

export class TrabajadoraWithAppointmentsError extends TrabajadoraError {
  constructor() {
    super(
      'No se puede desactivar la trabajadora porque tiene citas agendadas. Cancele o reasigne las citas primero.',
      400,
      'HAS_APPOINTMENTS'
    );
  }
}

export class LastActiveTrabajadoraError extends TrabajadoraError {
  constructor() {
    super(
      'No se puede desactivar la única trabajadora activa del sistema',
      400,
      'LAST_ACTIVE_TRABAJADORA'
    );
  }
}