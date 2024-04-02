import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { YearsService } from './years.service';
import { CreateYearDto } from './dto/create-year.dto';
import { UpdateYearDto } from './dto/update-year.dto';
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Year } from './entities/year.entity';
@ApiTags('Year')
@Controller('years')
export class YearsController {
  constructor(private readonly yearsService: YearsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Year was created', type: Year })
  @ApiResponse({
    status: 400,
    description: 'endDate must be after startDate or Duplicate name for year ',
  })
  create(@Body() createYearDto: CreateYearDto) {
    return this.yearsService.create(createYearDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of years',
    type: [Year],
  })
  findAll() {
    return this.yearsService.findAll();
  }
  // TODO revisar utilidad
  @Get('year/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar el años específico, puedes enviar el id del año ',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail Year', type: Year })
  @ApiResponse({
    status: 404,
    description: 'years  not found ',
  })
  async findAllByYear(@Param('id') id: string) {
    return this.yearsService.findAllByYear(+id);
  }
  @Get(':term')
  @ApiParam({
    name: 'term',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar años específicos, puedes enviar el id o el nombre el año',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail year', type: Year })
  @ApiResponse({
    status: 404,
    description: 'year  not found ',
  })
  findOne(@Param('term') term: string) {
    return this.yearsService.findOne(term);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Year was updated', type: Year })
  @ApiResponse({
    status: 400,
    description: 'endDate must be after startDate or Duplicate name for year ',
  })
  @ApiResponse({
    status: 404,
    description: 'year  not found ',
  })
  update(@Param('id') id: string, @Body() updateYearDto: UpdateYearDto) {
    return this.yearsService.update(+id, updateYearDto);
  }

  @ApiResponse({ status: 200, description: 'Year was deleted' })
  @ApiResponse({
    status: 404,
    description: 'year  not found ',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.yearsService.remove(+id);
  }
}
