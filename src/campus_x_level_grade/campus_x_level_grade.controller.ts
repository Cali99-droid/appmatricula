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
import { CampusXLevelGradeService } from './campus_x_level_grade.service';
import { CreateCampusXLevelGradeDto } from './dto/create-campus_x_level_grade.dto';
import { UpdateCampusXLevelGradeDto } from './dto/update-campus_x_level_grade.dto';
import { CampusXLevelGrade } from './entities/campus_x_level_grade.entity';
@ApiTags('CampusXLevelGrade')
@Controller('campus-x-level-grade')
export class CampusXLevelGradeController {
  constructor(
    private readonly campusXLevelGradeService: CampusXLevelGradeService,
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'CampusXLevelGrade was created',
    type: CampusXLevelGrade,
  })
  @ApiResponse({
    status: 400,
    description:
      'endDate must be after startDate, yearId is invalid or the number of CampusXLevelGrades was exceeded ',
  })
  create(@Body() createCampusXLevelGradeDto: CreateCampusXLevelGradeDto) {
    return this.campusXLevelGradeService.create(createCampusXLevelGradeDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of CampusXLevelGrades',
    type: [CampusXLevelGrade],
  })
  findAll() {
    return this.campusXLevelGradeService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the CampusXLevelGrade to find',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detail CampusXLevelGrade',
    type: CampusXLevelGrade,
  })
  @ApiResponse({
    status: 404,
    description: 'CampusXLevelGrade not found ',
  })
  findOne(@Param('id') id: string) {
    return this.campusXLevelGradeService.findOne(+id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the CampusXLevelGrade to update',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'CampusXLevelGrade was updated',
    type: CampusXLevelGrade,
  })
  @ApiResponse({
    status: 400,
    description:
      'endDate must be after startDate, yearId is invalid or the number of CampusXLevelGrades was exceeded ',
  })
  update(
    @Param('id') id: string,
    @Body() updateCampusXLevelGradeDto: UpdateCampusXLevelGradeDto,
  ) {
    return this.campusXLevelGradeService.update(
      +id,
      updateCampusXLevelGradeDto,
    );
  }
  @ApiResponse({ status: 200, description: 'CampusXLevelGrade was deleted' })
  @ApiResponse({
    status: 404,
    description: 'CampusXLevelGrade not found ',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campusXLevelGradeService.remove(+id);
  }
}
