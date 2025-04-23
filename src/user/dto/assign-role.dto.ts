import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'role id',
    nullable: false,
    example: 'docente',
  })
  @IsString()
  roleName: string;
}
