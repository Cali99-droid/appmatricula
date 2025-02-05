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
