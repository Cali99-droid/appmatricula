import { PartialType } from '@nestjs/mapped-types';
import { CreateCampusDetailDto } from './create-campus_detail.dto';

export class UpdateCampusDetailDto extends PartialType(CreateCampusDetailDto) {}
