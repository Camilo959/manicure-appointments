# Guía de Instalación y Configuración

Pasos para poner en funcionamiento el sistema de notificaciones por email.

## Paso 1: Instalar dependencias

En la terminal, desde la carpeta backend:

```bash
npm install resend
```

## Paso 2: Obtener API Key de Resend

1. Ir a https://resend.com
2. Crear cuenta gratuita (3000 emails/mes gratis)
3. Ir a https://resend.com/api-keys
4. Crear nueva API key
5. Copiar la key (empieza con re_)

## Paso 3: Configurar variables de entorno

Agregar en el archivo .env (raíz de backend/):

```env
# CONFIGURACIÓN DE RESEND

# API Key de Resend (obligatorio)
# Obtener en: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email del remitente (opcional en desarrollo)
# En producción, usa un dominio verificado
RESEND_FROM_EMAIL=Manicure Spa <noreply@tudominio.com>

# URL del frontend (para links de cancelación)
# Usado para generar links completos
FRONTEND_URL=http://localhost:3001
```

## Paso 4: Verificar instalación

1. Reiniciar el servidor:

```bash
npm run dev
```

2. Buscar en la consola:

```text
✅ Servicio de notificaciones inicializado correctamente
```

3. Si aparece este mensaje, el sistema está listo. Si no:

```text
⚠️  RESEND_API_KEY no configurada. Notificaciones deshabilitadas.
```

Verificar el archivo .env.

## Paso 5: Probar el sistema

### Opción A: Crear una cita desde Postman/Insomnia

POST http://localhost:3000/api/citas

```json
{
  "nombreCliente": "María López",
  "telefono": "+573001234567",
  "email": "tu-email@gmail.com",
  "trabajadoraId": "uuid-trabajadora",
  "fecha": "2026-02-20",
  "horaInicio": "14:30",
  "serviciosIds": ["uuid-servicio-1"]
}
```

Si todo está bien:

1. La cita se crea correctamente
2. En consola aparece: ✅ Email CITA_CREADA enviado a tu-email@gmail.com
3. Recibirás un email en tu bandeja de entrada

### Opción B: Probar solo el servicio de notificaciones

Crear archivo: backend/src/test-notificaciones.ts

```ts
import { notificacionesService } from './modules/notificaciones';

async function test() {
  const resultado = await notificacionesService.enviarCitaCreada({
    destinatario: 'tu-email@gmail.com',
    nombreDestinatario: 'Test Usuario',
    numeroConfirmacion: 'TEST123',
    nombreTrabajadora: 'Ana García',
    fecha: new Date('2026-02-20T14:30:00'),
    servicios: [
      { nombre: 'Manicure', duracion: 30, precio: 15000 },
    ],
    duracionTotal: 30,
    precioTotal: 15000,
    tokenCancelacion: 'test-token-123',
  });

  console.log('Resultado:', resultado);
}

test();
```

Ejecutar:

```bash
npx tsx src/test-notificaciones.ts
```

## Paso 6: Verificar dominio (producción)

En desarrollo, Resend permite usar onboarding@resend.dev.
En producción, debes verificar tu dominio:

1. Ir a: https://resend.com/domains
2. Agregar tu dominio (ej: tudominio.com)
3. Configurar registros DNS (SPF, DKIM, DMARC)
4. Esperar verificación (5-10 minutos)
5. Actualizar RESEND_FROM_EMAIL en .env:

```env
RESEND_FROM_EMAIL=Manicure Spa <noreply@tudominio.com>
```

## Troubleshooting

### Error: RESEND_API_KEY no está definida

Solución:

- Verificar que el archivo .env existe en backend/
- Verificar que tiene la línea: RESEND_API_KEY=re_xxxxx
- Reiniciar el servidor

### Error: API key inválida

Solución:

- Generar nueva API key en https://resend.com/api-keys
- Copiar la key completa (sin espacios)
- Actualizar .env
- Reiniciar servidor

### Error: Rate limit exceeded

Solución:

- Plan gratuito: 3000 emails/mes, 10 emails/segundo
- Esperar 1 minuto y reintentar
- Considerar upgrade si necesitas más

### Email no llega

Solución:

- Revisar carpeta de spam/promociones
- Verificar que el email es válido
- Revisar logs del servidor
- En Resend: https://resend.com/emails (ver estado)

### Email llega a spam

Solución:

- Verificar dominio en Resend
- Configurar SPF, DKIM, DMARC
- Evitar palabras spam (gratis, urgente, etc.)
- Usar email corporativo, no Gmail/Yahoo

## Recursos útiles

- Dashboard de Resend: https://resend.com/emails
  Ver todos los emails enviados, estados y estadísticas.
- API Keys: https://resend.com/api-keys
  Gestionar keys, crear nuevas y revocar.
- Documentación: https://resend.com/docs
  Guías completas de uso.
- Límites del plan gratuito: https://resend.com/pricing
  3000 emails/mes, 10 emails/segundo.
