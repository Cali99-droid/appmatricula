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
import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { Campus } from './entities/campus.entity';
@ApiTags('Campus')
@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Campus was created', type: Campus })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name or ugelLocalCode for campus ',
  })
  create(@Body() createCampusDto: CreateCampusDto) {
    return this.campusService.create(createCampusDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of campus',
    type: [Campus],
  })
  findAll() {
    return this.campusService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar grados específicos, puedes enviar el id ',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail campus', type: Campus })
  @ApiResponse({
    status: 404,
    description: 'campus  not found ',
  })
  findOne(@Param('id') id: string) {
    return this.campusService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Campus was updated', type: Campus })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name or ugelLocalCode for campus ',
  })
  @ApiResponse({
    status: 404,
    description: 'campus  not found ',
  })
  update(@Param('id') id: string, @Body() updateCampusDto: UpdateCampusDto) {
    return this.campusService.update(+id, updateCampusDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Campus was deleted' })
  @ApiResponse({
    status: 404,
    description: 'campus  not found ',
  })
  remove(@Param('id') id: string) {
    return this.campusService.remove(+id);
  }
}
