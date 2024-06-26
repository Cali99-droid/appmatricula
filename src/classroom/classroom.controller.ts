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
import { ClassroomService } from './classroom.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import {
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Classroom } from './entities/classroom.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchClassroomsDto } from './dto/search-classrooms.dto';

@ApiTags('Classroom')
@Controller('classroom')
export class ClassroomController {
  constructor(
    private readonly classroomService: ClassroomService,
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
  ) {}

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
    console.log('repostoroi', this.classroomRepository);
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
  @Get('search/params')
  @ApiQuery({
    name: 'campusId',
    required: false,
    description: 'Id of the campus',
    type: Number,
  })
  @ApiOkResponse({
    status: 200,
    description: 'Array of classrooms from  campus',
    type: [Classroom],
  })
  searchClassrooms(@Query() searchClassroomsDto: SearchClassroomsDto) {
    return this.classroomService.searchClassrooms(searchClassroomsDto);
  }
}
