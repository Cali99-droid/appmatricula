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
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';

@ApiTags('Course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Course was created', type: Course })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for course ',
  })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of courses',
    type: [Course],
  })
  findAll(@Query('areaId') areaId: string) {
    return this.courseService.findAll(+areaId);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar grados específicos, puedes enviar el solo el id',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail course', type: Course })
  @ApiResponse({
    status: 404,
    description: 'course  not found ',
  })
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Course was updated', type: Course })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for course',
  })
  @ApiResponse({
    status: 404,
    description: 'course  not found ',
  })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Course was deleted' })
  @ApiResponse({
    status: 404,
    description: 'course  not found ',
  })
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
