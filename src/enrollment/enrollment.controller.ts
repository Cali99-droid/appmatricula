import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CreateManyEnrollmentDto } from './dto/create-many-enrollment.dto';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseEnrrollDto } from './dto/rs-enrolled-classroom.dto';

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

  @Get('activity-classroom/:id')
  @ApiOkResponse({
    status: 200,
    description: 'Array of enrolled per classroom',
    type: [ResponseEnrrollDto],
  })
  findByActivityClassroom(
    @Param('id') id: string,
  ): Promise<ResponseEnrrollDto[]> {
    return this.enrollmentService.findByActivityClassroom(+id);
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
}
