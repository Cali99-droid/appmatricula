import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CreateManyEnrollmentDto } from './dto/create-many-enrollment.dto';
import { ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseEnrrollDto } from './dto/rs-enrolled-classroom.dto';
import { SearchEnrolledDto } from './dto/searchEnrollmet-dto';
import { SetRatifiedDto } from './dto/set-ratified.dto';
import { FindVacantsDto } from './dto/find-vacants.dto';

@ApiTags('Enrollment')
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto);
  }
  @Post('many')
  @ApiResponse({
    status: 200,
    description: 'ActivityClassroom was created',
  })
  @ApiResponse({
    status: 400,
    description: 'those enrolled exceed the capacity of the classroom ',
  })
  createMany(@Body() createManyEnrollmentDto: CreateManyEnrollmentDto) {
    return this.enrollmentService.createMany(createManyEnrollmentDto);
  }

  @Get()
  findAll() {
    return this.enrollmentService.findAll();
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentService.findOne(+id);
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
    return this.enrollmentService.getVacants(yearId, query);
  }
}
