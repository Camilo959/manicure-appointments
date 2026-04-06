export class ClienteError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ClienteError';
  }
}

export class ClienteEmailDuplicadoError extends ClienteError {
  constructor(email: string) {
    super(
      `Ya existe un usuario con el email ${email}`,
      409,
      'CLIENTE_EMAIL_DUPLICADO'
    );
  }
}

export class ClienteCuentaYaExisteError extends ClienteError {
  constructor(telefono: string) {
    super(
      `El cliente con teléfono ${telefono} ya tiene una cuenta asociada`,
      409,
      'CLIENTE_CUENTA_YA_EXISTE'
    );
  }
}

export class ClienteNoEncontradoError extends ClienteError {
  constructor() {
    super('No se encontró el perfil del cliente autenticado', 404, 'CLIENTE_NO_ENCONTRADO');
  }
}
