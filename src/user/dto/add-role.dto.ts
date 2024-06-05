import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNumber } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class AddRoleDto {
  // @IsNumber()
  // @IsOptional()

  @ApiProperty({
    description: 'user id',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'user' })
  userId: number;

  @ApiProperty({
    description: 'role id',
    nullable: false,
    example: [1, 2, 3],
  })
  @IsArray()
  @IsInt({ each: true })
  @ExistId({ tableName: 'role', isArray: true })
  rolesId: number[];
}
