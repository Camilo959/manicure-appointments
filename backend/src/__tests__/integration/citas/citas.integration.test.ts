import request from 'supertest';
import app from '../../../app'; // Ajusta si app no es default export
import prisma from '../../../config/prisma';

test('should create a new appointment', async () => {
    const unique = Date.now();

    const user = await prisma.user.create({
        data: {
            nombre: 'Trabajadora User',
            email: `trabajadora.test.${unique}@example.com`,
            password: 'hashedPassword',
            rol: 'TRABAJADORA',
            activo: true,
        },
    });

    const trabajadora = await prisma.trabajadora.create({
        data: {
            nombre: 'Ana Test',
            activa: true,
            userId: user.id,
        },
    });

    const servicio = await prisma.servicio.create({
        data: {
            nombre: 'Manicure Test',
            duracionMinutos: 45,
            precio: 15000,
            activo: true,
        },
    });

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fecha = manana.toISOString().split('T')[0];

    const response = await request(app)
        .post('/api/citas') // Adjust the endpoint as necessary
        .send({
            nombreCliente: 'Cliente Test',
            telefono: '+56912345678',
            email: 'cliente.test@example.com',
            trabajadoraId: trabajadora.id,
            fecha,
            horaInicio: '10:00',
            serviciosIds: [servicio.id],
        })
        .expect(201);

    expect(response.body).toMatchObject({
        success: true,
        message: 'Cita agendada exitosamente',
    });
    expect(response.body.data).toEqual(
        expect.objectContaining({
            id: expect.any(String),
            trabajadora: expect.objectContaining({
                id: trabajadora.id,
            }),
            cliente: expect.objectContaining({
                nombre: 'Cliente Test',
                telefono: '+56912345678',
            }),
            servicios: expect.arrayContaining([
                expect.objectContaining({
                    id: servicio.id,
                    nombre: 'Manicure Test',
                }),
            ]),
        })
    );
});