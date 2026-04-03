import bcrypt from 'bcryptjs';
import { UsuarioEmailDuplicadoError } from './usuario.errors';
import { UsuarioRepository } from './usuario.repository';
import type { CrearUsuarioStaffInput } from './usuario.validation';

export class UsuarioService {
  constructor(private repository: UsuarioRepository) {}

  async crear(data: CrearUsuarioStaffInput) {
    const usuarioExistente = await this.repository.buscarUsuarioPorEmail(data.email);

    if (usuarioExistente) {
      throw new UsuarioEmailDuplicadoError(data.email);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const creado = await this.repository.crearUsuarioStaff({
      ...data,
      password: hashedPassword,
    });

    return {
      message: 'Usuario de staff creado exitosamente',
      usuario: {
        id: creado.user.id,
        nombre: creado.user.nombre,
        email: creado.user.email,
        rol: creado.user.rol,
        activo: creado.user.activo,
        ...(creado.trabajadoraId && { trabajadoraId: creado.trabajadoraId }),
        createdAt: creado.user.createdAt,
      },
    };
  }
}