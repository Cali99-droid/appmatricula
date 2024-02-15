import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CampusXLevelService } from './campus_x_level.service';
import { CreateCampusXLevelDto } from './dto/create-campus_x_level.dto';
import { UpdateCampusXLevelDto } from './dto/update-campus_x_level.dto';

@Controller('campus-x-level')
export class CampusXLevelController {
  constructor(private readonly campusXLevelService: CampusXLevelService) {}

  @Post()
  create(@Body() createCampusXLevelDto: CreateCampusXLevelDto) {
    return this.campusXLevelService.create(createCampusXLevelDto);
  }

  @Get()
  findAll() {
    return this.campusXLevelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campusXLevelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCampusXLevelDto: UpdateCampusXLevelDto) {
    return this.campusXLevelService.update(+id, updateCampusXLevelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campusXLevelService.remove(+id);
  }
}
