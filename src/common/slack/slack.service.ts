import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SlackChannel } from './slack.constants'; // Importa el enum

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  // Un Map para guardar la relación entre el canal y su URL
  private webhookUrls = new Map<SlackChannel, string>();

  constructor(private readonly configService: ConfigService) {
    // Carga todas las URLs de los webhooks al iniciar el servicio
    this.loadWebhookUrls();
  }

  private loadWebhookUrls(): void {
    // Itera sobre las llaves del enum para cargar las URLs correspondientes
    for (const channel of Object.values(SlackChannel)) {
      const url = this.configService.get<string>(`SLACK_WEBHOOK_${channel}`);
      if (url) {
        this.webhookUrls.set(channel, url);
        this.logger.log(
          `Webhook for channel "${channel}" loaded successfully.`,
        );
      } else {
        this.logger.warn(
          `Webhook URL for channel "${channel}" not found in .env`,
        );
      }
    }
  }

  async sendMessage(channel: SlackChannel, message: string): Promise<void> {
    // 1. Obtiene la URL correcta del Map
    const webhookUrl = this.webhookUrls.get(channel);

    if (!webhookUrl) {
      this.logger.error(
        `Attempted to send a message to an unconfigured channel: "${channel}"`,
      );
      return; // O puedes lanzar un error: throw new Error(...)
    }

    // 2. Envía el mensaje usando la URL obtenida
    try {
      await axios.post(webhookUrl, { text: message });
    } catch (error) {
      this.logger.error(
        `Error sending Slack message to channel "${channel}"`,
        error.stack,
      );
    }
  }
}
