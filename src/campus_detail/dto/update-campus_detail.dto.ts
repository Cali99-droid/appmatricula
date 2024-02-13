import { PartialType } from '@nestjs/swagger';
import { CreateCampusDetailDto } from './create-campus_detail.dto';

export class UpdateCampusDetailDto extends PartialType(CreateCampusDetailDto) {}
