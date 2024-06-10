import { UseGuards, applyDecorators } from '@nestjs/common';
// import { ValidRoles } from '../interfaces/valid-roles';
// import { RoleProtected } from './role-protected.decorator';
// import { UserRoleGuard } from '../guards/user-role/user-role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from './permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';

/**must be array of Permissions */
export function Auth(...roles: string[]) {
  return applyDecorators(
    // RoleProtected(...roles),
    Permissions(...roles),
    UseGuards(AuthGuard('jwt'), PermissionsGuard),
  );
}
