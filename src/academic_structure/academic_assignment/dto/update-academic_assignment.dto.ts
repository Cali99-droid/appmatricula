import { PartialType } from '@nestjs/swagger';
import { CreateAcademicAssignmentDto } from './create-academic_assignment.dto';

export class UpdateAcademicAssignmentDto extends PartialType(CreateAcademicAssignmentDto) {}
