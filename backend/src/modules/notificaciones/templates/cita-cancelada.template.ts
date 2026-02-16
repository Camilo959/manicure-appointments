/**
 * ================================================
 * PLANTILLA HTML: CITA CANCELADA
 * ================================================
 * 
 * Email enviado cuando se cancela una cita
 */

import type { NotificacionCitaCancelada } from '../notificaciones.types';
import {
  escaparHTML,
  generarListaServicios,
} from '../notificaciones.utils';

/**
 * Genera el HTML para el email de cita cancelada
 */
export function generarEmailCitaCancelada(datos: NotificacionCitaCancelada): string {
  const nombreCliente = escaparHTML(datos.nombreDestinatario);
  const nombreTrabajadora = escaparHTML(datos.nombreTrabajadora);
  const motivo = datos.motivo ? escaparHTML(datos.motivo) : null;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cita Cancelada</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); border-radius: 8px 8px 0 0;">
              <div style="text-align: center; font-size: 48px; margin-bottom: 10px;">
                ✖️
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; text-align: center;">
                Cita Cancelada
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; text-align: center; opacity: 0.9;">
                Tu cita ha sido cancelada
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
                Lamentamos informarte que tu cita ha sido <strong>cancelada</strong>.
              </p>
            </td>
          </tr>

          <!-- Estado Cancelado -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  ✖ CANCELADA
                </p>
              </div>
            </td>
          </tr>

          <!-- Número de Confirmación -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="background-color: #f8f9fa; border-left: 4px solid #eb3349; padding: 15px 20px; border-radius: 4px;">
                <p style="margin: 0; color: #666666; font-size: 14px;">Número de Confirmación</p>
                <p style="margin: 5px 0 0; color: #333333; font-size: 24px; font-weight: 700; letter-spacing: 2px;">
                  ${datos.numeroConfirmacion}
                </p>
              </div>
            </td>
          </tr>

          ${motivo ? `
          <!-- Motivo de Cancelación -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px;">
                <p style="margin: 0 0 8px; color: #856404; font-size: 14px; font-weight: 600;">
                  📝 Motivo de Cancelación
                </p>
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  ${motivo}
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Detalles de la Cita Cancelada -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px; font-weight: 600; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
                📋 Detalles de la Cita Cancelada
              </h2>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="color: #666666; font-size: 14px;">📅 Fecha:</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                    <span style="color: #999999; font-size: 14px; text-decoration: line-through;">${datos.fechaFormateada}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="color: #666666; font-size: 14px;">🕐 Hora:</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                    <span style="color: #999999; font-size: 14px; text-decoration: line-through;">${datos.hora}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="color: #666666; font-size: 14px;">👤 Trabajadora:</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                    <span style="color: #999999; font-size: 14px; text-decoration: line-through;">${nombreTrabajadora}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Servicios Cancelados -->
          <tr>
            <td style="padding: 20px 40px;">
              <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px; font-weight: 600;">
                💅 Servicios que estaban programados
              </h3>
              <ul style="margin: 0; padding: 0 0 0 20px; list-style-position: outside; opacity: 0.6;">
                ${generarListaServicios(datos.servicios)}
              </ul>
            </td>
          </tr>

          <!-- Llamado a la Acción -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #d1ecf1; border: 1px solid #0c5460; border-radius: 8px; padding: 25px; text-align: center;">
                <p style="margin: 0 0 15px; color: #0c5460; font-size: 18px; font-weight: 600;">
                  ¿Te gustaría agendar nuevamente?
                </p>
                <p style="margin: 0 0 20px; color: #0c5460; font-size: 14px; line-height: 1.6;">
                  Siempre estaremos encantadas de atenderte. Agenda cuando estés lista.
                </p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/agendar" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px;">
                  Agendar Nueva Cita
                </a>
              </div>
            </td>
          </tr>

          <!-- Información Adicional -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                <h4 style="margin: 0 0 12px; color: #333333; font-size: 16px; font-weight: 600;">
                  ℹ️ Información Importante
                </h4>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                  <li>Esta cancelación ha sido procesada correctamente</li>
                  <li>No se te cobrará ningún cargo por esta cita</li>
                  <li>El horario ahora está disponible para otros clientes</li>
                  <li>Puedes agendar nuevamente cuando lo desees</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Mensaje de Despedida -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0; color: #666666; font-size: 15px; line-height: 1.6; text-align: center;">
                Esperamos verte pronto. 💕
              </p>
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
