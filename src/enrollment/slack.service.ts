import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SlackService {
  private webhookUrl =
    'https://hooks.slack.com/services/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';

  async sendMessage(message: string) {
    await axios.post(this.webhookUrl, { text: message });
  }
}
