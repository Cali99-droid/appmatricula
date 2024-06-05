import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!permissions) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    const userR = req.user as User;
    if (!userR) throw new NotFoundException('User not found');
    const user = await this.userRepository.findOne({
      where: { id: userR.id },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userPermissions = user.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.name),
    );
    console.log(
      permissions.some((permission) => userPermissions.includes(permission)),
    );
    return permissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }
}
