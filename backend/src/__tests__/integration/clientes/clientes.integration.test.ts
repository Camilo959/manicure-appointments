import request from 'supertest';
import app from '../../../app';
import prisma from '../../../config/prisma';
import { generateToken } from '../../../utils/token.utils';

describe('Clientes Integration Tests', () => {
  it('should register cliente account and link existing cliente by telefono', async () => {
    const unique = Date.now();
    const telefono = `3${String(unique).slice(-9)}`;

    const clienteExistente = await prisma.cliente.create({
      data: {
        nombre: 'Cliente Legacy',
        telefono,
      },
    });

    const response = await request(app)
      .post('/api/clientes/register')
      .send({
        nombre: 'Cliente Con Cuenta',
        telefono,
        email: `cliente.${unique}@example.com`,
        password: 'Password123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      cliente: expect.objectContaining({
        id: clienteExistente.id,
        telefono,
      }),
      user: expect.objectContaining({
        rol: 'CLIENTE',
      }),
    });

    const user = await prisma.user.findUnique({
      where: { email: `cliente.${unique}@example.com` },
    });

    expect(user).toBeTruthy();

    if (!user) {
      throw new Error('No se creó el usuario del cliente');
    }

    const clienteActualizado = await prisma.cliente.findUnique({
      where: { id: clienteExistente.id },
    });

    expect(clienteActualizado?.userId).toBe(user.id);
    expect(clienteActualizado?.nombre).toBe('Cliente Con Cuenta');
  });

  it('should return authenticated cliente profile', async () => {
    const unique = Date.now();
    const email = `perfil.cliente.${unique}@example.com`;

    const user = await prisma.user.create({
      data: {
        nombre: 'Cliente Perfil',
        email,
        password: 'hashed-password',
        rol: 'CLIENTE',
        activo: true,
      },
    });

    const cliente = await prisma.cliente.create({
      data: {
        nombre: 'Cliente Perfil',
        telefono: `3${String(unique).slice(-9)}`,
        email,
        userId: user.id,
      },
    });

    const token = generateToken({ userId: user.id, rol: 'CLIENTE' });

    const response = await request(app)
      .get('/api/clientes/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: cliente.id,
        email,
        user: expect.objectContaining({
          id: user.id,
          rol: 'CLIENTE',
        }),
      })
    );
  });

  it('should return only authenticated cliente citas', async () => {
    const unique = Date.now();

    const clienteUser = await prisma.user.create({
      data: {
        nombre: 'Cliente Citas',
        email: `citas.cliente.${unique}@example.com`,
        password: 'hashed-password',
        rol: 'CLIENTE',
        activo: true,
      },
    });

    const cliente = await prisma.cliente.create({
      data: {
        nombre: 'Cliente Citas',
        telefono: `3${String(unique).slice(-9)}`,
        email: clienteUser.email,
        userId: clienteUser.id,
      },
    });

    const otroCliente = await prisma.cliente.create({
      data: {
        nombre: 'Otro Cliente',
        telefono: `3${String(unique - 1).slice(-9)}`,
      },
    });

    const userTrabajadora = await prisma.user.create({
      data: {
        nombre: 'Trabajadora Citas',
        email: `trab.citas.${unique}@example.com`,
        password: 'hashed-password',
        rol: 'TRABAJADORA',
        activo: true,
      },
    });

    const trabajadora = await prisma.trabajadora.create({
      data: {
        nombre: 'Trabajadora Citas',
        userId: userTrabajadora.id,
        activa: true,
      },
    });

    const servicio = await prisma.servicio.create({
      data: {
        nombre: 'Manicure Básico',
        duracionMinutos: 60,
        precio: 50000,
        activo: true,
      },
    });

    const fechaInicio = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);

    const citaCliente = await prisma.cita.create({
      data: {
        clienteId: cliente.id,
        trabajadoraId: trabajadora.id,
        fechaInicio,
        fechaFin,
        duracionTotal: 60,
        precioTotal: 50000,
        numeroConfirmacion: `CONF-${unique}`,
      },
    });

    await prisma.citaServicio.create({
      data: {
        citaId: citaCliente.id,
        servicioId: servicio.id,
        precioUnitario: 50000,
      },
    });

    const citaOtroCliente = await prisma.cita.create({
      data: {
        clienteId: otroCliente.id,
        trabajadoraId: trabajadora.id,
        fechaInicio: new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000),
        fechaFin: new Date(fechaFin.getTime() + 2 * 60 * 60 * 1000),
        duracionTotal: 60,
        precioTotal: 50000,
        numeroConfirmacion: `CONF-OTHER-${unique}`,
      },
    });

    await prisma.citaServicio.create({
      data: {
        citaId: citaOtroCliente.id,
        servicioId: servicio.id,
        precioUnitario: 50000,
      },
    });

    const token = generateToken({ userId: clienteUser.id, rol: 'CLIENTE' });

    const response = await request(app)
      .get('/api/clientes/me/citas')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      clienteId: cliente.id,
      total: 1,
    });
    expect(response.body.data.citas).toHaveLength(1);
    expect(response.body.data.citas[0]).toEqual(
      expect.objectContaining({
        id: citaCliente.id,
        numeroConfirmacion: `CONF-${unique}`,
      })
    );
  });

  it('should forbid staff token on cliente endpoints', async () => {
    const adminToken = generateToken({ userId: `seed-admin-${Date.now()}`, rol: 'ADMIN' });

    const response = await request(app)
      .get('/api/clientes/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      error: 'FORBIDDEN',
    });
  });
});
