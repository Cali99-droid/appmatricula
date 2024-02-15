import { PartialType } from '@nestjs/swagger';
import { CreateCampusXLevelDto } from './create-campus_x_level.dto';

export class UpdateCampusXLevelDto extends PartialType(CreateCampusXLevelDto) {}
