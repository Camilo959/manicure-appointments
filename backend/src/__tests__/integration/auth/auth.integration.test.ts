import request from 'supertest';
import app from '../../../app';

describe('Auth Integration Tests', () => {
    it('should create a new user and return a token', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Test User',
                email: 'test@example.com',
                password: 'Password123'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
    });

    it('should log in an existing user and return a token', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                nombre: 'Test User',
                email: 'test@example.com',
                password: 'Password123'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });
});