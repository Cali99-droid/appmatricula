import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DownloadConstancyQueryDto {
  @ApiProperty({
    description: 'Id del papa del estudiante que saldra la constancia',
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  parentId: number;
}
