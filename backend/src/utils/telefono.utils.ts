const TELEFONO_NACIONAL_REGEX = /^3\d{9}$/;

/**
 * Normaliza un teléfono colombiano móvil al formato +57XXXXXXXXXX.
 */
export function normalizarTelefonoColombiano(telefono: string): string {
  const limpio = telefono.trim().replace(/\s+/g, '');

  if (limpio.startsWith('+57')) {
    const numero = limpio.slice(3);
    if (!TELEFONO_NACIONAL_REGEX.test(numero)) {
      throw new Error('Formato de teléfono inválido');
    }
    return `+57${numero}`;
  }

  if (limpio.startsWith('57')) {
    const numero = limpio.slice(2);
    if (!TELEFONO_NACIONAL_REGEX.test(numero)) {
      throw new Error('Formato de teléfono inválido');
    }
    return `+57${numero}`;
  }

  if (!TELEFONO_NACIONAL_REGEX.test(limpio)) {
    throw new Error('Formato de teléfono inválido');
  }

  return `+57${limpio}`;
}
