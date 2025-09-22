// src/transfer-meetings/dto/update-transfer-meeting.dto.ts

import { PartialType } from '@nestjs/swagger';
import { CreateTransferMeetingDto } from './create-transfer-meeting.dto';

export class UpdateTransferMeetingDto extends PartialType(
  CreateTransferMeetingDto,
) {}
