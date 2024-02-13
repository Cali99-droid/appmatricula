import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolShiftDto } from './create-school_shift.dto';

export class UpdateSchoolShiftDto extends PartialType(CreateSchoolShiftDto) {}
