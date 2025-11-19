import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SlackChannel } from './slack.constants';
import { SlackBlock } from './types/slack.types';

// 1. Tipos para mayor claridad y autocompletado.
// Esto permite payloads complejos, no solo texto.
export interface SlackMessagePayload {
  blocks?: any[]; // El tipo 'any' es flexible, pero puedes definir interfaces más estrictas para tus bloques.
  text?: string; // Texto de fallback para notificaciones.
  // Puedes añadir más campos de la API de Slack aquí, como 'username', 'icon_emoji', etc.
}

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private webhookUrls = new Map<SlackChannel, string>();
  // 2. Variable de entorno para habilitar/deshabilitar notificaciones globalmente.
  private readonly isSlackEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isSlackEnabled = this.configService.get<boolean>(
      'SLACK_NOTIFICATIONS_ENABLED',
      true,
    );
    if (this.isSlackEnabled) {
      this.loadWebhookUrls();
    } else {
      this.logger.log('Slack notifications are disabled.');
    }
  }

  private loadWebhookUrls(): void {
    for (const channel of Object.values(SlackChannel)) {
      const url = this.configService.get<string>(`SLACK_WEBHOOK_${channel}`);
      if (url) {
        this.webhookUrls.set(channel, url);
      } else {
        this.logger.warn(
          `Webhook URL for channel "${channel}" not found in .env`,
        );
      }
    }
  }

  // 3. Método `sendMessage` sobrecargado y flexible.
  // Acepta un string simple O un objeto complejo (SlackMessagePayload).
  async sendMessage(
    channel: SlackChannel,
    payload: string | SlackMessagePayload,
  ): Promise<boolean> {
    if (!this.isSlackEnabled) {
      // Si está deshabilitado, no hagas nada y retorna éxito para no romper el flujo.
      return true;
    }

    const webhookUrl = this.webhookUrls.get(channel);
    if (!webhookUrl) {
      this.logger.error(
        `Attempted to send a message to an unconfigured channel: "${channel}"`,
      );
      return false; // Indica que falló.
    }

    // Construye el cuerpo de la petición dinámicamente.
    const body =
      typeof payload === 'string'
        ? { text: payload } // Si es un string, envíalo como siempre.
        : payload; // Si es un objeto, envíalo tal cual.

    try {
      await axios.post(webhookUrl, body);
      return true; // Éxito
    } catch (error) {
      this.logger.error(
        `Error sending Slack message to channel "${channel}"`,
        error.stack,
      );
      // 4. Mejor manejo de errores: retorna `false` en caso de fallo.
      return false; // Fracaso
    }
  }

  async enviarResumenCobranza(
    resumen: any,
    channel: SlackChannel,
  ): Promise<boolean> {
    if (!this.isSlackEnabled) {
      // Si está deshabilitado, no hagas nada y retorna éxito para no romper el flujo.
      return true;
    }

    const webhookUrl = this.webhookUrls.get(channel);
    if (!webhookUrl) {
      this.logger.error(
        `Attempted to send a message to an unconfigured channel: "${channel}"`,
      );
      return false; // Indica que falló.
    }
    try {
      const tasaExito =
        resumen.totalProcesados > 0
          ? ((resumen.exitosos / resumen.totalProcesados) * 100).toFixed(1)
          : '0';

      const color =
        resumen.fallidos === 0
          ? 'good'
          : resumen.fallidos > 5
            ? 'danger'
            : 'warning';

      const blocks: SlackBlock[] = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📧 Proceso Completado',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total procesados:*\n${resumen.totalProcesados}`,
            },
            {
              type: 'mrkdwn',
              text: `*Exitosos:*\n✅ ${resumen.exitosos}`,
            },
            {
              type: 'mrkdwn',
              text: `*Fallidos:*\n❌ ${resumen.fallidos}`,
            },
            {
              type: 'mrkdwn',
              text: `*Emails enviados:*\n📨 ${resumen.emailsEnviados}`,
            },
            {
              type: 'mrkdwn',
              text: `*Tasa de éxito:*\n${tasaExito}%`,
            },
            {
              type: 'mrkdwn',
              text: `*Duración:*\n⏱️ ${resumen.duracionSegundos}s`,
            },
          ],
        },
      ];

      // Agregar sección de errores si hay
      if (resumen.errores.length > 0) {
        const erroresTexto = resumen.errores
          .slice(0, 10) // Máximo 10 errores
          .map((e) => `• *${e.estudiante}*: ${e.error}`)
          .join('\n');

        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*❗ Errores encontrados (${resumen.errores.length}):*\n${erroresTexto}${
              resumen.errores.length > 10 ? '\n_...y más_' : ''
            }`,
          },
        });
      }

      // Agregar divider y footer
      blocks.push(
        {
          type: 'divider',
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `🏫 Colegio Albert Einstein | ${new Date().toLocaleString(
                'es-PE',
                {
                  timeZone: 'America/Lima',
                },
              )}`,
            },
          ],
        },
      );
      await axios.post(webhookUrl, {
        text: `Proceso de cobranza completado: ${resumen.exitosos}/${resumen.totalProcesados} exitosos`,
        blocks,
        attachments: [
          {
            color,
            text:
              resumen.fallidos === 0
                ? '✨ Proceso completado sin errores'
                : `⚠️ Revisa los ${resumen.fallidos} casos fallidos`,
          },
        ],
      });

      this.logger.log('Resumen enviado a Slack exitosamente');
    } catch (error) {
      this.logger.error(`Error al enviar mensaje a Slack: ${error.message}`);
    }
  }

  /**
   * Envía notificación de inicio de proceso
   */
  async enviarInicioProcesoCobranza(
    totalEstudiantes: number,
    jobId: string,
    channel: SlackChannel,
  ): Promise<boolean> {
    if (!this.isSlackEnabled) {
      // Si está deshabilitado, no hagas nada y retorna éxito para no romper el flujo.
      return true;
    }

    const webhookUrl = this.webhookUrls.get(channel);
    if (!webhookUrl) {
      this.logger.error(
        `Attempted to send a message to an unconfigured channel: "${channel}"`,
      );
      return false; // Indica que falló.
    }
    try {
      await axios.post(webhookUrl, {
        text: `🚀 Iniciando proceso de cobranza para ${totalEstudiantes} estudiantes`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🚀 *Proceso de Cobranza Iniciado*\n\n• Estudiantes: *${totalEstudiantes}*\n• Job ID: \`${jobId}\`\n• Estado: En progreso...`,
            },
          },
        ],
      });
    } catch (error) {
      this.logger.error(`Error al enviar inicio a Slack: ${error.message}`);
    }
  }
}
