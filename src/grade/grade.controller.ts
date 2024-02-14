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
import { GradeService } from './grade.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grade } from './entities/grade.entity';

@ApiTags('Grade')
@Controller('grade')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Grade was created', type: Grade })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for grade ',
  })
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradeService.create(createGradeDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of grades',
    type: [Grade],
  })
  findAll() {
    return this.gradeService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar grados específicos, puedes enviar el solo el id',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail grade', type: Grade })
  @ApiResponse({
    status: 404,
    description: 'grade  not found ',
  })
  findOne(@Param('id') id: string) {
    return this.gradeService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Grade was updated', type: Grade })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for grade',
  })
  @ApiResponse({
    status: 404,
    description: 'grade  not found ',
  })
  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradeService.update(+id, updateGradeDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Grade was deleted' })
  @ApiResponse({
    status: 404,
    description: 'grade  not found ',
  })
  remove(@Param('id') id: string) {
    return this.gradeService.remove(+id);
  }
}
