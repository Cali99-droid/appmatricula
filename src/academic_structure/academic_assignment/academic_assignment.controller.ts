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
import { AcademicAssignmentService } from './academic_assignment.service';
import { CreateAcademicAssignmentDto } from './dto/create-academic_assignment.dto';
import { UpdateAcademicAssignmentDto } from './dto/update-academic_assignment.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('academic-assignment')
@Controller('academic-assignment')
export class AcademicAssignmentController {
  constructor(
    private readonly academicAssignmentService: AcademicAssignmentService,
  ) {}

  @Post()
  create(@Body() createAcademicAssignmentDto: CreateAcademicAssignmentDto) {
    return this.academicAssignmentService.create(createAcademicAssignmentDto);
  }

  @Get()
  findAll(@Query('activityClassroomId') activityClassroomId: number) {
    return this.academicAssignmentService.findAll(+activityClassroomId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicAssignmentService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAcademicAssignmentDto: UpdateAcademicAssignmentDto,
  ) {
    return this.academicAssignmentService.update(
      +id,
      updateAcademicAssignmentDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicAssignmentService.remove(+id);
  }
}
