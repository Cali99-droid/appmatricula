import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';

import { DataParentDto } from './data-parent.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DataParentArrayDto {
  @ApiProperty({
    description: 'Array with necesary data for save',
    nullable: false,
    type: [DataParentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataParentDto)
  data: DataParentDto[];
}
