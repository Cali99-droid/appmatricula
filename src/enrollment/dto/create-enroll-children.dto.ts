import { ApiProperty } from '@nestjs/swagger';
import { CreateEnrollmentDto } from './create-enrollment.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEnrollChildrenDto {
  @ApiProperty({
    description: 'id of the student',
    nullable: false,
    type: [CreateEnrollmentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEnrollmentDto)
  //   @ExistId({ tableName: 'student' })
  enrrollments: CreateEnrollmentDto[];
}
