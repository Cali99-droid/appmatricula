import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { AuthService } from './auth/auth.service';
import { getToken } from './common/helpers/auth';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Middleware');
  constructor(private readonly authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // const token = getToken(req.headers.authorization);

    // if (!token) new UnauthorizedException();
    // try {
    //   const data: { user: any } = this.authService.verify(token);
    // } catch (error) {
    //   throw new UnauthorizedException(
    //     'Authorization type missing and/or empty Token',
    //   );
    // }

    return next();
  }
}
