import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';

import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { UpdateManyEnrollmentDto } from './dto/update-many-enrollment.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseEnrrollDto } from './dto/rs-enrolled-classroom.dto';
import { SearchEnrolledDto } from './dto/searchEnrollmet-dto';
import { SetRatifiedDto } from './dto/set-ratified.dto';
import { FindVacantsDto } from './dto/find-vacants.dto';
import { CreateAscentDto } from './dto/create-ascent.dto';
import { CreateEnrollChildrenDto } from './dto/create-enroll-children.dto';

import {
  AuthenticatedUser,
  Public,
  Resource,
  Roles,
} from 'nest-keycloak-connect';
import { CreateNewEnrollmentDto } from './dto/create-new-enrrol';
import { GetReportEnrrollDto } from './dto/get-report-enrroll.dto';
import { UpdateExpirationDto } from './dto/update-expiration.dto';
import { TransferStudentDto } from './dto/tranfer-student.dto';

@ApiTags('Enrollment')
@Controller('enrollment')
@Resource('client-test-appae')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'Array of enrrollment codes',
  })
  @ApiResponse({
    status: 400,
    description: 'those enrolled exceed the capacity of the classroom ',
  })
  @Roles({
    roles: ['administrador-colegio', 'padre-colegio', 'secretaria'],
  })
  create(
    @Body() createEnrollmentDto: CreateEnrollChildrenDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.enrollmentService.create(createEnrollmentDto, user);
  }

  @Put(':studentId')
  @ApiOperation({
    summary: 'Enroll a student',
  })
  @ApiResponse({
    status: 200,
    description: 'Current Enroll',
  })
  @ApiResponse({
    status: 400,
    description: 'The student does not have pre-registration ',
  })
  @Roles({
    roles: ['administrador-colegio', 'secretaria'],
  })
  enrrollStudent(@Param('studentId') studentId: number) {
    return this.enrollmentService.enrrollStudent(+studentId);
  }

  /** */
  @Post('many')
  @ApiResponse({
    status: 200,
    description: 'ActivityClassroom was created',
  })
  createMany(@Body() updateManyEnrollmentDto: UpdateManyEnrollmentDto) {
    return this.enrollmentService.createMany(updateManyEnrollmentDto);
  }

  @Get()
  findAll() {
    return this.enrollmentService.findAll();
  }

  @Post('new')
  @Public()
  createNewStudent(@Body() createNewEnrollmentDto: CreateNewEnrollmentDto) {
    return this.enrollmentService.createNewStudent(createNewEnrollmentDto);
  }

  @Post('search/new')
  searchNewStudent(@Body() createNewEnrollmentDto: CreateNewEnrollmentDto) {
    return this.enrollmentService.searchNewStudent(createNewEnrollmentDto);
  }

  @Get('activity-classroom')
  @ApiQuery({
    name: 'yearId',
    required: true,
    description: 'Id of the year',
    type: Number,
  })
  @ApiQuery({
    name: 'campusId',
    required: true,
    description: 'Id of the campus',
    type: Number,
  })
  @ApiQuery({
    name: 'levelId',
    required: false,
    description: 'Id of the level',
    type: Number,
  })
  @ApiOkResponse({
    status: 200,
    description: 'Array of enrolled per classroom',
    type: [ResponseEnrrollDto],
  })
  findByActivityClassroom(
    @Query() searchEnrolledDto: SearchEnrolledDto,
  ): Promise<ResponseEnrrollDto[]> {
    return this.enrollmentService.findByActivityClassroom(searchEnrolledDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.update(+id, updateEnrollmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enrollmentService.remove(+id);
  }

  @Delete('many/:activityClassroomId')
  @ApiResponse({
    status: 200,
    description: 'successful deletion',
  })
  @ApiResponse({
    status: 400,
    description: 'some data is wrong',
  })
  removeAllByActivityClassroom(
    @Param('activityClassroomId') activityClassroomId: number,
  ) {
    return this.enrollmentService.removeAllByActivityClassroom(
      +activityClassroomId,
    );
  }

  // @Get('get/aa')
  // getEnroll() {
  //   return this.enrollmentService.scripting();
  // }

  /**RATIFICACION */

  @Get('ratified/:yearId')
  getRatified(@Param('yearId', ParseIntPipe) yearId: number) {
    return this.enrollmentService.getRatified(yearId);
  }

  @Put('ratified/:code')
  @ApiQuery({
    name: 'desicion',
    required: false,
    type: String,
    description: 'desicion of enrrollment ratified must be (1 or another term)',
  })
  setRatified(@Param('code') code: string, @Query() query: SetRatifiedDto) {
    return this.enrollmentService.setRatified(query, code);
  }

  /**Ascents */

  @Post('config/ascent')
  createAscent(@Body() createAscentDto: CreateAscentDto) {
    return this.enrollmentService.createAscent(createAscentDto);
  }

  // @Get('config/ascent/:yearId')
  // getAscent(@Param('yearId', ParseIntPipe) yearId: number) {
  //   return this.enrollmentService.getAscent(yearId);
  // }

  /**Proceso de matricula */
  @Get('available/:studentId')
  @ApiOperation({
    summary: 'get availables classroom for enrroll',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Array of availables classrooms',
    //  type: [AvailableClassroom],
  })
  getAvailableClassrooms(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.enrollmentService.getAvailableClassrooms(studentId);
  }

  /**Proceso de matricula */
  @Get('available-transfer/:studentId')
  @ApiOperation({
    summary: 'get availables classroom for enrroll',
  })
  @ApiQuery({
    name: 'campusIdParam',
    required: true,
    description: 'campusIdParam of the year',
    type: Number,
  })
  @ApiOkResponse({
    status: 200,
    description: 'Array of availables classrooms',
    //  type: [AvailableClassroom],
  })
  getAvailableClassroomsToTransfers(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('campusIdParam') campusIdParam: number,
  ) {
    return this.enrollmentService.getAvailableClassroomsToTransfers(
      studentId,
      campusIdParam,
    );
  }
  @Get('vacants/:yearId')
  @ApiQuery({
    name: 'campusId',
    required: true,
    type: String,
    description: 'id of campus',
  })
  @ApiQuery({
    name: 'levelId',
    required: false,
    type: String,
    description: 'id of level',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail Vacants',
  })
  findVacants(
    @Param('yearId', ParseIntPipe) yearId: number,
    @Query() query: FindVacantsDto,
  ) {
    // return this.enrollmentService.getVacantsTest();

    return this.enrollmentService.getVacants(yearId, query);
    /**calculo para nuevos */
    //return this.enrollmentService.getVacantsAll(yearId, query);
  }

  @Get('vacants/:yearId/grade/:gradeId/campus/:campusId')
  @ApiOkResponse({
    status: 200,
    description: 'result of consult, hasVacants true or false',
    //  type: [AvailableClassroom],
  })
  @Public()
  findVacantsByGrade(
    @Param('yearId', ParseIntPipe) yearId: number,
    @Param('gradeId', ParseIntPipe) gradeId: number,
    @Param('campusId', ParseIntPipe) campusId: number,
  ) {
    // return this.enrollmentService.getVacantsTest();
    return this.enrollmentService.getVacantsGeneral(gradeId, yearId, campusId);
  }
  // @Put('change-section/:studentId/classroom/:activityClassroomId')
  // @ApiOkResponse({
  //   status: 200,
  //   description: 'updating section',
  //   //  type: [AvailableClassroom],
  // })
  // changeSection(
  //   @Param('studentId', ParseIntPipe) studentId: number,
  //   @Param('activityClassroomId', ParseIntPipe) activityClassroomId: number,
  //   @AuthenticatedUser() user: any,
  // ) {
  //   return this.enrollmentService.changeSection(
  //     studentId,
  //     activityClassroomId,
  //     user,
  //   );
  // }

  @Put('transfer-student/:studentId')
  @ApiOkResponse({
    status: 200,
    description: 'updating section',
    //  type: [AvailableClassroom],
  })
  transferStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() transferStudentDto: TransferStudentDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.enrollmentService.transferStudent(
      studentId,
      transferStudentDto.destinationSchool,
      user,
    );
  }

  @Get('get/status')
  @ApiResponse({
    status: 404,
    description: 'get status not found ',
  })
  getStatusEnrollmentByUser(@AuthenticatedUser() user: any) {
    return this.enrollmentService.getStatusEnrollmentByUser(user);
  }

  @Get('report')
  @ApiResponse({
    status: 404,
    description: 'get report not found ',
  })
  @ApiOkResponse({
    status: 200,
    description: 'result of consult',
    //  type: [AvailableClassroom],
  })
  getReport(@Query() getReportDto: GetReportEnrrollDto) {
    return this.enrollmentService.getReport(getReportDto);
  }

  @Put('update-expiration/:id')
  @ApiOkResponse({
    status: 200,
    description: 'updated enroll',
    //  type: [AvailableClassroom],
  })
  @ApiOkResponse({
    status: 400,
    description: 'error validation',
    //  type: [AvailableClassroom],
  })
  updateExpiration(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpirationDto: UpdateExpirationDto,
  ) {
    return this.enrollmentService.updateExpiration(id, updateExpirationDto);
  }

  // @Public()
  // @Get('script')
  // updateReservedScript() {
  //   // return this.enrollmentService.updateReservations();
  //   // return this.enrollmentService.updateReservedScript();
  //   return this.enrollmentService.updateSchoolScript();
  // }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentService.findOne(+id);
  }

  @Get('send-info-email/:level')
  @ApiOkResponse({
    status: 200,
    description: 'result of consult, hasVacants true or false',
    //  type: [AvailableClassroom],
  })
  @Public()
  sendInfoEmail(@Param('level', ParseIntPipe) level: number) {
    // return this.enrollmentService.getVacantsTest();
    return this.enrollmentService.sendInfoEmail(level);
  }

  @Get('test-info/test/uuui')
  @Public()
  test() {
    // return this.enrollmentService.getVacantsTest();
    return this.enrollmentService.generateDebt();
  }
}
