import { PartialType } from '@nestjs/swagger';
import { CreateTreasuryDto } from './create-treasury.dto';

export class UpdateTreasuryDto extends PartialType(CreateTreasuryDto) {}
