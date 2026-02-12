import type { Trabajadora, User } from '../../../generated/prisma/client';

/**
 * DTOs (Data Transfer Objects)
 */

export interface TrabajadoraWithUser extends Trabajadora {
  user: {
    id: string;
    email: string;
    activo: boolean;
    createdAt: Date;
  };
}

export interface TrabajadoraDTO {
  id: string;
  nombre: string;
  activa: boolean;
  userId: string;
  email: string;
  userActivo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrabajadoraListDTO {
  id: string;
  nombre: string;
  activa: boolean;
  email: string;
  citasActivas?: number;
  createdAt: Date;
}

export interface TrabajadoraDetailsDTO extends TrabajadoraDTO {
  tieneCitasAgendadas: boolean;
  ultimaActualizacion: Date;
}

/**
 * Input types para operaciones
 */

export interface CreateTrabajadoraData {
  nombre: string;
  email: string;
  password: string;
}

export interface UpdateTrabajadoraData {
  nombre?: string;
  email?: string;
  password?: string;
}

/**
 * Response types
 */

export interface TrabajadoraResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TrabajadoraListResponse {
  success: boolean;
  message: string;
  data: {
    trabajadoras: TrabajadoraListDTO[];
    total: number;
    activas: number;
  };
}