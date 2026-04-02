# 🚀 Instalación Rápida - Sistema de Notificaciones

## Pasos para activar las notificaciones por email

### 1️⃣ Instalar Resend

```bash
cd backend
npm install resend
```

### 2️⃣ Obtener API Key

1. Ir a [https://resend.com](https://resend.com)
2. Crear cuenta gratuita (3000 emails/mes)
3. Ir a [API Keys](https://resend.com/api-keys)
4. Crear nueva API key
5. Copiar la key (empieza con `re_`)

### 3️⃣ Configurar Variables de Entorno

Editar `backend/.env`:

```env
# API Key de Resend (OBLIGATORIO)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email del remitente (OPCIONAL en desarrollo)
RESEND_FROM_EMAIL=Manicure Spa <noreply@tudominio.com>

# URL del frontend (para links de cancelación)
FRONTEND_URL=http://localhost:3001
```

### 4️⃣ Reiniciar el Servidor

```bash
npm run dev
```

Buscar en la consola:
```
✅ Servicio de notificaciones inicializado correctamente
```

### 5️⃣ Probar el Sistema

#### Opción A: Crear una cita real

```bash
# POST http://localhost:3000/api/citas
{
  "nombreCliente": "María López",
  "telefono": "+573001234567",
  "email": "tu-email@gmail.com",  👈 USA TU EMAIL
  "trabajadoraId": "uuid-trabajadora",
  "fecha": "2026-02-20",
  "horaInicio": "14:30",
  "serviciosIds": ["uuid-servicio"]
}
```

#### Opción B: Ejecutar script de prueba

1. Editar `src/modules/notificaciones/test-notificaciones.ts`
2. Cambiar `EMAIL_PRUEBA` por tu email (línea 19)
3. Ejecutar:

```bash
npx tsx src/modules/notificaciones/test-notificaciones.ts
```

### 6️⃣ Verificar

- ✅ Revisa tu bandeja de entrada
- ✅ Si no llega, revisa spam/promociones
- ✅ En consola verás: `✅ Email CITA_CREADA enviado a...`
- ✅ Dashboard de Resend: [https://resend.com/emails](https://resend.com/emails)

---

## ⚠️ Troubleshooting

### Email no se envía

**Problema:** `RESEND_API_KEY no configurada`  
**Solución:**
```bash
# Verificar .env
cat backend/.env | grep RESEND

# Reiniciar servidor
npm run dev
```

**Problema:** `API key inválida`  
**Solución:** Generar nueva key en [https://resend.com/api-keys](https://resend.com/api-keys)

### Email llega a spam

**Solución:** Verificar dominio en Resend (solo producción)

---

## 📚 Documentación Completa

- [README Principal](./backend/src/modules/notificaciones/README.md)
- [Guía de Instalación](./backend/src/modules/notificaciones/INSTALACION.md)
- [Ejemplos de Integración](./backend/src/modules/citas/EJEMPLOS_INTEGRACION_NOTIFICACIONES.ts)

---

## 🎯 What's Next?

- [ ] Configurar dominio verificado (producción)
- [ ] Implementar colas con Bull/Redis (escalabilidad)
- [ ] Agregar webhooks de Resend (tracking)
- [ ] Implementar métricas y monitoring

---

**¡Listo! El sistema de notificaciones está funcionando.** 🎉
