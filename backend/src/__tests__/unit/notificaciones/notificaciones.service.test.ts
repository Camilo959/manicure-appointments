import { NotificacionesService } from '../../../modules/notificaciones/notificaciones.service';
import type { EmailProvider } from '../../../modules/notificaciones/notificaciones.types';

const mockSend = jest.fn();

describe('NotificacionesService', () => {
	let notificacionesService: NotificacionesService;

	beforeEach(() => {
		jest.clearAllMocks();
		const emailProvider: EmailProvider = {
			send: mockSend,
		};
		notificacionesService = new NotificacionesService(emailProvider);
	});

	test('deberia enviar email de cita creada usando Resend', async () => {
		mockSend.mockResolvedValue({ id: 'msg_123' });

		const result = await notificacionesService.enviarCitaCreada({
			destinatario: 'test@example.com',
			nombreDestinatario: 'Cliente Test',
			numeroConfirmacion: 'ABC123',
			nombreTrabajadora: 'Ana',
			fecha: new Date('2099-10-01T10:00:00.000Z'),
			servicios: [{ nombre: 'Manicure', duracion: 45, precio: 15000 }],
			duracionTotal: 45,
			precioTotal: 15000,
			tokenCancelacion: 'token_test',
		});

		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({
				to: 'test@example.com',
				subject: expect.stringContaining('ABC123'),
			})
		);
		expect(result).toMatchObject({
			exito: true,
			idMensaje: 'msg_123',
		});
	});

	test('deberia fallar con email invalido sin intentar enviar', async () => {
		const result = await notificacionesService.enviarCitaCreada({
			destinatario: 'correo-invalido',
			nombreDestinatario: 'Cliente Test',
			numeroConfirmacion: 'ABC123',
			nombreTrabajadora: 'Ana',
			fecha: new Date('2099-10-01T10:00:00.000Z'),
			servicios: [{ nombre: 'Manicure', duracion: 45, precio: 15000 }],
			duracionTotal: 45,
			precioTotal: 15000,
			tokenCancelacion: 'token_test',
		});

		expect(mockSend).not.toHaveBeenCalled();
		expect(result).toMatchObject({ exito: false, error: 'Email del destinatario no válido' });
	});
});