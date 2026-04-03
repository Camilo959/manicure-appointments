import request from 'supertest';
import app from '../../../app';
import prisma from '../../../config/prisma';
import bcrypt from 'bcryptjs';

describe('Auth Integration Tests', () => {
    it('should return 404 for removed register endpoint', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Legacy User',
                email: `legacy.${Date.now()}@example.com`,
                password: 'Password123',
            });

        expect(response.status).toBe(404);
    });

    it('should log in an existing user and return a token', async () => {
        const unique = Date.now();
        const email = `login.${unique}@example.com`;
        const password = 'Password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                nombre: 'Login User',
                email,
                password: hashedPassword,
                rol: 'TRABAJADORA',
                activo: true,
            },
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email,
                password,
            });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            success: true,
            message: 'Inicio de sesión exitoso',
        });
        expect(response.body.data).toEqual(
            expect.objectContaining({
                token: expect.any(String),
                user: expect.objectContaining({
                    email,
                    rol: 'TRABAJADORA',
                }),
            })
        );
    });

    it('should include trabajadoraId in /auth/me for TRABAJADORA with relation', async () => {
        const unique = Date.now();
        const email = `trabajadora.${unique}@example.com`;
        const password = 'Password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                nombre: 'Trabajadora Auth',
                email,
                password: hashedPassword,
                rol: 'TRABAJADORA',
                activo: true,
            },
        });

        const trabajadora = await prisma.trabajadora.create({
            data: {
                nombre: 'Trabajadora Auth',
                userId: user.id,
                activa: true,
            },
        });

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email,
                password,
            })
            .expect(200);

        const token = loginResponse.body.data.token;

        const meResponse = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(meResponse.body.data).toEqual(
            expect.objectContaining({
                id: user.id,
                email,
                rol: 'TRABAJADORA',
                trabajadoraId: trabajadora.id,
                activo: true,
            })
        );
    });
});