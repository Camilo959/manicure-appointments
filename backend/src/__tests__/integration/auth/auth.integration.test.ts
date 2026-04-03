import request from 'supertest';
import app from '../../../app';
import prisma from '../../../config/prisma';
import bcrypt from 'bcryptjs';

describe('Auth Integration Tests', () => {
    it('should create a new user and return a token', async () => {
        const unique = Date.now();

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Test User',
                email: `test.${unique}@example.com`,
                password: 'Password123',
            });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            success: true,
            message: 'Usuario registrado exitosamente',
        });
        expect(response.body.data).toEqual(
            expect.objectContaining({
                token: expect.any(String),
                user: expect.objectContaining({
                    email: `test.${unique}@example.com`,
                    nombre: 'Test User',
                    rol: 'TRABAJADORA',
                }),
            })
        );
    });

    it('should force TRABAJADORA role when role is sent in payload', async () => {
        const unique = Date.now();

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Role Test User',
                email: `force-role.${unique}@example.com`,
                password: 'Password123',
                rol: 'ADMIN',
            });

        expect(response.status).toBe(201);
        expect(response.body.data.user.rol).toBe('TRABAJADORA');
    });

    it('should log in an existing user and return a token', async () => {
        const unique = Date.now();
        const email = `login.${unique}@example.com`;
        const password = 'Password123';

        await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Login User',
                email,
                password,
            })
            .expect(201);

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