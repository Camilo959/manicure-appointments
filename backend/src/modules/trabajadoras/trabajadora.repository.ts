import prisma from '../../config/prisma';
import type { CrearTrabajadoraInput, ActualizarTrabajadoraInput } from './trabajadora.validation';

/**
 * Repositorio para operaciones de base de datos de Trabajadoras
 */
export class TrabajadoraRepository {
  /**
   * Crear una nueva trabajadora (con su usuario asociado)
   */
  async crear(data: CrearTrabajadoraInput & { hashedPassword: string }) {
    const { nombre, email, hashedPassword } = data;

    // Crear usuario y trabajadora en una transacción
    return await prisma.$transaction(async (tx) => {
      // 1. Crear usuario
      const user = await tx.user.create({
        data: {
          nombre,
          email,
          password: hashedPassword,
          rol: 'TRABAJADORA',
          activo: true,
        },
      });

      // 2. Crear trabajadora vinculada al usuario
      const trabajadora = await tx.trabajadora.create({
        data: {
          nombre,
          userId: user.id,
          activa: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              activo: true,
            },
          },
        },
      });

      return trabajadora;
    });
  }

  /**
   * Buscar trabajadora por ID
   */
  async buscarPorId(id: string) {
    return await prisma.trabajadora.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            activo: true,
            createdAt: true,
          },
        },
      },
    });
  }

  /**
   * Buscar trabajadora por ID de usuario
   */
  async buscarPorUserId(userId: string) {
    return await prisma.trabajadora.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            activo: true,
          },
        },
      },
    });
  }

  /**
   * Buscar usuario por email (para evitar duplicados)
   */
  async buscarUsuarioPorEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Listar todas las trabajadoras
   */
  async listarTodas() {
    return await prisma.trabajadora.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            activo: true,
          },
        },
        _count: {
          select: {
            citas: {
              where: {
                estado: {
                  in: ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'],
                },
              },
            },
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  /**
   * Listar solo trabajadoras activas
   */
  async listarActivas() {
    return await prisma.trabajadora.findMany({
      where: {
        activa: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            activo: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  /**
   * Actualizar una trabajadora (y opcionalmente su usuario)
   */
  async actualizar(
    id: string,
    data: ActualizarTrabajadoraInput & { hashedPassword?: string }
  ) {
    const { nombre, email, hashedPassword } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Obtener trabajadora para acceder a userId
      const trabajadora = await tx.trabajadora.findUnique({
        where: { id },
      });

      if (!trabajadora) {
        throw new Error('Trabajadora no encontrada');
      }

      // 2. Actualizar usuario si hay cambios en email o password
      if (email || hashedPassword) {
        await tx.user.update({
          where: { id: trabajadora.userId },
          data: {
            ...(email && { email }),
            ...(hashedPassword && { password: hashedPassword }),
            ...(nombre && { nombre }),
          },
        });
      }

      // 3. Actualizar trabajadora si hay cambio en nombre
      if (nombre) {
        return await tx.trabajadora.update({
          where: { id },
          data: { nombre },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                activo: true,
              },
            },
          },
        });
      }

      // Si no hay cambios en nombre, retornar trabajadora con usuario actualizado
      return await tx.trabajadora.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              activo: true,
            },
          },
        },
      });
    });
  }

  /**
   * Cambiar estado de una trabajadora (y su usuario asociado)
   */
  async cambiarEstado(id: string, activa: boolean) {
    return await prisma.$transaction(async (tx) => {
      // 1. Obtener trabajadora
      const trabajadora = await tx.trabajadora.findUnique({
        where: { id },
      });

      if (!trabajadora) {
        throw new Error('Trabajadora no encontrada');
      }

      // 2. Actualizar usuario
      await tx.user.update({
        where: { id: trabajadora.userId },
        data: { activo: activa },
      });

      // 3. Actualizar trabajadora
      return await tx.trabajadora.update({
        where: { id },
        data: { activa },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              activo: true,
            },
          },
        },
      });
    });
  }

  /**
   * Contar trabajadoras activas
   */
  async contarActivas() {
    return await prisma.trabajadora.count({
      where: { activa: true },
    });
  }

  /**
   * Verificar si una trabajadora tiene citas agendadas
   */
  async tieneCitasAgendadas(id: string) {
    const count = await prisma.cita.count({
      where: {
        trabajadoraId: id,
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'],
        },
      },
    });
    return count > 0;
  }
}