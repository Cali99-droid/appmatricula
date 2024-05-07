import { Controller, Post, Body, Get } from '@nestjs/common';
import { RelationshipService } from './relationship.service';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataParentArrayDto } from './dto/data-parent-array.dto';
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
  })
  @ApiResponse({
    status: 400,
    description: 'some data of array is bad ',
  })
  findAll() {
    return this.relationshipService.findAll();
  }
}
