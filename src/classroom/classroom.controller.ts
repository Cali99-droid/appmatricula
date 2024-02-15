import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Classroom } from './entities/classroom.entity';

@ApiTags('Classroom')
@Controller('classroom')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Classroom was created',
    type: Classroom,
  })
  @ApiResponse({
    status: 400,
    description: 'exist classroom ',
  })
  create(@Body() createClassroomDto: CreateClassroomDto) {
    return this.classroomService.create(createClassroomDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of Classrooms',
    type: [Classroom],
  })
  findAll() {
    return this.classroomService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the classroom to find',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detail classroom',
    type: Classroom,
  })
  findOne(@Param('id') id: string) {
    return this.classroomService.findOne(+id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the classroom to update',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Classroom was updated',
    type: Classroom,
  })
  @ApiResponse({
    status: 400,
    description: 'exist classroom ',
  })
  update(
    @Param('id') id: string,
    @Body() updateClassroomDto: UpdateClassroomDto,
  ) {
    return this.classroomService.update(+id, updateClassroomDto);
  }

  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the classroom to delete',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Classroom was deleted' })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found ',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classroomService.remove(+id);
  }
}
