import { PartialType } from '@nestjs/swagger';
import { CreateCompetencyDto } from './create-competency.dto';

export class UpdateCompetencyDto extends PartialType(CreateCompetencyDto) {}
