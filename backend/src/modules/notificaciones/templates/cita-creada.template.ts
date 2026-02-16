/**
 * ================================================
 * PLANTILLA HTML: CITA CREADA
 * ================================================
 * 
 * Email enviado cuando un cliente agenda una nueva cita
 */

import type { NotificacionCitaCreada } from '../notificaciones.types';
import {
  escaparHTML,
  formatearPrecio,
  formatearDuracion,
  generarListaServicios,
} from '../notificaciones.utils';

/**
 * Genera el HTML para el email de cita creada
 */
export function generarEmailCitaCreada(datos: NotificacionCitaCreada): string {
  const nombreCliente = escaparHTML(datos.nombreDestinatario);
  const nombreTrabajadora = escaparHTML(datos.nombreTrabajadora);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cita Agendada</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; text-align: center;">
                ✅ ¡Cita Agendada!
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; text-align: center; opacity: 0.9;">
                Tu cita ha sido confirmada exitosamente
              </p>
            </td>
          </tr>

          <!-- Saludo -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Hola <strong>${nombreCliente}</strong>,
              </p>
              <p style="margin: 15px 0 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Hemos recibido tu solicitud de cita. A continuación encontrarás todos los detalles:
              </p>
            </td>
          </tr>

          <!-- Número de Confirmación -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px 20px; border-radius: 4px;">
                <p style="margin: 0; color: #666666; font-size: 14px;">Número de Confirmación</p>
                <p style="margin: 5px 0 0; color: #333333; font-size: 24px; font-weight: 700; letter-spacing: 2px;">
                  ${datos.numeroConfirmacion}
                </p>
              </div>
            </td>
          </tr>

          <!-- Detalles de la Cita -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px; font-weight: 600; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
                📋 Detalles de la Cita
              </h2>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="color: #666666; font-size: 14px;">📅 Fecha:</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                    <strong style="color: #333333; font-size: 14px;">${datos.fechaFormateada}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="color: #666666; font-size: 14px;">🕐 Hora:</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                    <strong style="color: #333333; font-size: 14px;">${datos.hora}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="color: #666666; font-size: 14px;">👤 Trabajadora:</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                    <strong style="color: #333333; font-size: 14px;">${nombreTrabajadora}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="color: #666666; font-size: 14px;">⏱️ Duración:</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                    <strong style="color: #333333; font-size: 14px;">${formatearDuracion(datos.duracionTotal)}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Servicios -->
          <tr>
            <td style="padding: 20px 40px;">
              <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px; font-weight: 600;">
                💅 Servicios Incluidos
              </h3>
              <ul style="margin: 0; padding: 0 0 0 20px; list-style-position: outside;">
                ${generarListaServicios(datos.servicios)}
              </ul>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Total a Pagar</p>
                <p style="margin: 8px 0 0; color: #ffffff; font-size: 36px; font-weight: 700;">
                  ${formatearPrecio(datos.precioTotal)}
                </p>
              </div>
            </td>
          </tr>

          <!-- Botón de Cancelación -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px;">
                <p style="margin: 0 0 15px; color: #856404; font-size: 14px; font-weight: 600;">
                  ⚠️ ¿Necesitas cancelar?
                </p>
                <p style="margin: 0 0 15px; color: #856404; font-size: 13px; line-height: 1.5;">
                  Si por algún motivo no puedes asistir, por favor cancela con al menos <strong>24 horas de anticipación</strong>.
                </p>
                <a href="${datos.linkCancelacion}" 
                   style="display: inline-block; background-color: #dc3545; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center;">
                  Cancelar Cita
                </a>
              </div>
            </td>
          </tr>

          <!-- Recordatorios -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                <h4 style="margin: 0 0 12px; color: #333333; font-size: 16px; font-weight: 600;">
                  📝 Recordatorios Importantes
                </h4>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                  <li>Llega 5 minutos antes de tu cita</li>
                  <li>Guarda tu número de confirmación: <strong>${datos.numeroConfirmacion}</strong></li>
                  <li>Si necesitas reprogramar, cancela primero y agenda nuevamente</li>
                  <li>Las cancelaciones tardías pueden tener restricciones</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #999999; font-size: 12px; text-align: center; line-height: 1.6;">
                Este es un correo automático, por favor no respondas a este mensaje.<br>
                Si tienes alguna duda, contáctanos directamente.
              </p>
              <p style="margin: 15px 0 0; color: #999999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Manicure Spa. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
