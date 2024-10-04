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
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { Shift } from './enum/shift.enum';

@ApiTags('Attendance')
@Controller('attendance')
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
  @Auth('attendance-recorder', 'admin')
  create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @GetUser() user: User,
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
  @Auth('attendance-recorder', 'admin')
  findLastFiveRecords(@GetUser() user: User) {
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
  @Auth('attendance-recorder', 'admin', 'report', 'report-student')
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
