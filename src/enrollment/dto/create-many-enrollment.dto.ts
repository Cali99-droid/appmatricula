import { IsArray, IsNumber } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';
import { Person } from 'src/person/entities/person.entity';

export class CreateManyEnrollmentDto {
  @IsArray()
  persons: Person[];

  @IsNumber()
  @ExistId({ tableName: 'activity_classroom' })
  activityClassroomId: number;
}
