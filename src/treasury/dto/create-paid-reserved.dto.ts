import { IsEnum } from 'class-validator';
import { FamilyRole } from 'src/common/enum/family-role.enum';
import { ExistId } from 'src/common/validation/exist-id';

export class CreatePaidReserved {
  @ExistId({ tableName: 'student' })
  studentId?: number;

  @IsEnum(FamilyRole)
  resp: FamilyRole;
}
