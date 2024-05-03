import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

import { Person } from 'src/person/entities/person.entity';
import { CreatePersonEnrollDto } from './create-person-enrroll.dto';

export class CreateManyEnrollmentDto {
  @ApiProperty({
    description: 'array of  persons',
    nullable: false,
    required: false,
    type: [Person],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePersonEnrollDto)
  persons: CreatePersonEnrollDto[];
  @ApiProperty({
    example: 1,
    description: 'Id activityClassroom for this enrollment',
    nullable: false,
    required: true,
  })
  @IsNumber()
  @ExistId({ tableName: 'activity_classroom' })
  activityClassroomId: number;
}
