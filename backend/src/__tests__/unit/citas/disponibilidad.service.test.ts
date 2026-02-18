const { calcularDisponibilidad } = require('../../../services/disponibilidad.service');

describe('calcularDisponibilidad', () => {
    test('debería retornar disponibilidad correcta para entradas válidas', () => {
        const horarios = [
            { inicio: '2023-10-01T09:00:00Z', fin: '2023-10-01T12:00:00Z' },
            { inicio: '2023-10-01T13:00:00Z', fin: '2023-10-01T17:00:00Z' }
        ];
        const resultado = calcularDisponibilidad(horarios);
        expect(resultado).toEqual(expect.arrayContaining([
            expect.objectContaining({ hora: '09:00', disponible: true }),
            expect.objectContaining({ hora: '12:00', disponible: false }),
            expect.objectContaining({ hora: '13:00', disponible: true }),
            expect.objectContaining({ hora: '17:00', disponible: false })
        ]));
    });
    
    test('debería manejar entradas vacías', () => {
        const resultado = calcularDisponibilidad([]);
        expect(resultado).toEqual([]);
    });
});