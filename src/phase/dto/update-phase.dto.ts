import { PartialType } from '@nestjs/swagger';
import { CreatePhaseDto } from './create-phase.dto';

export class UpdatePhaseDto extends PartialType(CreatePhaseDto) {}
