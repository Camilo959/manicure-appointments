import express from 'express';
import cors from 'cors';

import { errorMiddleware } from './middlewares/error.middleware';

// Rutas
import authRoutes from './modules/auth/auth.routes';
import servicioRoutes from './modules/servicios/servicio.routes';
import disponibilidadRoutes from './modules/citas/disponibilidad.routes';
import trabajadoraRoutes from './modules/trabajadoras/trabajadora.routes';

export const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/trabajadoras', trabajadoraRoutes);
app.use('/api/citas', disponibilidadRoutes);


// Middleware de errores (SIEMPRE al final)
app.use(errorMiddleware);
