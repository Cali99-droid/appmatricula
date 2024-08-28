import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RelationshipService } from './relationship.service';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataParentArrayDto } from './dto/data-parent-array.dto';
import { Person } from 'src/person/entities/person.entity';
@ApiTags('Relationship')
@Controller('relationship')
export class RelationshipController {
  constructor(private readonly relationshipService: RelationshipService) {}

  @Post('create-many')
  @ApiOperation({
    summary: 'create many parents of family ',
  })
  @ApiResponse({
    status: 200,
    description: 'object with number of family members and person created',
  })
  @ApiResponse({
    status: 400,
    description: 'some data of array is bad ',
  })
  createParents(@Body() dataParentArrayDto: DataParentArrayDto) {
    return this.relationshipService.createParents(dataParentArrayDto);
  }

  @Get()
  @ApiOperation({
    summary: 'get many parents of family ',
  })
  @ApiResponse({
    status: 200,
    description: 'array created',
    type: [Person],
  })
  @ApiResponse({
    status: 400,
    description: 'some data of array is bad ',
  })
  findAll() {
    return this.relationshipService.findAll();
  }
  @Get('activity-classroom/:activityClassroomId')
  @ApiOperation({
    summary: 'get parents by ActivityClassroom',
  })
  @ApiResponse({
    status: 200,
    description: 'array whith data ',
    type: [Person],
  })
  @ApiResponse({
    status: 400,
    description: 'some data sending is bad ',
  })
  findByActivityClassroom(
    @Param('activityClassroomId') activityClassroomId: number,
  ) {
    return this.relationshipService.findByActivityClassroom(
      +activityClassroomId,
    );
  }
}
