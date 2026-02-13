import prisma from '../../config/prisma';
import type { CrearServicioInput, ActualizarServicioInput } from './servicio.validation';

/**
 * Repositorio para operaciones de base de datos de Servicios
 */
export class ServicioRepository {
  /**
   * Crear un nuevo servicio
   */
  async crear(data: CrearServicioInput) {
    return await prisma.servicio.create({
      data: {
        nombre: data.nombre,
        duracionMinutos: data.duracionMinutos,
        precio: data.precio,
        activo: true,
      },
    });
  }

  /**
   * Buscar servicio por ID
   */
  async buscarPorId(id: string) {
    return await prisma.servicio.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar servicio por nombre (para evitar duplicados)
   */
  async buscarPorNombre(nombre: string) {
    return await prisma.servicio.findFirst({
      where: {
        nombre: {
          equals: nombre,
          mode: 'insensitive', // Case insensitive
        },
      },
    });
  }

  /**
   * Listar todos los servicios
   */
  async listarTodos() {
    return await prisma.servicio.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  /**
   * Listar solo servicios activos
   */
  async listarActivos() {
    return await prisma.servicio.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  /**
   * Actualizar un servicio
   */
  async actualizar(id: string, data: ActualizarServicioInput) {
    return await prisma.servicio.update({
      where: { id },
      data,
    });
  }

  /**
   * Cambiar estado de un servicio (soft delete)
   */
  async cambiarEstado(id: string, activo: boolean) {
    return await prisma.servicio.update({
      where: { id },
      data: { activo },
    });
  }

  /**
   * Contar servicios activos
   */
  async contarActivos() {
    return await prisma.servicio.count({
      where: { activo: true },
    });
  }

  /**
   * Verificar si un servicio está siendo usado en citas
   */
  async estaEnUso(id: string) {
    const count = await prisma.citaServicio.count({
      where: { servicioId: id },
    });
    return count > 0;
  }
}