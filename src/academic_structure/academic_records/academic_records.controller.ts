import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  // Delete,
  Query,
  Res,
} from '@nestjs/common';
import { AcademicRecordsService } from './academic_records.service';
import { CreateAcademicRecordDto } from './dto/create-academic_record.dto';

import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { KeycloakTokenPayload } from 'src/auth/interfaces/keycloak-token-payload .interface';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AcademicRecordsResponseDto } from './dto/res-academic-record.dto';
import { Response } from 'express';

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

  @ApiOperation({
    summary: 'Descargar boleta de notas',
    description: 'descarga la boleta de notas con todos los bimestres',
  })
  @Get('/download/report-grades/:studentId')
  async generateSchoolReport(
    @Res() res: Response,
    @Query('yearId') yearId: number,
    @Param('studentId') studentId: number,
  ) {
    try {
      const pdfBuffer = await this.academicRecordsService.generateSchoolReport(
        studentId,
        yearId,
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=informe_escolar.pdf',
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Error al generar el PDF');
    }
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.academicRecordsService.remove(+id);
  // }
}
