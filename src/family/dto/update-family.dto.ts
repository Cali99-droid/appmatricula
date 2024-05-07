import { PartialType } from '@nestjs/swagger';
import { CreateFamilyDto } from './create-family.dto';

export class UpdateFamilyDto extends PartialType(CreateFamilyDto) {}
