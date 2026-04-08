import { CitaRateLimitService } from '../../../modules/citas/cita.rate-limit.service';
import { CitaRepository } from '../../../modules/citas/cita.repository';
import {
  IpTemporalmenteBloqueadaError,
  MaximoCitasActivasPorTelefonoError,
  RateLimitExceededError,
} from '../../../modules/citas/cita.errors';

const BASE_PAYLOAD = {
  telefono: '3001234567',
  fecha: '2026-05-20',
  horaInicio: '10:00',
  trabajadoraId: '11111111-1111-1111-1111-111111111111',
};

const horaPorIndice = (index: number): string => {
  const minutos = index % 60;
  return `10:${String(minutos).padStart(2, '0')}`;
};

const telefonoPorIndice = (index: number): string => {
  const sufijo = String(100000000 + index).padStart(9, '0');
  return `3${sufijo}`;
};

describe('CitaRateLimitService', () => {
  const repositoryMock = {
    contarCitasActivasPorTelefono: jest.fn<Promise<number>, [string]>(),
  } as unknown as CitaRepository;

  let service: CitaRateLimitService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-07T10:00:00.000Z'));

    (repositoryMock.contarCitasActivasPorTelefono as jest.Mock).mockResolvedValue(0);
    service = new CitaRateLimitService(repositoryMock);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('deberia permitir hasta 20 intentos por IP en 15 minutos', async () => {
    for (let i = 0; i < 20; i++) {
      await expect(
        service.validarIntentoAgendamiento(
          {
            ...BASE_PAYLOAD,
            telefono: telefonoPorIndice(i),
            horaInicio: horaPorIndice(i),
          },
          '10.0.0.1'
        )
      ).resolves.toBeUndefined();
    }

    await expect(
      service.validarIntentoAgendamiento(
        {
          ...BASE_PAYLOAD,
          telefono: telefonoPorIndice(21),
          horaInicio: horaPorIndice(21),
        },
        '10.0.0.1'
      )
    ).rejects.toBeInstanceOf(RateLimitExceededError);
  });

  test('deberia bloquear temporalmente la IP despues de 3 excesos del limite corto en 1 hora', async () => {
    for (let i = 0; i < 20; i++) {
      await service.validarIntentoAgendamiento(
        {
          ...BASE_PAYLOAD,
          telefono: telefonoPorIndice(i),
          horaInicio: horaPorIndice(i),
        },
        '10.0.0.2'
      );
    }

    await expect(
      service.validarIntentoAgendamiento(
        {
          ...BASE_PAYLOAD,
          telefono: telefonoPorIndice(21),
          horaInicio: horaPorIndice(21),
        },
        '10.0.0.2'
      )
    ).rejects.toBeInstanceOf(RateLimitExceededError);

    await expect(
      service.validarIntentoAgendamiento(
        {
          ...BASE_PAYLOAD,
          telefono: telefonoPorIndice(22),
          horaInicio: horaPorIndice(22),
        },
        '10.0.0.2'
      )
    ).rejects.toBeInstanceOf(RateLimitExceededError);

    await expect(
      service.validarIntentoAgendamiento(
        {
          ...BASE_PAYLOAD,
          telefono: telefonoPorIndice(23),
          horaInicio: horaPorIndice(23),
        },
        '10.0.0.2'
      )
    ).rejects.toBeInstanceOf(IpTemporalmenteBloqueadaError);

    await expect(
      service.validarIntentoAgendamiento(
        {
          ...BASE_PAYLOAD,
          telefono: telefonoPorIndice(24),
          horaInicio: horaPorIndice(24),
        },
        '10.0.0.2'
      )
    ).rejects.toBeInstanceOf(IpTemporalmenteBloqueadaError);
  });

  test('deberia limitar intentos por telefono a 4 en 24 horas', async () => {
    for (let i = 0; i < 4; i++) {
      await expect(
        service.validarIntentoAgendamiento(
          {
            ...BASE_PAYLOAD,
            horaInicio: horaPorIndice(i),
          },
          `10.0.0.${i + 10}`
        )
      ).resolves.toBeUndefined();
    }

    await expect(
      service.validarIntentoAgendamiento(
        {
          ...BASE_PAYLOAD,
          horaInicio: '11:10',
        },
        '10.0.0.20'
      )
    ).rejects.toBeInstanceOf(RateLimitExceededError);
  });

  test('deberia limitar reintentos del mismo slot a 4 en 30 minutos', async () => {
    for (let i = 0; i < 4; i++) {
      await expect(
        service.validarIntentoAgendamiento(
          {
            ...BASE_PAYLOAD,
            telefono: telefonoPorIndice(i),
          },
          `10.0.1.${i + 1}`
        )
      ).resolves.toBeUndefined();
    }

    await expect(
      service.validarIntentoAgendamiento(
        {
          ...BASE_PAYLOAD,
          telefono: telefonoPorIndice(40),
        },
        '10.0.1.10'
      )
    ).rejects.toBeInstanceOf(RateLimitExceededError);
  });

  test('deberia bloquear cuando el telefono ya tiene 2 citas activas', async () => {
    (repositoryMock.contarCitasActivasPorTelefono as jest.Mock).mockResolvedValue(2);

    await expect(
      service.validarIntentoAgendamiento(BASE_PAYLOAD, '10.0.2.1')
    ).rejects.toBeInstanceOf(MaximoCitasActivasPorTelefonoError);
  });
});
