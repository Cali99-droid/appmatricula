import { PartialType } from '@nestjs/swagger';
import { CreateYearDto } from './create-year.dto';

export class UpdateYearDto extends PartialType(CreateYearDto) {}
