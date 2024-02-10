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
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { Level } from './entities/level.entity';

@ApiTags('Level')
@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Level was created', type: Level })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for level or duplicate modularCode',
  })
  create(@Body() createLevelDto: CreateLevelDto) {
    return this.levelService.create(createLevelDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of levels',
    type: [Level],
  })
  findAll() {
    return this.levelService.findAll();
  }

  @Get(':term')
  @ApiParam({
    name: 'term',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar niveles específicos, puedes enviar el id, codigo modular o el nombre del nivel',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail level', type: Level })
  @ApiResponse({
    status: 404,
    description: 'level  not found ',
  })
  findOne(@Param('term') term: string) {
    return this.levelService.findOne(term);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Level was updated', type: Level })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for level or duplicate modularCode',
  })
  @ApiResponse({
    status: 404,
    description: 'level  not found ',
  })
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateLevelDto) {
    return this.levelService.update(+id, updateLevelDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Level was deleted' })
  @ApiResponse({
    status: 404,
    description: 'level  not found ',
  })
  remove(@Param('id') id: string) {
    return this.levelService.remove(+id);
  }
}
