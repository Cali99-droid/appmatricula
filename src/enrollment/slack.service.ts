import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SlackService {
  constructor(private readonly configService: ConfigService) {}

  private webhookUrl = this.configService.getOrThrow('SLACK_WEBHOOK');

  async sendMessage(message: string) {
    try {
      await axios.post(this.webhookUrl, { text: message });
    } catch (error) {
      console.log(error);
    }
  }
}
