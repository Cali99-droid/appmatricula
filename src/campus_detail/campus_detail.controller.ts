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
import { CampusDetailService } from './campus_detail.service';
import { CreateCampusDetailDto } from './dto/create-campus_detail.dto';
import { UpdateCampusDetailDto } from './dto/update-campus_detail.dto';
import { CampusDetail } from './entities/campus_detail.entity';

@ApiTags('Campus Detail')
@Controller('campus-detail')
export class CampusDetailController {
  constructor(private readonly campusDetailService: CampusDetailService) {}

  @Post()
  @Post()
  @ApiResponse({
    status: 201,
    description: 'CampusDetail was created',
    type: CampusDetail,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name or ugelLocalCode for campusDetail ',
  })
  create(@Body() createCampusDetailDto: CreateCampusDetailDto) {
    return this.campusDetailService.create(createCampusDetailDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of campusDetail',
    type: [CampusDetail],
  })
  findAll() {
    return this.campusDetailService.findAll();
  }

  @Get(':term')
  @ApiParam({
    name: 'term',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar grados específicos, puedes enviar el id,nombre o codigo de local de UGEL del campus ',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detail campusDetail',
    type: CampusDetail,
  })
  @ApiResponse({
    status: 404,
    description: 'campusDetail  not found ',
  })
  findOne(@Param('term') term: string) {
    return this.campusDetailService.findOne(term);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'CampusDetail was updated',
    type: CampusDetail,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name or ugelLocalCode for campusDetail ',
  })
  @ApiResponse({
    status: 404,
    description: 'campusDetail  not found ',
  })
  update(
    @Param('id') id: string,
    @Body() updateCampusDetailDto: UpdateCampusDetailDto,
  ) {
    return this.campusDetailService.update(+id, updateCampusDetailDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'CampusDetail was deleted' })
  @ApiResponse({
    status: 404,
    description: 'campusDetail  not found ',
  })
  remove(@Param('id') id: string) {
    return this.campusDetailService.remove(+id);
  }
}
