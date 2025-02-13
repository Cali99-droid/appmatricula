import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';
import { UpdatePersonEnrollDto } from './update-person-enrroll.dto';

export class UpdateManyEnrollmentDto {
  @ApiProperty({
    description: 'array of  persons',
    nullable: false,
    required: false,
    type: [UpdatePersonEnrollDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePersonEnrollDto)
  persons: UpdatePersonEnrollDto[];
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
