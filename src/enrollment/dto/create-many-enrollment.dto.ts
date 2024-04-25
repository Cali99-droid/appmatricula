import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';
import { Person } from 'src/person/entities/person.entity';

export class CreateManyEnrollmentDto {
  @ApiProperty({
    description: 'array of  persons',
    nullable: false,
    required: false,
    type: [Person],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePersonDto)
  persons: CreatePersonDto[];
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
