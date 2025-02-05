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
