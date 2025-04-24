import { PartialType } from '@nestjs/swagger';
import { CreateTeacherCompetencyDto } from './create-teacher-assignment.dto';

export class UpdateTeacherCompetencyDto extends PartialType(
  CreateTeacherCompetencyDto,
) {}
