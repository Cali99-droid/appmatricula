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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
// import { Shift } from './enum/shift.enum';

import { SearchByClassroomDto } from './dto/search-by-classroom.dto';
import { Shift } from './enum/shift.enum';
import { AuthenticatedUser, Resource, Roles } from 'nest-keycloak-connect';

@ApiTags('Attendance')
@Controller('attendance')
@Resource('appcolegioae')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 201,
    description: 'Attendance was created success',
  })
  @ApiResponse({
    status: 400,
    description: 'some data is wrong, check message',
  })
  @Roles({
    roles: ['registro-asistencia'],
  })
  create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.attendanceService.create(createAttendanceDto, user);
  }
  // @Post('/prueba')
  // @ApiResponse({
  //   status: 201,
  //   description: 'Attendance was created success',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'some data is wrong, check message',
  // })
  // prueba(@Body() data: any) {
  //   return this.attendanceService.sendEmail(data);
  // }
  @Get('/last-records')
  @ApiOperation({
    summary: 'Get last five records of attendances',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'last five records of attendances',
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  @Roles({
    roles: [
      'reporte',
      'reporte-asistencia-sede',
      'reporte-asistencia-estudiante',
      'registro-asistencia',
    ],
  })
  findLastFiveRecords(@AuthenticatedUser() user: any) {
    return this.attendanceService.findLastFiveRecords(user);
  }
  // @Get()
  // findAll() {
  //   return this.attendanceService.findAll();
  // }
  @Get('/by-classroom')
  @ApiQuery({
    name: 'activityClassroomId',
    required: true,
    description: 'Id of the activityClassroom',
    type: Number,
  })
  @ApiQuery({
    name: 'typeSchedule',
    required: true,
    description: 'typeSchedule of the G or I',
    type: String,
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'StartDate of the attendace',
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'EndDate of the attendace',
    type: String,
  })
  @Roles({
    roles: [
      'reporte',
      'reporte-asistencia-sede',
      'reporte-asistencia-estudiante',
    ],
  })
  findByClassroom(@Query() searchByClassroomDto: SearchByClassroomDto) {
    return this.attendanceService.findByClassroom(searchByClassroomDto);
  }
  @Get('cron')
  testCron() {
    return this.attendanceService.markAbsentStudentsCronGeneral(Shift.Morning);
  }

  // @Get('upt')
  // testUpdate() {
  //   return this.attendanceService.updateAttendances();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.attendanceService.findOne(+id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(+id, updateAttendanceDto);
  }
  /**upd */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}
