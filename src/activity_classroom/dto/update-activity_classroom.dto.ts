import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityClassroomDto } from './create-activity_classroom.dto';

export class UpdateActivityClassroomDto extends PartialType(CreateActivityClassroomDto) {}
