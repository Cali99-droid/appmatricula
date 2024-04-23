import { PartialType } from '@nestjs/swagger';
import { CreateBimesterDto } from './create-bimester.dto';

export class UpdateBimesterDto extends PartialType(CreateBimesterDto) {}
