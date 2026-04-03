export class UsuarioError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'UsuarioError';
  }
}

export class UsuarioEmailDuplicadoError extends UsuarioError {
  constructor(email: string) {
    super(
      `Ya existe un usuario con el email ${email}`,
      409,
      'USUARIO_EMAIL_DUPLICADO'
    );
  }
}