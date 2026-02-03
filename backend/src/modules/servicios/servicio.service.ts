import { ServicioRepository } from './servicio.repository';
import type { CrearServicioInput, ActualizarServicioInput } from './servicio.validation';

/**
 * Servicio con la lógica de negocio para Servicios
 */
export class ServicioService {
  constructor(private repository: ServicioRepository) { }

  /**
   * Crear un nuevo servicio
   */
  async crear(data: CrearServicioInput) {
    // Validar que no exista un servicio con el mismo nombre
    const servicioExistente = await this.repository.buscarPorNombre(data.nombre);

    if (servicioExistente) {
      throw new Error('Ya existe un servicio con ese nombre');
    }

    const servicio = await this.repository.crear(data);

    return {
      message: 'Servicio creado exitosamente',
      servicio: {
        id: servicio.id,
        nombre: servicio.nombre,
        duracionMinutos: servicio.duracionMinutos,
        activo: servicio.activo,
        createdAt: servicio.createdAt,
      },
    };
  }

  /**
   * Listar servicios según el rol del usuario
   */
  async listar(rol: string) {
    let servicios;

    if (rol === 'ADMIN') {
      // Admin ve todos los servicios
      servicios = await this.repository.listarTodos();
    } else {
      // Trabajadora solo ve servicios activos
      servicios = await this.repository.listarActivos();
    }

    return {
      message: 'Servicios obtenidos exitosamente',
      servicios: servicios.map(s => ({
        id: s.id,
        nombre: s.nombre,
        duracionMinutos: s.duracionMinutos,
        activo: s.activo,
        createdAt: s.createdAt,
      })),
      total: servicios.length,
    };
  }

  /**
   * Obtener un servicio por ID
   */
  async obtenerPorId(id: string) {
    const servicio = await this.repository.buscarPorId(id);

    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }

    return {
      message: 'Servicio obtenido exitosamente',
      servicio: {
        id: servicio.id,
        nombre: servicio.nombre,
        duracionMinutos: servicio.duracionMinutos,
        activo: servicio.activo,
        createdAt: servicio.createdAt,
        updatedAt: servicio.updatedAt,
      },
    };
  }

  /**
   * Actualizar un servicio
   */
  async actualizar(id: string, data: ActualizarServicioInput) {
    // Verificar que el servicio existe
    const servicioExistente = await this.repository.buscarPorId(id);

    if (!servicioExistente) {
      throw new Error('Servicio no encontrado');
    }

    // Si se actualiza el nombre, verificar que no exista otro servicio con ese nombre
    if (data.nombre && data.nombre !== servicioExistente.nombre) {
      const nombreDuplicado = await this.repository.buscarPorNombre(data.nombre);

      if (nombreDuplicado && nombreDuplicado.id !== id) {
        throw new Error('Ya existe otro servicio con ese nombre');
      }
    }

    const servicioActualizado = await this.repository.actualizar(id, data);

    return {
      message: 'Servicio actualizado exitosamente',
      servicio: {
        id: servicioActualizado.id,
        nombre: servicioActualizado.nombre,
        duracionMinutos: servicioActualizado.duracionMinutos,
        activo: servicioActualizado.activo,
        updatedAt: servicioActualizado.updatedAt,
      },
    };
  }

  /**
   * Cambiar estado de un servicio (activar/desactivar)
   */
  async cambiarEstado(id: string, activo: boolean) {
    // Verificar que el servicio existe
    const servicio = await this.repository.buscarPorId(id);

    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }

    // Si se intenta desactivar, verificar que no sea el único servicio activo
    if (!activo && servicio.activo) {
      const cantidadActivos = await this.repository.contarActivos();

      if (cantidadActivos <= 1) {
        throw new Error('No se puede desactivar el único servicio activo');
      }
    }

    const servicioActualizado = await this.repository.cambiarEstado(id, activo);

    return {
      message: activo
        ? 'Servicio activado exitosamente'
        : 'Servicio desactivado exitosamente',
      servicio: {
        id: servicioActualizado.id,
        nombre: servicioActualizado.nombre,
        activo: servicioActualizado.activo,
        updatedAt: servicioActualizado.updatedAt,
      },
    };
  }
}