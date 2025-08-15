import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { SlackChannel } from 'src/common/slack/slack.constants';
import { SlackService } from 'src/common/slack/slack.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,

    private readonly slackService: SlackService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const keyFromHeader = request.headers['x-api-key']; // O el nombre de header que elijas

    if (!keyFromHeader) {
      this.slackService.sendMessage(
        SlackChannel.TREASURY,
        'ERROR: API Key no encontrada en la cabecera.',
      );
      throw new UnauthorizedException('API Key no encontrada en la cabecera.');
    }

    const validApiKey = this.configService.get<string>('API_KEY');
    if (keyFromHeader !== validApiKey) {
      this.slackService.sendMessage(
        SlackChannel.TREASURY,
        'ERROR: API Key inválida.',
      );
      throw new UnauthorizedException('API Key inválida.');
    }

    return true;
  }
}
