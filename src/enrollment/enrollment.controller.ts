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
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CreateManyEnrollmentDto } from './dto/create-many-enrollment.dto';
import { ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseEnrrollDto } from './dto/rs-enrolled-classroom.dto';
import { SearchEnrolledDto } from './dto/searchEnrollmet-dto';

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
      activityClassroomId,
    );
  }
}
