import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityCourseDto } from './activityCourse.dto';

export class UpdateActivityCourseDto extends PartialType(
  CreateActivityCourseDto,
) {}
