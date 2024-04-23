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
import { DayOfWeekService } from './day_of_week.service';
import { CreateDayOfWeekDto } from './dto/create-day_of_week.dto';
import { UpdateDayOfWeekDto } from './dto/update-day_of_week.dto';
import {
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DayOfWeek } from './entities/day_of_week.entity';

@ApiTags('Day Of Week')
@Controller('day-of-week')
export class DayOfWeekController {
  constructor(private readonly dayOfWeekService: DayOfWeekService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'DayOfWeek was created',
    type: DayOfWeek,
  })
  create(@Body() createDayOfWeekDto: CreateDayOfWeekDto) {
    return this.dayOfWeekService.create(createDayOfWeekDto);
  }

  @Get()
  @ApiQuery({
    name: 'yearId',
    required: true,
    description: 'Id of the year',
    type: Number,
  })
  @ApiOkResponse({
    status: 200,
    description: 'Array of Holidays',
    type: [DayOfWeek],
  })
  @ApiResponse({
    status: 200,
    description: 'Detail DayOfWeek',
    type: DayOfWeek,
  })
  @ApiResponse({
    status: 404,
    description: 'DayOfWeek  not found ',
  })
  findAll(@Query('yearId') yearId: number) {
    return this.dayOfWeekService.findAll(yearId);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar años específicos, puedes enviar el id del DayOfWeek',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detail DayOfWeek',
    type: DayOfWeek,
  })
  @ApiResponse({
    status: 404,
    description: 'DayOfWeek not found ',
  })
  findOne(@Param('id') id: string) {
    return this.dayOfWeekService.findOne(+id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the DayOfWeek to update',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'DayOfWeek was update',
    type: DayOfWeek,
  })
  update(
    @Param('id') id: string,
    @Body() updateDayOfWeekDto: UpdateDayOfWeekDto,
  ) {
    return this.dayOfWeekService.update(+id, updateDayOfWeekDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'DayOfWeek was deleted' })
  @ApiResponse({
    status: 404,
    description: 'DayOfWeek not found ',
  })
  remove(@Param('id') id: string) {
    return this.dayOfWeekService.remove(+id);
  }
}
