import { User } from '../../../generated/prisma/client';
import prisma from '../../config/prisma';

type RolStaff = 'ADMIN' | 'TRABAJADORA';

export interface CrearUsuarioStaffData {
  nombre: string;
  email: string;
  password: string;
  rol: RolStaff;
}

export interface CrearUsuarioStaffResult {
  user: User;
  trabajadoraId?: string;
}

export class UsuarioRepository {
  async buscarUsuarioPorEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async crearUsuarioStaff(data: CrearUsuarioStaffData): Promise<CrearUsuarioStaffResult> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          nombre: data.nombre,
          email: data.email,
          password: data.password,
          rol: data.rol,
          activo: true,
        },
      });

      if (data.rol === 'TRABAJADORA') {
        const trabajadora = await tx.trabajadora.create({
          data: {
            nombre: data.nombre,
            userId: user.id,
            activa: true,
          },
        });

        return {
          user,
          trabajadoraId: trabajadora.id,
        };
      }

      return { user };
    });
  }
}