/**
 * Configuración centralizada de variables de entorno
 * 
 * Este archivo carga y valida todas las variables de entorno
 * necesarias para la aplicación.
 */

import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Validar que una variable de entorno exista
 */
function getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;

    if (!value) {
        throw new Error(`❌ Variable de entorno ${key} no está definida`);
    }

    return value;
}

/**
 * Configuración de la aplicación
 */
export const config = {
    // Entorno
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    port: parseInt(getEnvVar('PORT', '3000'), 10),

    // Base de datos
    databaseUrl: getEnvVar('DATABASE_URL'),

    // JWT
    jwt: {
        secret: getEnvVar('JWT_SECRET'),
        expiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
    },

    // Bcrypt
    bcrypt: {
        saltRounds: parseInt(getEnvVar('BCRYPT_SALT_ROUNDS', '10'), 10),
    },

    // Resend (para futuro)
    resend: {
        apiKey: process.env.RESEND_API_KEY || '',
        fromEmail: process.env.RESEND_FROM_EMAIL || '',
    },
} as const;

/**
 * Validar configuración al inicio
 */
export function validateConfig(): void {
    console.log('🔍 Validando configuración...');

    // Validar JWT secret en producción
    if (config.nodeEnv === 'production' && config.jwt.secret.length < 32) {
        throw new Error('❌ JWT_SECRET debe tener al menos 32 caracteres en producción');
    }

    console.log('✅ Configuración validada correctamente');
    console.log(`📝 Entorno: ${config.nodeEnv}`);
    console.log(`🚪 Puerto: ${config.port}`);
}

export default config;