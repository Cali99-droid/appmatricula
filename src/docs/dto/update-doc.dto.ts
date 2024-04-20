import { PartialType } from '@nestjs/swagger';
import { CreateDocDto } from './create-doc.dto';

export class UpdateDocDto extends PartialType(CreateDocDto) {}
