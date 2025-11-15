import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';
import { Issue } from '../entities/school_request.entity';

export class CreateSchoolRequestDto {
  @ApiProperty({
    example: 1,
    description: 'id of the children',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'student' })
  studentId: number;

  @ApiProperty({
    description: 'Asunto de la Solicitud',
    enum: Issue,
    example: Issue.DUPLICATE_CARNET,
  })
  @IsEnum(Issue, { message: 'El asunto no es válido' })
  issue: Issue;
}
