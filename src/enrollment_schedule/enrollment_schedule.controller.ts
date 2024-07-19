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
import { EnrollmentScheduleService } from './enrollment_schedule.service';
import { CreateEnrollmentScheduleDto } from './dto/create-enrollment_schedule.dto';
import { UpdateEnrollmentScheduleDto } from './dto/update-enrollment_schedule.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnrollmentSchedule } from './entities/enrollment_schedule.entity';
@ApiTags('Enrollment Schedule')
@Controller('enrollment-schedule')
export class EnrollmentScheduleController {
  constructor(
    private readonly enrollmentScheduleService: EnrollmentScheduleService,
  ) {}

  @Post()
  create(@Body() createEnrollmentScheduleDto: CreateEnrollmentScheduleDto) {
    return this.enrollmentScheduleService.create(createEnrollmentScheduleDto);
  }

  @Get()
  @ApiQuery({
    name: 'yearId',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar cronograma de matricula, puedes enviar el id del año ',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Detail EnrollmentSchedule',
    type: EnrollmentSchedule,
  })
  findAll(@Query('yearId') yearId: number) {
    return this.enrollmentScheduleService.findAll(yearId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentScheduleService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentScheduleDto: UpdateEnrollmentScheduleDto,
  ) {
    return this.enrollmentScheduleService.update(
      +id,
      updateEnrollmentScheduleDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enrollmentScheduleService.remove(+id);
  }
}
