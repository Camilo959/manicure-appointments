import request from 'supertest';
import app from '../../../app';
import prisma from '../../../config/prisma';
import { generateToken } from '../../../utils/token.utils';

describe('Contrato disponibilidad -> agendamiento', () => {
  const obtenerFechaFutura = (dias: number): string => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);

    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  };

  test('si un slot aparece en disponibilidad se puede reservar y luego desaparece', async () => {
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
        nombre: `Manicure Contrato ${unique}`,
        duracionMinutos: 45,
        precio: 15000,
        activo: true,
      },
    });

    const fecha = obtenerFechaFutura(2);
    const token = generateToken({ userId: user.id, rol: 'TRABAJADORA' });

    const disponibilidadInicial = await request(app)
      .get('/api/disponibilidad')
      .set('Authorization', `Bearer ${token}`)
      .query({
        fecha,
        trabajadoraId: trabajadora.id,
        serviciosIds: [servicio.id],
      })
      .expect(200);

    expect(disponibilidadInicial.body.success).toBe(true);
    const slotsIniciales = disponibilidadInicial.body.data?.slotsDisponibles as Array<{ inicio: string; fin: string }>;
    expect(Array.isArray(slotsIniciales)).toBe(true);
    expect(slotsIniciales.length).toBeGreaterThan(0);

    const slotSeleccionado = slotsIniciales[0];
    const fechaSlot = new Date(slotSeleccionado.inicio);
    const fechaReserva = `${fechaSlot.getFullYear()}-${String(fechaSlot.getMonth() + 1).padStart(2, '0')}-${String(fechaSlot.getDate()).padStart(2, '0')}`;
    const horaReserva = `${String(fechaSlot.getHours()).padStart(2, '0')}:${String(fechaSlot.getMinutes()).padStart(2, '0')}`;

    const crearCita = await request(app)
      .post('/api/citas')
      .send({
        nombreCliente: 'Cliente Contrato',
        telefono: `+57300${String(unique).slice(-7)}`,
        email: 'cliente.contrato@example.com',
        trabajadoraId: trabajadora.id,
        fecha: fechaReserva,
        horaInicio: horaReserva,
        serviciosIds: [servicio.id],
      })
      .expect(201);

    expect(crearCita.body).toMatchObject({
      success: true,
      message: 'Cita agendada exitosamente',
    });
    expect(crearCita.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        trabajadora: expect.objectContaining({ id: trabajadora.id }),
        servicios: expect.arrayContaining([
          expect.objectContaining({ id: servicio.id }),
        ]),
      })
    );

    const disponibilidadPosterior = await request(app)
      .get('/api/disponibilidad')
      .set('Authorization', `Bearer ${token}`)
      .query({
        fecha,
        trabajadoraId: trabajadora.id,
        serviciosIds: [servicio.id],
      })
      .expect(200);

    const inicioSlotReservado = new Date(slotSeleccionado.inicio).getTime();
    const slotsPosteriores = disponibilidadPosterior.body.data?.slotsDisponibles as Array<{ inicio: string; fin: string }>;

    const sigueDisponible = slotsPosteriores.some(
      (slot) => new Date(slot.inicio).getTime() === inicioSlotReservado
    );

    expect(sigueDisponible).toBe(false);
  });
});
