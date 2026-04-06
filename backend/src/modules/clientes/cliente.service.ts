import bcrypt from 'bcryptjs';
import {
  ClienteCuentaYaExisteError,
  ClienteEmailDuplicadoError,
  ClienteNoEncontradoError,
} from './cliente.errors';
import { ClienteRepository } from './cliente.repository';
import type { RegistrarClienteInput } from './cliente.validation';

export class ClienteService {
  constructor(private repository: ClienteRepository) {}

  async registrarCuenta(data: RegistrarClienteInput) {
    const usuarioExistente = await this.repository.buscarUsuarioPorEmail(data.email);

    if (usuarioExistente) {
      throw new ClienteEmailDuplicadoError(data.email);
    }

    const clienteExistente = await this.repository.buscarClientePorTelefono(data.telefono);

    if (clienteExistente?.userId) {
      throw new ClienteCuentaYaExisteError(data.telefono);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const creado = await this.repository.crearCuentaCliente(
      {
        ...data,
        password: hashedPassword,
      },
      clienteExistente?.id
    );

    return {
      message: clienteExistente
        ? 'Cuenta de cliente creada y vinculada exitosamente'
        : 'Cuenta de cliente creada exitosamente',
      cliente: {
        id: creado.cliente.id,
        nombre: creado.cliente.nombre,
        telefono: creado.cliente.telefono,
        email: creado.cliente.email,
      },
      user: {
        id: creado.user.id,
        nombre: creado.user.nombre,
        email: creado.user.email,
        rol: creado.user.rol,
        activo: creado.user.activo,
        createdAt: creado.user.createdAt,
      },
    };
  }

  async obtenerMiPerfil(userId: string) {
    const user = await this.obtenerUsuarioCliente(userId);

    return {
      id: user.cliente!.id,
      nombre: user.cliente!.nombre,
      telefono: user.cliente!.telefono,
      email: user.cliente!.email,
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        activo: user.activo,
      },
    };
  }

  async obtenerMisCitas(userId: string) {
    const user = await this.obtenerUsuarioCliente(userId);
    const citas = await this.repository.listarCitasCliente(user.cliente!.id);

    return {
      clienteId: user.cliente!.id,
      total: citas.length,
      citas: citas.map((cita) => ({
        id: cita.id,
        numeroConfirmacion: cita.numeroConfirmacion,
        estado: cita.estado,
        fechaInicio: cita.fechaInicio,
        fechaFin: cita.fechaFin,
        duracionTotal: cita.duracionTotal,
        precioTotal: Number(cita.precioTotal),
        trabajadora: {
          id: cita.trabajadora.id,
          nombre: cita.trabajadora.nombre,
        },
        servicios: cita.citaServicios.map((citaServicio) => ({
          id: citaServicio.servicio.id,
          nombre: citaServicio.servicio.nombre,
          duracionMinutos: citaServicio.servicio.duracionMinutos,
          precio: Number(citaServicio.servicio.precio),
        })),
      })),
    };
  }

  private async obtenerUsuarioCliente(userId: string) {
    const user = await this.repository.buscarUsuarioClientePorId(userId);

    if (!user || user.rol !== 'CLIENTE' || !user.cliente) {
      throw new ClienteNoEncontradoError();
    }

    return user;
  }
}
