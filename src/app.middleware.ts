import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { AuthService } from './auth/auth.service';
import { getToken } from './common/helpers/auth';
import { handleDBExceptions } from './common/helpers/handleDBException';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Middleware');
  constructor(private readonly authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = getToken(req.headers.authorization);

    if (!token)
      return res.status(401).json({
        statusCode: '401',
        error: 'Usuario No autorizado',
        message: 'Falta tipo de Autorización y/o Token vació',
      });
    try {
      const data: { user: any } = this.authService.verify(token);
      console.log('la data', data);
    } catch (error) {
      throw new UnauthorizedException('token not valid');
    }

    return next();
  }
}
