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
import { EnrollmentScheduleService } from './enrollment_schedule.service';
import { CreateEnrollmentScheduleDto } from './dto/create-enrollment_schedule.dto';
import { UpdateEnrollmentScheduleDto } from './dto/update-enrollment_schedule.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnrollmentSchedule } from './entities/enrollment_schedule.entity';
import { FindCronogramasDto } from './dto/find-schedule.dto';
import { TypeEnrollmentSchedule } from './enum/type-enrollment_schedule';
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
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha de inicio del cronograma',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha final del cronograma',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TypeEnrollmentSchedule,
    description: 'Tipo de cronograma',
  })
  @ApiQuery({
    name: 'currentDate',
    required: false,
    type: String,

    description: 'Fecha actual para filtrar cronogramas en curso',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Nombre del cronograma',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail EnrollmentSchedule',
    type: EnrollmentSchedule,
  })
  findAll(@Query() query: FindCronogramasDto) {
    return this.enrollmentScheduleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentScheduleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentScheduleDto: UpdateEnrollmentScheduleDto,
  ) {
    return this.enrollmentScheduleService.update(
      id,
      updateEnrollmentScheduleDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentScheduleService.remove(id);
  }
}
