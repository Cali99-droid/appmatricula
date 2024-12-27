import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { DataDebtorsDto } from './data-debtors.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DataDebTorsArrayDto {
  @ApiProperty({
    description: 'Array with necesary data for save',
    nullable: false,
    type: [DataDebtorsDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataDebtorsDto)
  data: DataDebtorsDto[];
}
