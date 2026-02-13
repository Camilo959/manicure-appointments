import type { Cita, Cliente, Servicio, CitaServicio } from '../../../generated/prisma/client';

/**
 * Input para agendar cita pública
 */
export interface AgendarCitaPublicaInput {
  nombreCliente: string;
  telefono: string;
  email?: string;
  trabajadoraId: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  serviciosIds: string[];
}

/**
 * DTO de respuesta de cita creada
 */
export interface CitaCreadaDTO {
  id: string;
  numeroConfirmacion: string; // Para mostrar al cliente
  cliente: {
    nombre: string;
    telefono: string;
    email?: string;
  };
  trabajadora: {
    id: string;
    nombre: string;
  };
  servicios: {
    id: string;
    nombre: string;
    duracion: number;
    precio: number;
  }[];
  fechaInicio: Date;
  fechaFin: Date;
  duracionTotal: number;
  precioTotal: number;
  estado: string;
  tokenCancelacion: string;
  instrucciones: string; // Mensaje para el cliente
}

/**
 * Datos calculados de la cita
 */
export interface DatosCitaCalculados {
  fechaInicio: Date;
  fechaFin: Date;
  duracionTotal: number;
  precioTotal: number;
  servicios: Servicio[];
}

/**
 * Resultado de validación de disponibilidad
 */
export interface ValidacionDisponibilidad {
  disponible: boolean;
  razon?: string;
  citaConflictiva?: {
    id: string;
    horaInicio: Date;
    horaFin: Date;
  };
}

/**
 * Cliente existente o datos para crear
 */
export interface ClienteData {
  id?: string;
  nombre: string;
  telefono: string;
  email?: string;
}