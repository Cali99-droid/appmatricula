import { PartialType } from '@nestjs/swagger';
import { CreateRatingsDto } from './create-ratings.dto';

export class UpdateRatingsDto extends PartialType(CreateRatingsDto) {}
