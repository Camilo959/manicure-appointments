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

/**
 * Contrato compartido para reglas horarias de agenda.
 * Es la fuente de verdad para disponibilidad y agendamiento.
 */
export interface ConfiguracionHorariaAgenda {
  horaApertura: string; // HH:mm
  horaCierre: string; // HH:mm
  duracionMaximaCitaMinutos: number;
  intervaloSlotsMinutos: number;
  maxDiasAnticipacion: number;
  zonaHoraria: string;
}

export const CONFIGURACION_HORARIA_FALLBACK: ConfiguracionHorariaAgenda = Object.freeze({
  horaApertura: '08:00',
  horaCierre: '19:00',
  duracionMaximaCitaMinutos: 180,
  intervaloSlotsMinutos: 15,
  maxDiasAnticipacion: 90,
  zonaHoraria: 'America/Bogota',
});

/**
 * Normaliza hora recibida desde SQL/Prisma al formato HH:mm.
 */
export function normalizarHoraHHmm(valor: unknown): string {
  if (typeof valor === 'string') {
    const match = valor.match(/^(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
  }

  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    const horas = String(valor.getUTCHours()).padStart(2, '0');
    const minutos = String(valor.getUTCMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  throw new Error('Formato de hora inválido en ConfiguracionHoraria');
}