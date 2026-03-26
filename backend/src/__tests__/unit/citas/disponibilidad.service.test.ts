import { DisponibilidadService } from '../../../modules/citas/disponibilidad.service';

describe('DisponibilidadService', () => {
    const prismaMock = {
        trabajadora: { findUnique: jest.fn() },
        diaBloqueado: { findUnique: jest.fn() },
        servicio: { findMany: jest.fn() },
        cita: { findMany: jest.fn() },
    } as any;

    let service: DisponibilidadService;

    const obtenerFechaValida = (): string => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 7);

        // Evitar domingo para no gatillar validación de día bloqueado.
        if (fecha.getDay() === 0) {
            fecha.setDate(fecha.getDate() + 1);
        }

        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');
        const dd = String(fecha.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new DisponibilidadService(prismaMock);
    });

    test('deberia retornar sin slots si el dia esta bloqueado', async () => {
        const fecha = obtenerFechaValida();
        prismaMock.trabajadora.findUnique.mockResolvedValue({ id: 't1', activa: true });
        prismaMock.diaBloqueado.findUnique.mockResolvedValue({ id: 'db1' });

        const resultado = await service.consultarDisponibilidad({
            fecha,
            trabajadoraId: 't1',
            serviciosIds: ['s1'],
        });

        expect(resultado.duracionTotalMinutos).toBe(0);
        expect(resultado.slotsDisponibles).toEqual([]);
        expect(prismaMock.servicio.findMany).not.toHaveBeenCalled();
    });

    test('deberia calcular slots cuando no hay citas ocupadas', async () => {
        const fecha = obtenerFechaValida();
        prismaMock.trabajadora.findUnique.mockResolvedValue({ id: 't1', activa: true });
        prismaMock.diaBloqueado.findUnique.mockResolvedValue(null);
        prismaMock.servicio.findMany.mockResolvedValue([
            { id: 's1', activo: true, duracionMinutos: 60 },
        ]);
        prismaMock.cita.findMany.mockResolvedValue([]);

        const resultado = await service.consultarDisponibilidad({
            fecha,
            trabajadoraId: 't1',
            serviciosIds: ['s1'],
        });

        expect(resultado.duracionTotalMinutos).toBe(60);
        expect(resultado.slotsDisponibles.length).toBeGreaterThan(0);
        expect(resultado.slotsDisponibles[0]).toEqual(
            expect.objectContaining({
                inicio: expect.any(Date),
                fin: expect.any(Date),
            })
        );
    });
});