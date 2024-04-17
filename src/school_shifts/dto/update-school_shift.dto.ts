import { PartialType } from '@nestjs/swagger';
import { CreateSchoolShiftDto } from './create-school_shift.dto';

export class UpdateSchoolShiftDto extends PartialType(CreateSchoolShiftDto) {}
