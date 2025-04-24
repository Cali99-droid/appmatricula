import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Area } from './entities/area.entity';

@ApiTags('Area')
@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Area was created', type: Area })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for area ',
  })
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areaService.create(createAreaDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of areas',
    type: [Area],
  })
  findAll() {
    return this.areaService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar grados específicos, puedes enviar el solo el id',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail area', type: Area })
  @ApiResponse({
    status: 404,
    description: 'area  not found ',
  })
  findOne(@Param('id') id: string) {
    return this.areaService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Area was updated', type: Area })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for area',
  })
  @ApiResponse({
    status: 404,
    description: 'area  not found ',
  })
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areaService.update(+id, updateAreaDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Area was deleted' })
  @ApiResponse({
    status: 404,
    description: 'area  not found ',
  })
  remove(@Param('id') id: string) {
    return this.areaService.remove(+id);
  }
}
