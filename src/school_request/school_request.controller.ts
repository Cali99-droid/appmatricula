import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SchoolRequestService } from './school_request.service';
import { CreateSchoolRequestDto } from './dto/create-school_request.dto';
import { UpdateSchoolRequestDto } from './dto/update-school_request.dto';
import { ApiTags } from '@nestjs/swagger';
import { Resource } from 'nest-keycloak-connect';
@ApiTags('School-request')
@Resource('client-test-appae')
@Controller('school-request')
export class SchoolRequestController {
  constructor(private readonly schoolRequestService: SchoolRequestService) {}

  @Post()
  create(@Body() createSchoolRequestDto: CreateSchoolRequestDto) {
    return this.schoolRequestService.create(createSchoolRequestDto);
  }

  @Get()
  findAll() {
    return this.schoolRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolRequestService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSchoolRequestDto: UpdateSchoolRequestDto,
  ) {
    return this.schoolRequestService.update(+id, updateSchoolRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schoolRequestService.remove(+id);
  }
}
