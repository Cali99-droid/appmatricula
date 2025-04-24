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
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompetencyService } from './competency.service';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { Competency } from './entities/competency.entity';

import { CreateTeacherCompetencyDto } from './dto/create-teacher-assignment.dto';
import { UpdateTeacherCompetencyDto } from './dto/update-teacher-assignment.dto';
import { GetTeacherAssignmentDto } from './dto/get-teacher-assignment.dto';
import { RespGetTeacherAssignmentDto } from './dto/resp-get-teacher-assignment.dto';
import { AuthenticatedUser } from 'nest-keycloak-connect';

@ApiTags('Competency')
@Controller('competency')
export class CompetencyController {
  constructor(private readonly competencyService: CompetencyService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Competency was created',
    type: Competency,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for competency ',
  })
  create(@Body() createCompetencyDto: CreateCompetencyDto) {
    return this.competencyService.create(createCompetencyDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of competencys',
    type: [Competency],
  })
  findAll(@Query('courseId') courseId: string) {
    console.log('savasv');
    return this.competencyService.findAll(+courseId);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Competency was updated',
    type: Competency,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for competency',
  })
  @ApiResponse({
    status: 404,
    description: 'competency  not found ',
  })
  update(
    @Param('id') id: string,
    @Body() updateCompetencyDto: UpdateCompetencyDto,
  ) {
    return this.competencyService.update(+id, updateCompetencyDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Competency was deleted' })
  @ApiResponse({
    status: 404,
    description: 'competency  not found ',
  })
  remove(@Param('id') id: string) {
    return this.competencyService.remove(+id);
  }

  // ** COMPETENCIAS POR DOCENTE */
  // @Roles({
  //   roles: ['registro-asistencia'],
  // })
  @Get('teacher-assignments')
  @ApiResponse({
    status: 201,
    description: 'array asignments',
    type: RespGetTeacherAssignmentDto,
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, dont exists user or activity classroom id',
  })
  getAssignToTeacher(
    @Query() queryTeacherCompetencyDto: GetTeacherAssignmentDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.competencyService.getAssignToTeacher(
      queryTeacherCompetencyDto,
      user,
    );
  }

  @ApiResponse({
    status: 201,
    description: 'successfull created',
  })
  @Post('teacher-assignments')
  assignToTeacher(
    @Body() createTeacherCompetencyDto: CreateTeacherCompetencyDto,
  ) {
    return this.competencyService.assignToTeacher(createTeacherCompetencyDto);
  }

  @ApiResponse({
    status: 200,
    description: 'successfull updated',
  })
  @Patch('teacher-assignments/:id')
  updateAssignToTeacher(
    @Param('id') id: string,
    @Body() updateTeacherCompetencyDto: UpdateTeacherCompetencyDto,
  ) {
    return this.competencyService.updateAssignToTeacher(
      +id,
      updateTeacherCompetencyDto,
    );
  }

  @ApiResponse({
    status: 200,
    description: 'successfull deleted',
  })
  @Delete('teacher-assignments/:id')
  deleteAssignToTeacher(@Param('id') id: string) {
    return this.competencyService.deleteAssignToTeacher(+id);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar grados específicos, puedes enviar el solo el id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detail competency',
    type: Competency,
  })
  @ApiResponse({
    status: 404,
    description: 'competency  not found ',
  })
  findOne(@Param('id') id: string) {
    console.log('dsbhsdnb');
    return this.competencyService.findOne(+id);
  }
}
