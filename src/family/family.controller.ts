import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { FamilyService } from './family.service';

import { ApiTags } from '@nestjs/swagger';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { CreateFamilyParentsStudentDto } from './dto/create-family-parents-student.dto';
@ApiTags('Family')
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get()
  findAll() {
    return this.familyService.findAll();
  }
  @Get('migrate')
  migrate() {
    return this.familyService.migrate();
  }
  @Get(':id')
  findOne(@Param('id') id: string, @AuthenticatedUser() user: any) {
    return this.familyService.findOne(+id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto) {
    return this.familyService.update(+id, updateFamilyDto);
  }
  @Post()
  create(@Body() createFamilyParentsStudentDto: CreateFamilyParentsStudentDto) {
    return this.familyService.createFamilyFromAdmision(
      createFamilyParentsStudentDto,
    );
  }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.familyService.remove(+id);
  // }
}
