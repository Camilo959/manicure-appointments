/**
 * ================================================
 * PLANTILLA HTML: CITA CONFIRMADA
 * ================================================
 * 
 * Email enviado cuando se confirma una cita previamente agendada
 */

import type { NotificacionCitaConfirmada } from '../notificaciones.types';
import {
  escaparHTML,
  formatearPrecio,
  formatearDuracion,
  generarListaServicios,
} from '../notificaciones.utils';

/**
 * Genera el HTML para el email de cita confirmada
 */
export function generarEmailCitaConfirmada(datos: NotificacionCitaConfirmada): string {
  const nombreCliente = escaparHTML(datos.nombreDestinatario);
  const nombreTrabajadora = escaparHTML(datos.nombreTrabajadora);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cita Confirmada</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border-radius: 8px 8px 0 0;">
              <div style="text-align: center; font-size: 48px; margin-bottom: 10px;">
                ✔️
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; text-align: center;">
                ¡Cita Confirmada!
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; text-align: center; opacity: 0.9;">
                Tu cita ha sido confirmada oficialmente
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
                ¡Excelente noticia! Tu cita ha sido <strong>confirmada</strong> y te esperamos en la fecha programada.
              </p>
            </td>
          </tr>

          <!-- Estado Confirmado -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  ✓ CONFIRMADA
                </p>
              </div>
            </td>
          </tr>

          <!-- Número de Confirmación -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="background-color: #f8f9fa; border-left: 4px solid #11998e; padding: 15px 20px; border-radius: 4px;">
                <p style="margin: 0; color: #666666; font-size: 14px;">Número de Confirmación</p>
                <p style="margin: 5px 0 0; color: #333333; font-size: 24px; font-weight: 700; letter-spacing: 2px;">
                  ${datos.numeroConfirmacion}
                </p>
              </div>
            </td>
          </tr>

          <!-- Detalles de la Cita -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px; font-weight: 600; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
                📋 Detalles de tu Cita
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
                💅 Servicios Confirmados
              </h3>
              <ul style="margin: 0; padding: 0 0 0 20px; list-style-position: outside;">
                ${generarListaServicios(datos.servicios)}
              </ul>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Total a Pagar</p>
                <p style="margin: 8px 0 0; color: #ffffff; font-size: 36px; font-weight: 700;">
                  ${formatearPrecio(datos.precioTotal)}
                </p>
              </div>
            </td>
          </tr>

          <!-- Mensaje de Confirmación -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #d1f2eb; border: 1px solid #11998e; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0; color: #0c5d52; font-size: 16px; font-weight: 600; line-height: 1.6;">
                  🎉 ¡Te esperamos con gusto!
                </p>
                <p style="margin: 10px 0 0; color: #0c5d52; font-size: 14px; line-height: 1.6;">
                  Tu cita está 100% confirmada. Llega unos minutos antes para que disfrutemos al máximo de tu tiempo.
                </p>
              </div>
            </td>
          </tr>

          <!-- Opción de Cancelar -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px;">
                <p style="margin: 0 0 10px; color: #856404; font-size: 14px; font-weight: 600;">
                  ⚠️ ¿Cambio de planes?
                </p>
                <p style="margin: 0 0 15px; color: #856404; font-size: 13px; line-height: 1.5;">
                  Si necesitas cancelar, hazlo con al menos <strong>24 horas de anticipación</strong>.
                </p>
                <a href="${datos.linkCancelacion}" 
                   style="display: inline-block; background-color: #dc3545; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                  Cancelar Cita
                </a>
              </div>
            </td>
          </tr>

          <!-- Tips para el día de la cita -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                <h4 style="margin: 0 0 12px; color: #333333; font-size: 16px; font-weight: 600;">
                  💡 Tips para tu Cita
                </h4>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                  <li>Llega 5 minutos antes</li>
                  <li>Trae tu número de confirmación: <strong>${datos.numeroConfirmacion}</strong></li>
                  <li>Si usas esmalte, considera retirarlo antes para ahorrar tiempo</li>
                  <li>Recuerda que confirmar tu asistencia ayuda a mantener nuestro servicio</li>
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
