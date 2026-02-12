import bcrypt from 'bcryptjs';
import { TrabajadoraRepository } from './trabajadora.repository';
import type { CrearTrabajadoraInput, ActualizarTrabajadoraInput } from './trabajadora.validation';

/**
 * Servicio con la lógica de negocio para Trabajadoras
 */
export class TrabajadoraService {
  constructor(private repository: TrabajadoraRepository) {}

  /**
   * Crear una nueva trabajadora
   */
  async crear(data: CrearTrabajadoraInput) {
    // Validar que no exista un usuario con el mismo email
    const usuarioExistente = await this.repository.buscarUsuarioPorEmail(data.email);

    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con ese email');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const trabajadora = await this.repository.crear({
      ...data,
      hashedPassword,
    });

    return {
      message: 'Trabajadora creada exitosamente',
      trabajadora: {
        id: trabajadora.id,
        nombre: trabajadora.nombre,
        activa: trabajadora.activa,
        user: {
          id: trabajadora.user.id,
          email: trabajadora.user.email,
          activo: trabajadora.user.activo,
        },
        createdAt: trabajadora.createdAt,
      },
    };
  }

  /**
   * Listar trabajadoras según el rol del usuario
   */
  async listar(rol: string) {
    let trabajadoras;

    if (rol === 'ADMIN') {
      // Admin ve todas las trabajadoras con conteo de citas
      trabajadoras = await this.repository.listarTodas();
    } else {
      // Trabajadora solo ve trabajadoras activas (sin conteo)
      trabajadoras = await this.repository.listarActivas();
    }

    return {
      message: 'Trabajadoras obtenidas exitosamente',
      trabajadoras: trabajadoras.map((t) => ({
        id: t.id,
        nombre: t.nombre,
        activa: t.activa,
        email: t.user.email,
        userId: t.user.id,
        createdAt: t.createdAt,
        // Solo incluir conteo si existe (admin)
        ...('_count' in t && {
          citasActivas: (t._count as { citas?: number })?.citas || 0,
        }),
      })),
      total: trabajadoras.length,
    };
  }

  /**
   * Obtener una trabajadora por ID
   */
  async obtenerPorId(id: string) {
    const trabajadora = await this.repository.buscarPorId(id);

    if (!trabajadora) {
      throw new Error('Trabajadora no encontrada');
    }

    // Verificar si tiene citas agendadas
    const tieneCitasAgendadas = await this.repository.tieneCitasAgendadas(id);

    return {
      message: 'Trabajadora obtenida exitosamente',
      trabajadora: {
        id: trabajadora.id,
        nombre: trabajadora.nombre,
        activa: trabajadora.activa,
        user: {
          id: trabajadora.user.id,
          email: trabajadora.user.email,
          activo: trabajadora.user.activo,
          createdAt: trabajadora.user.createdAt,
        },
        tieneCitasAgendadas,
        createdAt: trabajadora.createdAt,
        updatedAt: trabajadora.updatedAt,
      },
    };
  }

  /**
   * Actualizar una trabajadora
   */
  async actualizar(id: string, data: ActualizarTrabajadoraInput) {
    // Verificar que la trabajadora existe
    const trabajadoraExistente = await this.repository.buscarPorId(id);

    if (!trabajadoraExistente) {
      throw new Error('Trabajadora no encontrada');
    }

    // Si se actualiza el email, verificar que no exista otro usuario con ese email
    if (data.email && data.email !== trabajadoraExistente.user.email) {
      const emailDuplicado = await this.repository.buscarUsuarioPorEmail(data.email);

      if (emailDuplicado && emailDuplicado.id !== trabajadoraExistente.user.id) {
        throw new Error('Ya existe otro usuario con ese email');
      }
    }

    // Hashear nueva contraseña si se proporciona
    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    const trabajadoraActualizada = await this.repository.actualizar(id, {
      nombre: data.nombre,
      email: data.email,
      hashedPassword,
    });

    return {
      message: 'Trabajadora actualizada exitosamente',
      trabajadora: {
        id: trabajadoraActualizada!.id,
        nombre: trabajadoraActualizada!.nombre,
        activa: trabajadoraActualizada!.activa,
        user: {
          id: trabajadoraActualizada!.user.id,
          email: trabajadoraActualizada!.user.email,
          activo: trabajadoraActualizada!.user.activo,
        },
        updatedAt: trabajadoraActualizada!.updatedAt,
      },
    };
  }

  /**
   * Cambiar estado de una trabajadora (activar/desactivar)
   */
  async cambiarEstado(id: string, activa: boolean) {
    // Verificar que la trabajadora existe
    const trabajadora = await this.repository.buscarPorId(id);

    if (!trabajadora) {
      throw new Error('Trabajadora no encontrada');
    }

    // Si se intenta desactivar, verificar que no sea la única trabajadora activa
    if (!activa && trabajadora.activa) {
      const cantidadActivas = await this.repository.contarActivas();

      if (cantidadActivas <= 1) {
        throw new Error('No se puede desactivar la única trabajadora activa');
      }

      // Verificar que no tenga citas agendadas
      const tieneCitas = await this.repository.tieneCitasAgendadas(id);

      if (tieneCitas) {
        throw new Error(
          'No se puede desactivar la trabajadora porque tiene citas agendadas. ' +
            'Cancele o reasigne las citas primero.'
        );
      }
    }

    const trabajadoraActualizada = await this.repository.cambiarEstado(id, activa);

    return {
      message: activa
        ? 'Trabajadora activada exitosamente'
        : 'Trabajadora desactivada exitosamente',
      trabajadora: {
        id: trabajadoraActualizada.id,
        nombre: trabajadoraActualizada.nombre,
        activa: trabajadoraActualizada.activa,
        user: {
          activo: trabajadoraActualizada.user.activo,
        },
        updatedAt: trabajadoraActualizada.updatedAt,
      },
    };
  }
}