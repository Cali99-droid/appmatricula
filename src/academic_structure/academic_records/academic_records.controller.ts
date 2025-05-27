import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AcademicRecordsService } from './academic_records.service';
import { CreateAcademicRecordDto } from './dto/create-academic_record.dto';
import { UpdateAcademicRecordDto } from './dto/update-academic_record.dto';

@Controller('academic-records')
export class AcademicRecordsController {
  constructor(
    private readonly academicRecordsService: AcademicRecordsService,
  ) {}

  @Post()
  create(@Body() createAcademicRecordDto: CreateAcademicRecordDto) {
    return this.academicRecordsService.create(createAcademicRecordDto);
  }

  @Get()
  findAll() {
    return this.academicRecordsService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.academicRecordsService.findOne(+id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAcademicRecordDto: UpdateAcademicRecordDto,
  ) {
    return this.academicRecordsService.update(+id, updateAcademicRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicRecordsService.remove(+id);
  }
}
