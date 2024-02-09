import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CampusXLevelGradeService } from './campus_x_level_grade.service';
import { CreateCampusXLevelGradeDto } from './dto/create-campus_x_level_grade.dto';
import { UpdateCampusXLevelGradeDto } from './dto/update-campus_x_level_grade.dto';

@Controller('campus-x-level-grade')
export class CampusXLevelGradeController {
  constructor(
    private readonly campusXLevelGradeService: CampusXLevelGradeService,
  ) {}

  @Post()
  create(@Body() createCampusXLevelGradeDto: CreateCampusXLevelGradeDto) {
    return this.campusXLevelGradeService.create(createCampusXLevelGradeDto);
  }

  @Get()
  findAll() {
    return this.campusXLevelGradeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campusXLevelGradeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampusXLevelGradeDto: UpdateCampusXLevelGradeDto,
  ) {
    return this.campusXLevelGradeService.update(
      +id,
      updateCampusXLevelGradeDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campusXLevelGradeService.remove(+id);
  }
}
