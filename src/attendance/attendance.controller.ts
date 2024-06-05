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
import { Shift } from './enum/shift.enum';
import { SearchAttendanceDto } from './dto/search-attendace.dto';
// import { Shift } from './enum/shift.enum';

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
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

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
  findLastFiveRecords() {
    return this.attendanceService.findLastFiveRecords();
  }
  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }
  @Get('cron')
  testCron() {
    return this.attendanceService.markAbsentStudents(Shift.Afternoon);
  }

  // @Get('cron')
  // testCron() {
  //   return this.attendanceService.markAbsentStudents(Shift.A);
  // }
  @Get('search')
  @ApiQuery({
    name: 'yearId',
    required: false,
    description: 'Id of the year',
    type: Number,
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
  @ApiQuery({
    name: 'gradeId',
    required: false,
    description: 'Id of the grade',
    type: Number,
  })
  @ApiQuery({
    name: 'section',
    required: false,
    description: 'Section of the attendace',
    type: String,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'StartDate of the attendace',
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'EndDate of the attendace',
    type: String,
  })
  @ApiQuery({
    name: 'condition',
    required: false,
    description: 'Condition of the attendace',
    type: String,
  })
  @ApiQuery({
    name: 'full_name',
    required: false,
    description: 'Full Name of the attendace',
    type: String,
  })
  @ApiQuery({
    name: 'shift',
    required: false,
    description: 'Shift of the attendace',
    type: String,
  })
  findByParams(@Query() searchAttendanceDto: SearchAttendanceDto) {
    return this.attendanceService.findByParams(searchAttendanceDto);
  }
  @Get(':id')
  @ApiQuery({
    name: 'shift',
    required: true,
    description: 'Shift of the attendace',
    type: String,
  })
  findOne(@Param('id') id: string, @Query('shift') shift: Shift) {
    return this.attendanceService.findOne(+id, shift);
  }

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
