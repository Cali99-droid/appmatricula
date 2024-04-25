import { PartialType } from '@nestjs/swagger';
import { CreateActivityClassroomDto } from './create-activity_classroom.dto';

export class UpdateActivityClassroomDto extends PartialType(
  CreateActivityClassroomDto,
) {}
