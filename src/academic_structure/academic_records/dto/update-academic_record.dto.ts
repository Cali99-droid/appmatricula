import { PartialType } from '@nestjs/swagger';
import { CreateAcademicRecordDto } from './create-academic_record.dto';

export class UpdateAcademicRecordDto extends PartialType(
  CreateAcademicRecordDto,
) {}
