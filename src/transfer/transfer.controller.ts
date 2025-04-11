import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Transfer } from './entities/transfer.entity';
import { Resource } from 'nest-keycloak-connect';
@ApiTags('Transfer')
@Controller('transfers')
@Resource(Transfer.name)
export class TransferController {
  constructor(private readonly service: TransferService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Transfer was created',
    type: CreateTransferDto,
  })
  create(@Body() createTransferDto: CreateTransferDto) {
    return this.service.create(createTransferDto);
  }

  @Get('by-classroom/:activityClassroomId')
  @ApiOkResponse({
    status: 200,
    description: 'Transfer of classroom',
    type: Transfer,
  })
  findAll(@Param('activityClassroomId') activityClassroomId: string) {
    return this.service.findAllByActivityClassroom(+activityClassroomId);
  }

  // TODO revisar utilidad
  @Get(':id')
  @ApiOperation({
    summary: 'Detail of Transfer',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar el años específico, puedes enviar el id del año ',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail Transfer', type: Transfer })
  @ApiResponse({
    status: 404,
    description: 'transfers  not found ',
  })
  async findAllByTransfer(@Param('id') id: string) {
    return this.service.findAllByTransfer(+id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Transfer was updated',
    type: Transfer,
  })
  @ApiResponse({
    status: 400,
    description:
      'endDate must be after startDate or Duplicate name for transfer ',
  })
  @ApiResponse({
    status: 404,
    description: 'transfer  not found ',
  })
  update(
    @Param('id') id: string,
    @Body() updateTransferDto: UpdateTransferDto,
  ) {
    return this.service.update(+id, updateTransferDto);
  }

  @ApiResponse({ status: 200, description: 'Transfer was deleted' })
  @ApiResponse({
    status: 404,
    description: 'transfer  not found ',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
