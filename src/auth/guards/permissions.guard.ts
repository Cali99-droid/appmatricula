import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (permissions.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    const userR = req.user as User;

    if (!userR) throw new NotFoundException('User not found');
    const user = await this.userRepository.findOne({
      where: { email: userR.email },
      // relations: {
      //   roles: {
      //     permissions: true,
      //   },
      // },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // const userPermissions = user.roles.flatMap((role) =>
    //   role.permissions.map((permission) => permission.name),
    // );

    return true;
  }
}
