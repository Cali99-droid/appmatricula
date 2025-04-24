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
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompetencyService } from './competency.service';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { Competency } from './entities/competency.entity';

@ApiTags('Competency')
@Controller('competency')
export class CompetencyController {
  constructor(private readonly competencyService: CompetencyService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Competency was created',
    type: Competency,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for competency ',
  })
  create(@Body() createCompetencyDto: CreateCompetencyDto) {
    return this.competencyService.create(createCompetencyDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of competencys',
    type: [Competency],
  })
  findAll(@Query('courseId') courseId: string) {
    return this.competencyService.findAll(+courseId);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar grados específicos, puedes enviar el solo el id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detail competency',
    type: Competency,
  })
  @ApiResponse({
    status: 404,
    description: 'competency  not found ',
  })
  findOne(@Param('id') id: string) {
    return this.competencyService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Competency was updated',
    type: Competency,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for competency',
  })
  @ApiResponse({
    status: 404,
    description: 'competency  not found ',
  })
  update(
    @Param('id') id: string,
    @Body() updateCompetencyDto: UpdateCompetencyDto,
  ) {
    return this.competencyService.update(+id, updateCompetencyDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Competency was deleted' })
  @ApiResponse({
    status: 404,
    description: 'competency  not found ',
  })
  remove(@Param('id') id: string) {
    return this.competencyService.remove(+id);
  }
}
