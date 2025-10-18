import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransfersService } from './transfer.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { KeycloakTokenPayload } from 'src/auth/interfaces/keycloak-token-payload .interface';

import { UpdateTransferMeetingDto } from './dto/update-transfer-meeting.dto';
import { CreateTransferMeetingDto } from './dto/create-transfer-meeting.dto';
import { UpdateTransferReportDto } from './dto/update-transfer-report.dto';
import { CreateTransferReportDto } from './dto/create-transfer-report.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchTranfersDto } from './dto/search-tranfer.dto';
import { CreateRequestTrackingDto } from './dto/create-request-tracking.dto';
import { MeetingDto } from './dto/res-all-meeting.dto';

@ApiTags('Transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva solicitud' })
  @ApiResponse({
    status: 201,
    description: 'Solicitud creada exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  create(
    @Body() createTransferDto: CreateTransferDto,
    @AuthenticatedUser() user: KeycloakTokenPayload,
  ) {
    return this.transfersService.create(createTransferDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos las solicitudes de traslado',
  })
  @ApiResponse({ status: 200, description: 'Lista de Solicitudes.' })
  @ApiQuery({
    name: 'status',
    required: true,
    description: 'Status of the request',
    // type: string,
  })
  @ApiQuery({
    name: 'campusId',
    required: false,
    description: 'Id of the campus',
    type: Number,
  })
  @ApiQuery({
    name: 'levelId',
    required: false,
    description: 'Id of the level',
    type: Number,
  })
  @Roles({
    roles: ['list-transfer-request'],
  })
  getAllRequests(
    @Query() query: SearchTranfersDto,
    @AuthenticatedUser() user: KeycloakTokenPayload,
  ) {
    return this.transfersService.getAllRequests(query, user);
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Obtener detallet de una  solicitud de traslado',
  })
  @ApiResponse({ status: 200, description: 'Lista de Solicitudes.' })
  getOneRequests(@Param('id') id: number) {
    return this.transfersService.getOneRequest(+id);
  }
  /**CONBSULTAR STATUS */
  @Get('/status/:requestCode')
  @ApiOperation({ summary: 'Obtener una solicitud por su código' })
  @ApiResponse({
    status: 200,
    description: 'Ruta de la solicitud',
    type: [CreateRequestTrackingDto],
  })
  @Public()
  getStatusByCode(@Param('requestCode') requestCode: string) {
    return this.transfersService.getStatusByCode(requestCode);
  }

  /**MEETING */
  @Post('meetings')
  @ApiOperation({ summary: 'Crear un nuevo agendamiento de reunión' })
  @ApiResponse({
    status: 201,
    description: 'Agendamiento creado exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @Roles({
    roles: ['psicologia-traslados', 'cordinador-academico'],
  })
  createTransferMeeting(
    @Body() createDto: CreateTransferMeetingDto,
    @AuthenticatedUser() user: KeycloakTokenPayload,
  ) {
    return this.transfersService.createTransferMeeting(createDto, user);
  }

  @Get('meetings/request/:requestId')
  @ApiOperation({
    summary: 'Obtener todos los agendamientos de una solicitud de traslado',
  })
  @ApiResponse({ status: 200, description: 'Lista de agendamientos.' })
  findAllTransferMeetingByRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @AuthenticatedUser() user: KeycloakTokenPayload,
  ) {
    return this.transfersService.findAllTransferMeetingByRequest(
      requestId,
      user,
    );
  }

  @Get('meetings/:id')
  @ApiOperation({ summary: 'Obtener un agendamiento por su ID' })
  @ApiResponse({ status: 200, description: 'Detalles del agendamiento.' })
  @ApiResponse({ status: 404, description: 'Agendamiento no encontrado.' })
  findOneTransferMeeting(@Param('id', ParseIntPipe) id: number) {
    return this.transfersService.findOneTransferMeeting(id);
  }

  @Get('all/my-meetings')
  @ApiOperation({ summary: 'Obtener todos los agendamientos' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del agendamiento.',
    type: MeetingDto,
  })
  @ApiResponse({ status: 404, description: 'Agendamiento no encontrado.' })
  findMeetingsByUser(@AuthenticatedUser() user: KeycloakTokenPayload) {
    return this.transfersService.findMeetingsByUser(user);
  }
  @Patch('meetings/:id')
  @ApiOperation({ summary: 'Actualizar un agendamiento existente' })
  @ApiResponse({ status: 200, description: 'Agendamiento actualizado.' })
  @ApiResponse({ status: 404, description: 'Agendamiento no encontrado.' })
  updateTransferMeeting(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTransferMeetingDto,
  ) {
    return this.transfersService.updateTransferMeeting(id, updateDto);
  }

  @Delete('/meetings:id')
  @ApiOperation({ summary: 'Eliminar un agendamiento' })
  @ApiResponse({ status: 200, description: 'Agendamiento eliminado.' })
  @ApiResponse({ status: 404, description: 'Agendamiento no encontrado.' })
  removeTransferMeeting(@Param('id', ParseIntPipe) id: number) {
    return this.transfersService.removeTransferMeeting(id);
  }

  /**REPORTS */
  @Post('report')
  @ApiOperation({ summary: 'Crear y subir un nuevo informe de traslado' })
  @ApiResponse({ status: 201, description: 'Informe creado exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o pre-condición no cumplida.',
  })
  @Roles({
    roles: ['psicologia-traslados', 'cordinador-academico'],
  })
  createTransferReport(
    @Body() createDto: CreateTransferReportDto,
    @AuthenticatedUser() user: KeycloakTokenPayload,
  ) {
    return this.transfersService.createTransferReport(createDto, user);
  }

  @Get('report/request/:requestId')
  @ApiOperation({
    summary: 'Obtener todos los informes de una solicitud de traslado',
  })
  findAllByRequestTransferReport(
    @Param('requestId', ParseIntPipe) requestId: number,
    @AuthenticatedUser() user: KeycloakTokenPayload,
  ) {
    return this.transfersService.findAllByRequestTransferReport(
      requestId,
      user,
    );
  }

  @Get('report/:id')
  @ApiOperation({ summary: 'Obtener un informe por su ID' })
  @ApiResponse({ status: 404, description: 'Informe no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transfersService.findOneTransferReport(id);
  }

  @Patch('report/:id')
  @ApiOperation({ summary: 'Actualizar un informe existente' })
  @ApiResponse({ status: 404, description: 'Informe no encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTransferReportDto,
  ) {
    return this.transfersService.updateTransferReport(id, updateDto);
  }

  @Delete('report/:id')
  @ApiOperation({ summary: 'Eliminar un informe' })
  @ApiResponse({ status: 404, description: 'Informe no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transfersService.removeTransferReport(id);
  }

  /**ACTA UPLOAD */
  @Post(':id/upload-agreement-act')
  @ApiOperation({
    summary: 'Sube el acta de conformidad y finaliza el traslado',
  })
  @UseInterceptors(FileInterceptor('file')) // Para manejar la subida de archivos
  finalizeTransfer(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @AuthenticatedUser() user: KeycloakTokenPayload,
  ) {
    return this.transfersService.finalizeWithAct(id, file.buffer, user);
  }
}
