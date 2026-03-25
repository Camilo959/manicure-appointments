import { Resend } from 'resend';
import type { EmailProvider } from './notificaciones.types';

export class ResendEmailProvider implements EmailProvider {
  private readonly resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async send(params: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }): Promise<{ id?: string }> {
    const resultado = await this.resend.emails.send(params);
    return { id: resultado.data?.id };
  }
}
