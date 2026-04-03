export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class CredencialesInvalidasError extends AuthError {
  constructor() {
    super('Email o contraseña incorrectos', 401, 'INVALID_CREDENTIALS');
  }
}

export class EmailYaRegistradoError extends AuthError {
  constructor() {
    super('El email ya está registrado', 409, 'EMAIL_ALREADY_EXISTS');
  }
}

export class UsuarioNoEncontradoError extends AuthError {
  constructor() {
    super('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }
}

export class UsuarioInactivoError extends AuthError {
  constructor() {
    super('Usuario inactivo', 403, 'USER_INACTIVE');
  }
}