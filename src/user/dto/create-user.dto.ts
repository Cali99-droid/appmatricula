import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateUserDto {
  @ApiProperty({
    description: 'email of the user',
    nullable: false,
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'password of the user',
    nullable: false,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({
    description: 'password of the user',
    nullable: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'role id',
    nullable: false,
    example: [1, 2, 3],
  })
  @IsArray()
  @IsInt({ each: true })
  @ExistId({ tableName: 'role', isArray: true })
  rolesIds: number[];

  @ApiProperty({
    description: 'campus id',
    nullable: false,
    example: [1, 2, 3],
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  @ExistId({ tableName: 'campus_detail', isArray: true })
  campusDetailsIds?: number[];

  @ApiProperty({
    description: 'activity_classroom id, aulas a asignar al user',
    nullable: false,
    example: [1, 2, 3],
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  @ExistId({ tableName: 'activity_classroom', isArray: true })
  activityClassroomIds?: number[];
}
