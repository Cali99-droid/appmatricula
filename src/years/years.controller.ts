import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { YearsService } from './years.service';
import { CreateYearDto } from './dto/create-year.dto';
import { UpdateYearDto } from './dto/update-year.dto';

@Controller('years')
export class YearsController {
  constructor(private readonly yearsService: YearsService) {}

  @Post()
  create(@Body() createYearDto: CreateYearDto) {
    return this.yearsService.create(createYearDto);
  }

  @Get()
  findAll() {
    return this.yearsService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.yearsService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateYearDto: UpdateYearDto) {
    return this.yearsService.update(+id, updateYearDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.yearsService.remove(+id);
  }
}
