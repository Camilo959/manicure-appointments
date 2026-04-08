import { CitaRepository } from './cita.repository';
import type { AgendarCitaPublicaInput } from './cita.types';
import {
  IpTemporalmenteBloqueadaError,
  MaximoCitasActivasPorTelefonoError,
  RateLimitExceededError,
} from './cita.errors';
import { normalizarTelefonoColombiano } from '../../utils/telefono.utils';

const SHORT_WINDOW_MS = 15 * 60 * 1000;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const SLOT_WINDOW_MS = 30 * 60 * 1000;
const BREACH_WINDOW_MS = 60 * 60 * 1000;
const IP_BLOCK_MS = 6 * 60 * 60 * 1000;

const SHORT_IP_LIMIT = 20;
const DAILY_IP_LIMIT = 50;
const DAILY_PHONE_LIMIT = 4;
const SLOT_LIMIT = 4;
const BREACHES_TO_BLOCK = 3;
const MAX_ACTIVE_APPOINTMENTS_BY_PHONE = 2;

type RateLimitPayload = Pick<
  AgendarCitaPublicaInput,
  'telefono' | 'fecha' | 'horaInicio' | 'trabajadoraId'
>;

type ConsumeResult = {
  allowed: boolean;
  retryAfterMs: number;
};

export class CitaRateLimitService {
  private readonly shortIpStore = new Map<string, number[]>();
  private readonly dailyIpStore = new Map<string, number[]>();
  private readonly dailyPhoneStore = new Map<string, number[]>();
  private readonly slotStore = new Map<string, number[]>();
  private readonly ipBreachStore = new Map<string, number[]>();
  private readonly blockedIps = new Map<string, number>();

  constructor(private readonly repository: CitaRepository) {}

  async validarIntentoAgendamiento(payload: RateLimitPayload, ip: string): Promise<void> {
    const now = Date.now();
    const safeIp = this.normalizarIp(ip);

    this.limpiarExpirados(now);
    this.validarIpNoBloqueada(safeIp, now);

    const shortResult = this.registrarIntento(
      this.shortIpStore,
      `ip-short:${safeIp}`,
      now,
      SHORT_WINDOW_MS,
      SHORT_IP_LIMIT
    );

    if (!shortResult.allowed) {
      this.registrarExcesoCortoIp(safeIp, now);

      throw new RateLimitExceededError(
        'Demasiadas solicitudes desde esta IP. Máximo 20 intentos cada 15 minutos.',
        'RATE_LIMIT_IP_15M'
      );
    }

    const dailyIpResult = this.registrarIntento(
      this.dailyIpStore,
      `ip-day:${safeIp}`,
      now,
      DAILY_WINDOW_MS,
      DAILY_IP_LIMIT
    );

    if (!dailyIpResult.allowed) {
      throw new RateLimitExceededError(
        'Demasiadas solicitudes desde esta IP. Máximo 50 intentos cada 24 horas.',
        'RATE_LIMIT_IP_24H'
      );
    }

    const telefonoNormalizado = normalizarTelefonoColombiano(payload.telefono);

    const dailyPhoneResult = this.registrarIntento(
      this.dailyPhoneStore,
      `phone-day:${telefonoNormalizado}`,
      now,
      DAILY_WINDOW_MS,
      DAILY_PHONE_LIMIT
    );

    if (!dailyPhoneResult.allowed) {
      throw new RateLimitExceededError(
        'Este teléfono superó el límite de 4 intentos de agendamiento en 24 horas.',
        'RATE_LIMIT_PHONE_24H'
      );
    }

    const slotKey = `slot:${payload.trabajadoraId}:${payload.fecha}:${payload.horaInicio}`;
    const slotResult = this.registrarIntento(
      this.slotStore,
      slotKey,
      now,
      SLOT_WINDOW_MS,
      SLOT_LIMIT
    );

    if (!slotResult.allowed) {
      throw new RateLimitExceededError(
        'Este horario alcanzó el máximo de 4 intentos en 30 minutos. Intenta en unos minutos.',
        'RATE_LIMIT_SLOT_30M'
      );
    }

    const activeAppointments = await this.repository.contarCitasActivasPorTelefono(
      telefonoNormalizado
    );

    if (activeAppointments >= MAX_ACTIVE_APPOINTMENTS_BY_PHONE) {
      throw new MaximoCitasActivasPorTelefonoError();
    }
  }

  private normalizarIp(ip: string): string {
    const cleanIp = ip.trim();

    if (!cleanIp) {
      return 'unknown';
    }

    if (cleanIp.startsWith('::ffff:')) {
      return cleanIp.slice(7);
    }

    return cleanIp;
  }

  private validarIpNoBloqueada(ip: string, now: number): void {
    const blockedUntil = this.blockedIps.get(ip);

    if (!blockedUntil) {
      return;
    }

    if (blockedUntil <= now) {
      this.blockedIps.delete(ip);
      return;
    }

    throw new IpTemporalmenteBloqueadaError();
  }

  private registrarExcesoCortoIp(ip: string, now: number): void {
    const key = `ip-breach:${ip}`;
    const breaches = this.obtenerEventosVigentes(this.ipBreachStore, key, now, BREACH_WINDOW_MS);
    breaches.push(now);
    this.ipBreachStore.set(key, breaches);

    if (breaches.length >= BREACHES_TO_BLOCK) {
      this.blockedIps.set(ip, now + IP_BLOCK_MS);
      throw new IpTemporalmenteBloqueadaError();
    }
  }

  private registrarIntento(
    store: Map<string, number[]>,
    key: string,
    now: number,
    windowMs: number,
    maxAllowed: number
  ): ConsumeResult {
    const current = this.obtenerEventosVigentes(store, key, now, windowMs);
    current.push(now);
    store.set(key, current);

    const allowed = current.length <= maxAllowed;
    const retryAfterMs = allowed ? 0 : Math.max(0, current[0] + windowMs - now);

    return {
      allowed,
      retryAfterMs,
    };
  }

  private obtenerEventosVigentes(
    store: Map<string, number[]>,
    key: string,
    now: number,
    windowMs: number
  ): number[] {
    const values = store.get(key) ?? [];
    const minTimestamp = now - windowMs;
    const vigentes = values.filter((timestamp) => timestamp > minTimestamp);

    if (vigentes.length === 0) {
      store.delete(key);
      return [];
    }

    return vigentes;
  }

  private limpiarExpirados(now: number): void {
    this.limpiarStore(this.shortIpStore, now, SHORT_WINDOW_MS);
    this.limpiarStore(this.dailyIpStore, now, DAILY_WINDOW_MS);
    this.limpiarStore(this.dailyPhoneStore, now, DAILY_WINDOW_MS);
    this.limpiarStore(this.slotStore, now, SLOT_WINDOW_MS);
    this.limpiarStore(this.ipBreachStore, now, BREACH_WINDOW_MS);

    for (const [ip, blockedUntil] of this.blockedIps.entries()) {
      if (blockedUntil <= now) {
        this.blockedIps.delete(ip);
      }
    }
  }

  private limpiarStore(store: Map<string, number[]>, now: number, windowMs: number): void {
    const minTimestamp = now - windowMs;

    for (const [key, values] of store.entries()) {
      const filtered = values.filter((timestamp) => timestamp > minTimestamp);
      if (filtered.length === 0) {
        store.delete(key);
      } else {
        store.set(key, filtered);
      }
    }
  }
}
