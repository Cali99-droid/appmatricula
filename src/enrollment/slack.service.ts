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
