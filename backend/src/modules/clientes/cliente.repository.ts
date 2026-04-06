import prisma from '../../config/prisma';
import type { Cliente, Prisma, User } from '../../../generated/prisma/client';

export interface RegistrarClienteCuentaData {
  nombre: string;
  telefono: string;
  email: string;
  password: string;
}

export interface RegistrarClienteCuentaResult {
  user: User;
  cliente: Cliente;
}

const citasClienteInclude = {
  trabajadora: {
    select: {
      id: true,
      nombre: true,
    },
  },
  citaServicios: {
    include: {
      servicio: {
        select: {
          id: true,
          nombre: true,
          duracionMinutos: true,
          precio: true,
        },
      },
    },
  },
} as const;

export type CitaClienteConRelaciones = Prisma.CitaGetPayload<{
  include: typeof citasClienteInclude;
}>;

export class ClienteRepository {
  async buscarUsuarioPorEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async buscarClientePorTelefono(telefono: string): Promise<Cliente | null> {
    return prisma.cliente.findUnique({
      where: { telefono },
    });
  }

  async buscarUsuarioClientePorId(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        cliente: true,
      },
    });
  }

  async crearCuentaCliente(
    data: RegistrarClienteCuentaData,
    clienteExistenteId?: string
  ): Promise<RegistrarClienteCuentaResult> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          nombre: data.nombre,
          email: data.email,
          password: data.password,
          rol: 'CLIENTE',
          activo: true,
        },
      });

      const cliente = clienteExistenteId
        ? await tx.cliente.update({
            where: { id: clienteExistenteId },
            data: {
              nombre: data.nombre,
              telefono: data.telefono,
              email: data.email,
              userId: user.id,
            },
          })
        : await tx.cliente.create({
            data: {
              nombre: data.nombre,
              telefono: data.telefono,
              email: data.email,
              userId: user.id,
            },
          });

      return { user, cliente };
    });
  }

  async listarCitasCliente(clienteId: string): Promise<CitaClienteConRelaciones[]> {
    return prisma.cita.findMany({
      where: { clienteId },
      include: citasClienteInclude,
      orderBy: {
        fechaInicio: 'desc',
      },
    });
  }
}
