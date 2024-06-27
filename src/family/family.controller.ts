import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FamilyService } from './family.service';

import { DataParentArrayDto } from '../relationship/dto/data-parent-array.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('Family')
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  // @Post('create-many')
  // @ApiOperation({
  //   summary: 'create many parents of family ',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'object with number of family members and person created',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'some data of array is bad ',
  // })
  // createParents(@Body() dataParentArrayDto: DataParentArrayDto) {
  //   return this.familyService.createParents(dataParentArrayDto);
  // }
  // @Post()
  // create(@Body() createFamilyDto: CreateFamilyDto) {
  //   return this.familyService.create(createFamilyDto);
  // }

  @Get()
  findAll() {
    return this.familyService.findAll();
  }
  @Get('migrate')
  migrate() {
    return this.familyService.migrate();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.familyService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto) {
  //   return this.familyService.update(+id, updateFamilyDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.familyService.remove(+id);
  // }
}
