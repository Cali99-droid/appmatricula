import { PartialType } from '@nestjs/swagger';
import { CreateSchoolRequestDto } from './create-school_request.dto';

export class UpdateSchoolRequestDto extends PartialType(CreateSchoolRequestDto) {}
