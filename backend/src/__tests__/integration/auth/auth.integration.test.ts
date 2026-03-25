import request from 'supertest';
import app from '../../../app';

describe('Auth Integration Tests', () => {
    it('should create a new user and return a token', async () => {
        const unique = Date.now();

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Test User',
                email: `test.${unique}@example.com`,
                password: 'Password123',
                rol: 'TRABAJADORA',
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
                }),
            })
        );
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
                rol: 'TRABAJADORA',
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
});