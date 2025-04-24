import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCompetencyDto {
  @ApiProperty({
    description: 'Name of the competency',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'true',
    description: 'status of year, must be true or false',
    nullable: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
