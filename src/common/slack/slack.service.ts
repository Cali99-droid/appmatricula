import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SlackChannel } from './slack.constants';

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
}
