# 📧 Módulo de Notificaciones

Sistema de notificaciones por email usando **Resend** para la API de agendamiento de citas.

---

## 📁 Estructura del Módulo

```
notificaciones/
├── index.ts                           # Punto de entrada (exports)
├── notificaciones.types.ts            # Tipos e interfaces TypeScript
├── notificaciones.utils.ts            # Utilidades de formateo
├── notificaciones.service.ts          # Servicio principal (Singleton)
├── templates/                         # Plantillas HTML de emails
│   ├── cita-creada.template.ts        # Email: Cita Creada
│   ├── cita-confirmada.template.ts    # Email: Cita Confirmada
│   └── cita-cancelada.template.ts     # Email: Cita Cancelada
└── README.md                          # Este archivo
```

---

## 🎯 Responsabilidades del Módulo

✅ Enviar emails transaccionales usando Resend  
✅ Formatear fechas, precios y duraciones  
✅ Generar HTML responsive para los emails  
✅ Manejar errores sin romper el flujo principal  
✅ Logging de eventos de notificaciones  
✅ Validación de emails antes de enviar  

❌ **NO** debe manejar lógica de negocio de citas  
❌ **NO** debe realizar consultas a la base de datos  
❌ **NO** debe propagar errores al módulo de citas  

---

## 🚀 Inicio Rápido

### 1. Instalar Dependencia

```bash
npm install resend
```

### 2. Configurar Variables de Entorno

Agregar en `.env`:

```env
# Resend API
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Manicure Spa <noreply@tudominio.com>

# Frontend URL (para links de cancelación)
FRONTEND_URL=https://tudominio.com
```

### 3. Importar y Usar

```typescript
import { notificacionesService } from './modules/notificaciones';

// El servicio ya está inicializado (Singleton)
const resultado = await notificacionesService.enviarCitaCreada({
  destinatario: 'cliente@email.com',
  nombreDestinatario: 'María López',
  numeroConfirmacion: 'ABC123',
  nombreTrabajadora: 'Ana García',
  fecha: new Date('2026-02-20T14:30:00'),
  fechaFormateada: '',
  hora: '',
  servicios: [
    { nombre: 'Manicure', duracion: 30, precio: 15000 },
    { nombre: 'Pedicure', duracion: 45, precio: 20000 },
  ],
  duracionTotal: 75,
  precioTotal: 35000,
  tokenCancelacion: 'abc-def-ghi',
  linkCancelacion: '',
});

if (resultado.exito) {
  console.log('✅ Email enviado:', resultado.idMensaje);
} else {
  console.error('❌ Error:', resultado.error);
}
```

---

## 📩 Tipos de Notificaciones

### 1. Cita Creada

Se envía cuando un cliente agenda una nueva cita.

**Contenido:**
- Número de confirmación
- Detalles de la cita (fecha, hora, trabajadora)
- Lista de servicios
- Total a pagar
- Link de cancelación

**Ejemplo de uso:**
```typescript
await notificacionesService.enviarCitaCreada(datos);
```

### 2. Cita Confirmada

Se envía cuando se confirma una cita previamente agendada.

**Contenido:**
- Banner de "Confirmada"
- Detalles de la cita
- Recordatorio de llegar temprano
- Link de cancelación (por si cambian de planes)

**Ejemplo de uso:**
```typescript
await notificacionesService.enviarCitaConfirmada(datos);
```

### 3. Cita Cancelada

Se envía cuando se cancela una cita.

**Contenido:**
- Estado de cancelación
- Detalles de la cita cancelada
- Motivo (opcional)
- Botón para agendar nuevamente

**Ejemplo de uso:**
```typescript
await notificacionesService.enviarCitaCancelada({
  ...datos,
  motivo: 'Cancelación solicitada por el cliente',
});
```

---

## 🔗 Integración con Módulo de Citas

El módulo de notificaciones ya está integrado en el flujo de citas:

### En `cita.service.ts`

```typescript
import { notificacionesService } from '../notificaciones';

// Después de crear la cita (fuera de la transacción)
this.enviarNotificacionCitaCreada(citaCreada).catch((error) => {
  console.error('Error al enviar notificación:', error);
});
```

### Patrón de Integración

```typescript
// ✅ CORRECTO: Fire-and-forget (no bloquea)
notificacionesService.enviarCitaCreada(datos).catch(console.error);

// ✅ CORRECTO: Con logging personalizado
notificacionesService.enviarCitaCreada(datos)
  .then((resultado) => {
    if (resultado.exito) {
      console.log('Email enviado:', resultado.idMensaje);
    }
  })
  .catch(console.error);

// ❌ INCORRECTO: await bloquea el flujo
await notificacionesService.enviarCitaCreada(datos);
```

**Regla:** Las notificaciones **NUNCA** deben bloquear el flujo principal.

---

## 🛠 Utilidades de Formateo

El módulo incluye helpers para formatear datos:

```typescript
import {
  formatearFechaCompleta,
  extraerHora,
  formatearPrecio,
  formatearDuracion,
  generarLinkCancelacion,
} from './modules/notificaciones';

// Fecha completa
formatearFechaCompleta(new Date('2026-02-15'))
// => "Domingo, 15 de febrero de 2026"

// Extraer hora
extraerHora(new Date('2026-02-15T14:30:00'))
// => "14:30"

// Precio
formatearPrecio(25000)
// => "$25.000"

// Duración
formatearDuracion(90)
// => "1 hora 30 minutos"

// Link de cancelación
generarLinkCancelacion('token-abc-123')
// => "https://tudominio.com/cancelar?token=token-abc-123"
```

---

## 🎨 Plantillas HTML

Las plantillas están diseñadas con:

✅ **Responsive Design** (mobile-first)  
✅ **Email-safe CSS** (inline styles)  
✅ **Accesibilidad** (roles ARIA, alt texts)  
✅ **Degradación elegante** (fallbacks para clientes antiguos)  

### Personalizar Plantillas

Las plantillas están en `templates/`:

1. Editar `cita-creada.template.ts` para cambiar diseño de cita creada
2. Editar `cita-confirmada.template.ts` para cita confirmada
3. Editar `cita-cancelada.template.ts` para cita cancelada

**Colores principales:**
- Cita Creada: Gradiente Púrpura (`#667eea` → `#764ba2`)
- Cita Confirmada: Gradiente Verde (`#11998e` → `#38ef7d`)
- Cita Cancelada: Gradiente Rojo (`#eb3349` → `#f45c43`)

---

## 🔒 Manejo de Errores

El servicio **NUNCA** propaga errores al módulo de citas:

```typescript
// ✅ Dentro del servicio
private async enviarEmail(...): Promise<ResultadoEnvio> {
  try {
    const resultado = await this.resend.emails.send(...);
    return { exito: true, idMensaje: resultado.data?.id };
  } catch (error) {
    // Log pero no lanzar error
    console.error('Error al enviar email:', error);
    return { exito: false, error: error.message };
  }
}
```

**Beneficios:**
- Si Resend falla, la cita **sigue creándose**
- El usuario no ve errores de email
- Los errores se loggean para auditoría

---

## 📊 Logging

Todos los eventos significativos se loggean:

```
✅ Servicio de notificaciones inicializado correctamente
📧 [SIMULADO] Email CITA_CREADA a cliente@email.com
✅ Email CITA_CREADA enviado a cliente@email.com (ID: 123abc)
❌ Error al enviar email CITA_CONFIRMADA: API key inválida
⚠️  RESEND_API_KEY no configurada. Notificaciones deshabilitadas.
ℹ️  Cliente María López no tiene email. Notificación omitida.
```

---

## 🚀 Recomendaciones para Producción

### 1. **Usar Dominio Verificado en Resend**

En desarrollo, Resend permite enviar desde `onboarding@resend.dev`. En producción:

1. Verificar tu dominio en Resend
2. Actualizar en el servicio:

```typescript
// notificaciones.service.ts
private readonly remitentePorDefecto = 'Manicure Spa <noreply@tudominio.com>';
```

### 2. **Implementar Sistema de Colas**

Para mayor volumen de emails, usar colas:

```bash
npm install bull bullmq redis
```

```typescript
// queue/notificaciones.queue.ts
import Queue from 'bull';

export const notificacionesQueue = new Queue('notificaciones', {
  redis: process.env.REDIS_URL,
});

// Procesar trabajos
notificacionesQueue.process(async (job) => {
  const { tipo, datos } = job.data;
  
  switch (tipo) {
    case 'CITA_CREADA':
      await notificacionesService.enviarCitaCreada(datos);
      break;
    // ... otros casos
  }
});

// En cita.service.ts
notificacionesQueue.add({ tipo: 'CITA_CREADA', datos });
```

**Beneficios:**
- ✅ Retry automático en caso de fallo
- ✅ Rate limiting
- ✅ Priorización de emails
- ✅ Métricas y monitoring

### 3. **Retry Logic**

Implementar reintentos exponenciales:

```typescript
async enviarConReintentos(
  fn: () => Promise<any>,
  maxIntentos = 3
): Promise<void> {
  for (let i = 0; i < maxIntentos; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      if (i === maxIntentos - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
    }
  }
}
```

### 4. **Métricas y Monitoring**

Trackear métricas clave:

```typescript
// Ejemplo con Prometheus
import { Counter, Histogram } from 'prom-client';

const emailsEnviados = new Counter({
  name: 'emails_enviados_total',
  help: 'Total de emails enviados',
  labelNames: ['tipo', 'resultado'],
});

const tiempoEnvio = new Histogram({
  name: 'email_tiempo_envio_segundos',
  help: 'Tiempo de envío de emails',
});
```

### 5. **Rate Limiting**

Respetar límites de Resend:

```typescript
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 'second',
});

async enviarEmail(...) {
  await limiter.removeTokens(1);
  // ... envío
}
```

### 6. **Testing**

Mockear el servicio en tests:

```typescript
// __mocks__/notificaciones.service.ts
export const notificacionesService = {
  enviarCitaCreada: jest.fn().mockResolvedValue({
    exito: true,
    idMensaje: 'test-123',
    timestamp: new Date(),
  }),
};
```

### 7. **Webhooks de Resend**

Escuchar eventos de Resend (bounces, opens, clicks):

```typescript
// routes/webhooks.routes.ts
router.post('/webhooks/resend', (req, res) => {
  const { type, data } = req.body;
  
  switch (type) {
    case 'email.bounced':
      // Marcar email como inválido
      break;
    case 'email.opened':
      // Trackear apertura
      break;
  }
  
  res.status(200).send('OK');
});
```

### 8. **Fallback a SMS**

Si el cliente no tiene email:

```typescript
if (!cliente.email) {
  await enviarSMS(cliente.telefono, mensaje);
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
import { notificacionesService } from './notificaciones.service';

describe('NotificacionesService', () => {
  it('debe enviar email de cita creada', async () => {
    const resultado = await notificacionesService.enviarCitaCreada({
      destinatario: 'test@example.com',
      // ... datos
    });
    
    expect(resultado.exito).toBe(true);
    expect(resultado.idMensaje).toBeDefined();
  });

  it('debe fallar si el email es inválido', async () => {
    const resultado = await notificacionesService.enviarCitaCreada({
      destinatario: 'email-invalido',
      // ... datos
    });
    
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toContain('no válido');
  });
});
```

### Integration Tests

```typescript
it('debe crear cita y enviar email', async () => {
  const emailSpy = jest.spyOn(notificacionesService, 'enviarCitaCreada');
  
  const cita = await citaService.agendarCitaPublica({
    // ... datos
  });
  
  expect(cita).toBeDefined();
  expect(emailSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      destinatario: 'cliente@example.com',
    })
  );
});
```

---

## 🐛 Troubleshooting

### Email no se envía

**Causa 1:** RESEND_API_KEY no configurada  
**Solución:** Verificar `.env` y reiniciar servidor

**Causa 2:** Email inválido  
**Solución:** Verificar formato del email (debe tener @)

**Causa 3:** Rate limit excedido  
**Solución:** Implementar throttling o esperar

### Email llega a spam

**Causa:** Dominio no verificado  
**Solución:** Verificar dominio en Resend + configurar SPF/DKIM

### Plantilla no se muestra bien

**Causa:** Cliente de email antiguo  
**Solución:** Usar inline styles y tablas (ya implementado)

---

## 📚 Referencias

- [Resend Documentation](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resend/resend-node)
- [Email Design Best Practices](https://www.campaignmonitor.com/dev-resources/guides/email-design/)
- [Can I Email?](https://www.caniemail.com/) - Compatibilidad de CSS en emails

---

## 📝 TODO Futuro

- [ ] Implementar colas con Bull/BullMQ
- [ ] Agregar plantillas en varios idiomas (i18n)
- [ ] Webhooks de Resend para tracking
- [ ] Dashboard de métricas de emails
- [ ] A/B testing de plantillas
- [ ] Notificaciones push (Firebase)
- [ ] Notificaciones por WhatsApp (Twilio)

---

## 👨‍💻 Autor

Módulo implementado siguiendo patrones SOLID y mejores prácticas de arquitectura backend.

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026
