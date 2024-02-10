import { PartialType } from '@nestjs/mapped-types';
import { CreateCampusXLevelGradeDto } from './create-campus_x_level_grade.dto';

export class UpdateCampusXLevelGradeDto extends PartialType(
  CreateCampusXLevelGradeDto,
) {}
