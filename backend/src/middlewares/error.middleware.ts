/**
 * Middleware global de manejo de errores
 * 
 * Captura todos los errores lanzados en la aplicación
 * y retorna respuestas HTTP apropiadas
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { CitaError } from '../modules/citas/cita.errors';
import { TrabajadoraError } from '../modules/trabajadoras/trabajadora.errors';

/**
 * Clase base para errores de la aplicación
 */
export class AppError extends Error {
	constructor(
		public message: string,
		public statusCode: number = 500,
		public code?: string
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Errores específicos de negocio
 */
export class NotFoundError extends AppError {
	constructor(message: string = 'Recurso no encontrado') {
		super(message, 404, 'NOT_FOUND');
	}
}

export class ConflictError extends AppError {
	constructor(message: string = 'El recurso ya existe') {
		super(message, 409, 'CONFLICT');
	}
}

export class BadRequestError extends AppError {
	constructor(message: string = 'Petición inválida') {
		super(message, 400, 'BAD_REQUEST');
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string = 'No autorizado') {
		super(message, 401, 'UNAUTHORIZED');
	}
}

export class ForbiddenError extends AppError {
	constructor(message: string = 'Acceso prohibido') {
		super(message, 403, 'FORBIDDEN');
	}
}

/**
 * Middleware de manejo de errores
 * 
 * IMPORTANTE: Debe ser el último middleware en app.ts
 */
export function errorHandler(
	error: Error | AppError,
	req: Request,
	res: Response,
	next: NextFunction
): void {
	// Log del error
	console.error('❌ Error capturado:', {
		name: error.name,
		message: error.message,
		stack: config.nodeEnv === 'development' ? error.stack : undefined,
		path: req.path,
		method: req.method,
	});

	// Error de la aplicación (controlado)
	if (error instanceof AppError) {
		res.status(error.statusCode).json({
			success: false,
			message: error.message,
			error: error.code,
			...(config.nodeEnv === 'development' && { stack: error.stack }),
		});
		return;
	}

	// Errores de Citas
	if (error instanceof CitaError) {
		res.status(error.statusCode).json({
			success: false,
			message: error.message,
			error: error.code,
			...(config.nodeEnv === 'development' && { stack: error.stack }),
		});
		return;
	}

	// Errores de Trabajadoras
	if (error instanceof TrabajadoraError) {
		res.status(error.statusCode).json({
			success: false,
			message: error.message,
			error: error.code,
			...(config.nodeEnv === 'development' && { stack: error.stack }),
		});
		return;
	}

	// Errores de Prisma
	if (error.name === 'PrismaClientKnownRequestError') {
		const prismaError = error as any;

		// Violación de constraint único
		if (prismaError.code === 'P2002') {
			res.status(409).json({
				success: false,
				message: 'El recurso ya existe',
				error: 'DUPLICATE_ENTRY',
			});
			return;
		}

		// Registro no encontrado
		if (prismaError.code === 'P2025') {
			res.status(404).json({
				success: false,
				message: 'Recurso no encontrado',
				error: 'NOT_FOUND',
			});
			return;
		}

		// Timeout de transacción
		if (prismaError.code === 'P2024') {
			res.status(408).json({
				success: false,
				message: 'La operación tomó demasiado tiempo. Intente nuevamente.',
				error: 'TRANSACTION_TIMEOUT',
			});
			return;
		}

		// Serialization failure (race condition detectada)
		if (prismaError.code === 'P2034') {
			res.status(409).json({
				success: false,
				message: 'Otro usuario modificó los datos simultáneamente. Intente nuevamente.',
				error: 'CONFLICT',
			});
			return;
		}
	}

	// Error genérico (mapear a errores específicos)
	const errorMessage = error.message.toLowerCase();

	// 404 - Not Found
	if (errorMessage.includes('no encontrado') || errorMessage.includes('not found')) {
		res.status(404).json({
			success: false,
			message: error.message,
			error: 'NOT_FOUND',
		});
		return;
	}

	// 409 - Conflict
	if (errorMessage.includes('ya existe') || errorMessage.includes('duplicado')) {
		res.status(409).json({
			success: false,
			message: error.message,
			error: 'CONFLICT',
		});
		return;
	}

	// 400 - Bad Request
	if (errorMessage.includes('inválido') || errorMessage.includes('invalid')) {
		res.status(400).json({
			success: false,
			message: error.message,
			error: 'BAD_REQUEST',
		});
		return;
	}

	// Error 500 - Internal Server Error (por defecto)
	res.status(500).json({
		success: false,
		message: 'Error interno del servidor',
		error: 'INTERNAL_SERVER_ERROR',
		...(config.nodeEnv === 'development' && {
			originalMessage: error.message,
			stack: error.stack
		}),
	});
}