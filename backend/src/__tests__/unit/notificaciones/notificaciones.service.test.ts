const nodemailer = require('nodemailer');
const { NotificacionesService } = require('../../../notificaciones/notificaciones.service');

jest.mock('nodemailer');

describe('NotificacionesService', () => {
	let notificacionesService;

	beforeEach(() => {
		notificacionesService = new NotificacionesService();
	});

	test('should send notification without sending real emails', async () => {
		const mockSendMail = jest.fn().mockResolvedValue(true);
		nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

		const result = await notificacionesService.enviarNotificacion('test@example.com', 'Test Subject', 'Test Body');

		expect(mockSendMail).toHaveBeenCalledWith({
			to: 'test@example.com',
			subject: 'Test Subject',
			text: 'Test Body',
		});
		expect(result).toBe(true);
	});
});