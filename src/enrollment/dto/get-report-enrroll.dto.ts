import { IsEnum, IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';
import { Status } from '../enum/status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class GetReportEnrrollDto {
  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @ExistId({ tableName: 'year' })
  yearId?: number;

  @ApiProperty({
    example: 1,
    description: 'id of the Campus Detail',
    nullable: false,
  })
  @ExistId({ tableName: 'CampusDetail' })
  campusId?: number;

  @ApiProperty({
    example: 1,
    description: 'id of the Grade',
    nullable: true,
  })
  @IsOptional()
  @ExistId({ tableName: 'Grade' })
  gradeId?: number;

  @ApiProperty({
    example: 'pre-registered',
    description: 'Status of ennroll',
    nullable: false,
    type: Status,
  })
  @IsEnum(Status)
  status?: Status;
}
