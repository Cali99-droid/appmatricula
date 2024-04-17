import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Holiday } from './entities/holiday.entity';

@ApiTags('Holiday')
@Controller('holiday')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Holiday was created',
    type: Holiday,
  })
  @ApiResponse({
    status: 400,
    description: 'date must be within the year range',
  })
  create(@Body() createHolidayDto: CreateHolidayDto) {
    return this.holidayService.create(createHolidayDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of Holidays',
    type: [Holiday],
  })
  @ApiResponse({ status: 200, description: 'Detail Holiday', type: Holiday })
  @ApiResponse({
    status: 404,
    description: 'Holidays  not found ',
  })
  findAll() {
    return this.holidayService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar años específicos, puedes enviar el id del holiday',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail Holiday', type: Holiday })
  @ApiResponse({
    status: 404,
    description: 'Holiday not found ',
  })
  findOne(@Param('id') id: string) {
    return this.holidayService.findOne(+id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the holiday to update',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Holiday was update',
    type: Holiday,
  })
  @ApiResponse({
    status: 400,
    description: 'date must be within the year range',
  })
  update(@Param('id') id: string, @Body() updateHolidayDto: UpdateHolidayDto) {
    return this.holidayService.update(+id, updateHolidayDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Holiday was deleted' })
  @ApiResponse({
    status: 404,
    description: 'Holiday not found ',
  })
  remove(@Param('id') id: string) {
    return this.holidayService.remove(+id);
  }
}
