import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PhaseService } from './phase.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Phase } from './entities/phase.entity';
// import { Classroom } from 'src/classroom/entities/classroom.entity';

@ApiTags('Phase')
@Controller('phase')
export class PhaseController {
  constructor(private readonly phaseService: PhaseService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Phase was created', type: Phase })
  @ApiResponse({
    status: 400,
    description:
      'endDate must be after startDate, yearId is invalid or the number of phases was exceeded ',
  })
  create(@Body() createPhaseDto: CreatePhaseDto) {
    return this.phaseService.create(createPhaseDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of phases',
    type: [Phase],
  })
  findAll() {
    return this.phaseService.findAll();
  }
  @Get('year/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar fases específicas, puedes enviar el id del año ',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail Phase', type: Phase })
  @ApiResponse({
    status: 404,
    description: 'years  not found ',
  })
  async findAllByYear(@Param('id') id: string) {
    return this.phaseService.findAllByYear(+id);
  }
  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the phase to find',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail phase', type: Phase })
  @ApiResponse({
    status: 404,
    description: 'Phase not found ',
  })
  findOne(@Param('id') id: string) {
    return this.phaseService.findOne(+id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the phase to update',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Phase was updated', type: Phase })
  @ApiResponse({
    status: 400,
    description:
      'endDate must be after startDate, yearId is invalid or the number of phases was exceeded ',
  })
  update(@Param('id') id: string, @Body() updatePhaseDto: UpdatePhaseDto) {
    return this.phaseService.update(+id, updatePhaseDto);
  }

  @ApiResponse({ status: 200, description: 'Phase was deleted' })
  @ApiResponse({
    status: 404,
    description: 'Phase not found ',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phaseService.remove(+id);
  }

  // @Get(':id/classrooms')
  // @ApiOkResponse({
  //   status: 200,
  //   description: 'Array of classrooms from phase',
  //   type: [Classroom],
  // })
  // findClassroomsByPhase(@Param('id') id: string) {
  //   return this.phaseService.findClassroomsByPhase(+id);
  // }
}
