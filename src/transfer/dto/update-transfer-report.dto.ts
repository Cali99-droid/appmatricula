import { PartialType } from '@nestjs/swagger';
import { CreateTransferReportDto } from './create-transfer-report.dto';

export class UpdateTransferReportDto extends PartialType(
  CreateTransferReportDto,
) {}
