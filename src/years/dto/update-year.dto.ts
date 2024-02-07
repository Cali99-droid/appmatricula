import { PartialType } from '@nestjs/mapped-types';
import { CreateYearDto } from './create-year.dto';

export class UpdateYearDto extends PartialType(CreateYearDto) {}
