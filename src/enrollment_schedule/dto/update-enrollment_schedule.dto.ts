import { PartialType } from '@nestjs/swagger';
import { CreateEnrollmentScheduleDto } from './create-enrollment_schedule.dto';

export class UpdateEnrollmentScheduleDto extends PartialType(
  CreateEnrollmentScheduleDto,
) {}
