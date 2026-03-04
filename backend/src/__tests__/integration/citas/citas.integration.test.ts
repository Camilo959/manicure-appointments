import request from 'supertest';
import app from '../../../app'; // Ajusta si app no es default export

test('should create a new appointment', async () => {
    const response = await request(app)
        .post('/api/citas') // Adjust the endpoint as necessary
        .send({
            fecha: '2023-10-01',
            hora: '10:00',
            trabajadoraId: 1,
            clienteId: 1,
        })
        .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.fecha).toBe('2023-10-01');
    expect(response.body.hora).toBe('10:00');
});