import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsString } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateRoleDto {
  @ApiProperty({
    description: 'name of role',
    nullable: false,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Permissions ids',
    nullable: false,
    example: [1, 2, 3],
  })
  @IsArray()
  @IsInt({ each: true })
  @ExistId({ tableName: 'permission', isArray: true })
  permissions: number[];
}
