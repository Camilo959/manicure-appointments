import request from 'supertest';
import app from '../../../app';
import prisma from '../../../config/prisma';
import { generateToken } from '../../../utils/token.utils';

describe('Usuarios Integration Tests', () => {
  it('should create an ADMIN user with admin token', async () => {
    const unique = Date.now();
    const email = `admin.staff.${unique}@example.com`;
    const adminToken = generateToken({ userId: `seed-admin-${unique}`, rol: 'ADMIN' });

    const response = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Admin Staff',
        email,
        password: 'Password123',
        rol: 'ADMIN',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Usuario de staff creado exitosamente',
    });
    expect(response.body.usuario).toEqual(
      expect.objectContaining({
        email,
        rol: 'ADMIN',
      })
    );

    const creado = await prisma.user.findUnique({ where: { email } });
    expect(creado).toBeTruthy();

    if (!creado) {
      throw new Error('No se creó el usuario ADMIN');
    }

    expect(creado.rol).toBe('ADMIN');

    const perfilTrabajadora = await prisma.trabajadora.findUnique({
      where: { userId: creado.id },
    });

    expect(perfilTrabajadora).toBeNull();
  });

  it('should create TRABAJADORA user and profile with admin token', async () => {
    const unique = Date.now();
    const email = `trabajadora.staff.${unique}@example.com`;
    const adminToken = generateToken({ userId: `seed-admin-${unique}`, rol: 'ADMIN' });

    const response = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Trabajadora Staff',
        email,
        password: 'Password123',
        rol: 'TRABAJADORA',
      });

    expect(response.status).toBe(201);
    expect(response.body.usuario).toEqual(
      expect.objectContaining({
        email,
        rol: 'TRABAJADORA',
        trabajadoraId: expect.any(String),
      })
    );

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBeTruthy();

    if (!user) {
      throw new Error('No se creó el usuario TRABAJADORA');
    }

    const trabajadora = await prisma.trabajadora.findUnique({
      where: { userId: user.id },
    });

    expect(trabajadora).toBeTruthy();
    expect(trabajadora?.id).toBe(response.body.usuario.trabajadoraId);
  });

  it('should forbid creating staff user with TRABAJADORA token', async () => {
    const unique = Date.now();
    const workerToken = generateToken({ userId: `seed-worker-${unique}`, rol: 'TRABAJADORA' });

    const response = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        nombre: 'Sin Permiso',
        email: `sin.permiso.${unique}@example.com`,
        password: 'Password123',
        rol: 'ADMIN',
      });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      error: 'FORBIDDEN',
    });
  });
});