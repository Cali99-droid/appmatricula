import { PartialType } from '@nestjs/mapped-types';
import { CreatePhaseDto } from './create-phase.dto';

export class UpdatePhaseDto extends PartialType(CreatePhaseDto) {}
