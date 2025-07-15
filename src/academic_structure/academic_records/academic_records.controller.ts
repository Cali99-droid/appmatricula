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
  HttpStatus,
} from '@nestjs/common';
import { AcademicRecordsService } from './academic_records.service';
import { CreateAcademicRecordDto } from './dto/create-academic_record.dto';

import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { KeycloakTokenPayload } from 'src/auth/interfaces/keycloak-token-payload .interface';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AcademicRecordsResponseDto } from './dto/res-academic-record.dto';
import { Response } from 'express';
import { ResReportAcademicRecord } from './dto/res-report-academic-record';

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
    description:
      'Descarga las boletas en un archivo comprimido de notas con todos los bimestres por aula',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo comprimido',
  })
  @Get('/download/report-grades/:activityClassroomId')
  @Roles({
    roles: ['cordinador-academico'],
  })
  async generateSchoolReport(
    @Res() res: Response,
    @Query('yearId') yearId: number,
    @Param('activityClassroomId') activityClassroomId: number,
  ) {
    await this.academicRecordsService.generateSchoolReport(
      +activityClassroomId,
      +yearId,
      res,
    );

    // try {
    //   const pdfBuffer = await this.academicRecordsService.generateSchoolReport(
    //     activityClassroomId,
    //     yearId,
    //   );

    //   res.set({
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': 'attachment; filename=informe_escolar.pdf',
    //     'Content-Length': pdfBuffer.length,
    //   });

    //   res.end(pdfBuffer);
    // } catch (error) {
    //   console.error('Error generating PDF:', error);
    //   res.status(500).send('Error al generar el PDF');
    // }
  }

  @ApiOperation({
    summary: 'Obtener reporte de notas por aula y bimestre',
    description:
      'Genera un reporte estructurado con las notas de todos los estudiantes de un aula específica en un bimestre determinado, agrupadas por áreas y competencias.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte generado exitosamente',
    type: ResReportAcademicRecord,
  })
  @ApiResponse({
    status: 404,
    description: 'Aula o bimestre no encontrado',
  })
  @ApiQuery({
    name: 'bimesterId',
    required: true,
    type: 'number',
    description: 'ID del bimestre académico',
    example: 2,
  })
  @ApiQuery({
    name: 'activityClassroomId',
    required: true,
    type: 'number',
    description: 'ID del aula',
    example: 1,
  })
  @Get('/classroom/report')
  @Roles({
    roles: ['cordinador-academico'],
  })
  getReportByClassroom(
    @Query('bimesterId') bimesterId: number,
    @Query('activityClassroomId') activityClassroomId: number,
  ) {
    // return this.academicRecordsService.getReportByLevelAndSection(
    //   +activityClassroomId,
    //   +bimesterId,
    // );
    return this.academicRecordsService.getReportByClassroom(
      +activityClassroomId,
      +bimesterId,
    );
  }

  @Get('/email/report')
  @Public()
  sendEmailReportCard() {
    // return this.academicRecordsService.sendEmailReportCard();
    return this.academicRecordsService.sendOneEmail();
  }

  /**EXCEL */
  @Get('report/level/:levelId/bimestre/:bimesterId/campus/:campusId/excel')
  async getAcademicRecordExcelByLevel(
    @Param('levelId') levelId: number,
    @Param('bimesterId') bimesterId: number,
    @Param('campusId') campusId: number,
    @Res() res: Response,
  ) {
    try {
      const buffer =
        await this.academicRecordsService.getReportByLevelAndSection(
          +levelId,
          +bimesterId,
          +campusId,
        );

      const fileName = `ReporteAcademico_Nivel_${levelId}_Bimestre_${bimesterId}_Sede_${campusId}.xlsx`;

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });

      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      // Manejo de errores
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error al generar el reporte', error: error.message });
    }
  }
}
