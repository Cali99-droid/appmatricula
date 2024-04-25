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
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import {
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Schedule } from './entities/schedule.entity';
import { SearchSheduleDto } from './dto/search-schedule.dto';

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Schedule was created',
    type: Schedule,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for Schedule ',
  })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  @ApiQuery({
    name: 'yearId',
    required: true,
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
  @ApiOkResponse({
    status: 200,
    description: 'Array of Schedule',
    type: [Schedule],
  })
  findAll(@Query() searchSheduleDtoDto: SearchSheduleDto) {
    return this.scheduleService.findAll(searchSheduleDtoDto);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar Schedule por el id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detail Schedule',
    type: Schedule,
  })
  @ApiResponse({
    status: 404,
    description: 'Schedule  not found ',
  })
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Schedule was updated',
    type: Schedule,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for Schedule ',
  })
  @ApiResponse({
    status: 404,
    description: 'Schedule  not found ',
  })
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(+id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Schedule was deleted' })
  @ApiResponse({
    status: 404,
    description: 'Schedule  not found ',
  })
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(+id);
  }
}
