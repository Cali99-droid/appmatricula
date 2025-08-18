import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AcademicAssignmentService } from './academic_assignment.service';
import { CreateAcademicAssignmentDto } from './dto/create-academic_assignment.dto';
import { UpdateAcademicAssignmentDto } from './dto/update-academic_assignment.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { KeycloakTokenPayload } from 'src/auth/interfaces/keycloak-token-payload .interface';
import { AuthenticatedUser, Resource, Roles } from 'nest-keycloak-connect';
import { TeacherAssignmentResponseDto } from './dto/res-assignment.dto';

@ApiTags('Academic-assignment')
@Controller('academic-assignment')
@Resource('appcolegioae')
export class AcademicAssignmentController {
  constructor(
    private readonly academicAssignmentService: AcademicAssignmentService,
  ) {}

  @Post()
  create(@Body() createAcademicAssignmentDto: CreateAcademicAssignmentDto) {
    return this.academicAssignmentService.create(createAcademicAssignmentDto);
  }

  @Get()
  findAll(@Query('activityClassroomId') activityClassroomId: number) {
    return this.academicAssignmentService.findAll(+activityClassroomId);
  }

  @ApiOperation({
    summary: 'Obtener las asignaciones del docente',
    description:
      'Obtiene las asignaciones del docente por año, el docente se identifica por el token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de asignaciones',
    type: TeacherAssignmentResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @Get('teacher/:yearId')
  @Roles({
    roles: ['docente'],
  })
  findTeacherAssigments(
    @Param('yearId') yearId: number,
    @AuthenticatedUser() payload: KeycloakTokenPayload,
  ): Promise<TeacherAssignmentResponseDto[]> {
    return this.academicAssignmentService.findTeacherAssigments(
      yearId,
      payload,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicAssignmentService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAcademicAssignmentDto: UpdateAcademicAssignmentDto,
  ) {
    return this.academicAssignmentService.update(
      +id,
      updateAcademicAssignmentDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicAssignmentService.remove(+id);
  }
}
