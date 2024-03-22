import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';
import { Person } from 'src/person/entities/person.entity';

export class CreateManyEnrollmentDto {
  @ApiProperty({
    description: 'array of  Id levels for this campus',
    nullable: false,
    required: false,
    type: [Person],
  })
  @IsArray()
  persons: Person[];
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
