import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  // Delete,
  Query,
} from '@nestjs/common';
import { AcademicRecordsService } from './academic_records.service';
import { CreateAcademicRecordDto } from './dto/create-academic_record.dto';

import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { KeycloakTokenPayload } from 'src/auth/interfaces/keycloak-token-payload .interface';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AcademicRecordsResponseDto } from './dto/res-academic-record.dto';

@ApiTags('Academic-records')
@Controller('academic-records')
export class AcademicRecordsController {
  constructor(
    private readonly academicRecordsService: AcademicRecordsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear calificaciones',
    description: 'Crea calificaciones masivas',
  })
  @ApiResponse({
    status: 201,
    description: 'Creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Las competencias no pertenecen al curso o area',
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación  no encontrado',
  })
  @Roles({
    roles: ['docente'],
  })
  create(
    @Body() createAcademicRecordDto: CreateAcademicRecordDto,
    @AuthenticatedUser() payload: KeycloakTokenPayload,
  ) {
    return this.academicRecordsService.create(createAcademicRecordDto, payload);
  }

  @ApiOperation({
    summary: 'Obtener los estudiantes y sus calificaciones de una asignación',
    description:
      'Obtiene las lista de estudiantes con sus calificaciones segun las competencias del area y/o curso',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes y calificaciones',
    type: AcademicRecordsResponseDto,
  })
  @ApiQuery({
    name: 'bimesterId',
    required: true,
    description: 'Id of the bimester',
    type: Number,
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación o parámetro no encontrado',
  })
  @Roles({
    roles: ['docente'],
  })
  @Get(':academicRecordId')
  findAll(
    @Param('academicRecordId') academicRecordId: number,
    @Query('bimesterId') bimesterId: number,
  ): Promise<AcademicRecordsResponseDto> {
    return this.academicRecordsService.findAll(+academicRecordId, +bimesterId);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.academicRecordsService.findOne(+id);
  // }

  @Patch()
  @ApiOperation({
    summary: 'Actualizar calificaciones',
    description: 'Actualiza calificaciones masivas',
  })
  @ApiResponse({
    status: 201,
    description: 'Actualizado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Las competencias no pertenecen al curso o area',
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación  no encontrado',
  })
  @Roles({
    roles: ['docente'],
  })
  update(
    @Body() updateAcademicRecordDto: CreateAcademicRecordDto,
    @AuthenticatedUser() payload: KeycloakTokenPayload,
  ) {
    return this.academicRecordsService.update(updateAcademicRecordDto, payload);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.academicRecordsService.remove(+id);
  // }
}
