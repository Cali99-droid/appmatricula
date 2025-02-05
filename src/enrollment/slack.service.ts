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
