import { IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class SearchClassroomsDto {
  @IsOptional()
  @ExistId({ tableName: 'CampusDetail' })
  campusId?: string;
}
