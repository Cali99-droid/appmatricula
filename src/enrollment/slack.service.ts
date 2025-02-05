import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SlackService {
  private webhookUrl =
    'https://hooks.slack.com/services/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';

  async sendMessage(message: string) {
    try {
      await axios.post(this.webhookUrl, { text: message });
    } catch (error) {
      console.log(error);
    }
  }
}
