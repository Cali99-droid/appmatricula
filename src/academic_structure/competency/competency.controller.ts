import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompetencyService } from './competency.service';
import { CreateTeacherCompetencyDto } from './dto/create-teacher-assignment.dto';
import { UpdateTeacherCompetencyDto } from './dto/update-teacher-assignment.dto';
import { GetTeacherAssignmentDto } from './dto/get-teacher-assignment.dto';
import { RespGetTeacherAssignmentDto } from './dto/resp-get-teacher-assignment.dto';

@ApiTags('Competency')
@Controller('competency')
export class CompetencyController {
  constructor(private readonly competencyService: CompetencyService) {}

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
  ) {
    return this.competencyService.getAssignToTeacher(queryTeacherCompetencyDto);
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
}
