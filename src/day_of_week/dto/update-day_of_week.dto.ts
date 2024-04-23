import { PartialType } from '@nestjs/swagger';
import { CreateDayOfWeekDto } from './create-day_of_week.dto';

export class UpdateDayOfWeekDto extends PartialType(CreateDayOfWeekDto) {}
