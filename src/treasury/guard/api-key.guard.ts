import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SlackChannel } from 'src/common/slack/slack.constants';
import { SlackService } from 'src/common/slack/slack.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly SYSTEM_USER_ID = 912;
  constructor(
    private readonly configService: ConfigService,

    private readonly slackService: SlackService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    try {
      const systemUser = await this.userService.findOne(this.SYSTEM_USER_ID);
      if (!systemUser) {
        throw new Error('Usuario de sistema no encontrado');
      }
      request.user = systemUser; // <-- ¡Aquí está la magia!
    } catch (error) {
      console.error('Error al adjuntar el usuario de sistema:', error);
      throw new UnauthorizedException(
        'No se pudo verificar la identidad del sistema.',
      );
    }

    return true;
  }
}
