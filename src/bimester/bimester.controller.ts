import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BimesterService } from './bimester.service';
import { CreateBimesterDto } from './dto/create-bimester.dto';
import { UpdateBimesterDto } from './dto/update-bimester.dto';
import { ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Bimester } from './entities/bimester.entity';
@ApiTags('Bimester')
@Controller('bimester')
export class BimesterController {
  constructor(private readonly bimesterService: BimesterService) {}

  @Post()
  create(@Body() createBimesterDto: CreateBimesterDto) {
    return this.bimesterService.create(createBimesterDto);
  }

  @Get()
  @ApiQuery({
    name: 'yearId',
    required: true,
    description: 'Id of the year',
    type: Number,
  })
  @ApiOkResponse({
    status: 200,
    description: 'Array of Bimester',
    type: [Bimester],
  })
  @ApiResponse({ status: 200, description: 'Detail Holiday', type: Bimester })
  @ApiResponse({
    status: 404,
    description: 'Bimester  not found ',
  })
  findAll(@Query('yearId') yearId: number) {
    return this.bimesterService.findAll(yearId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bimesterService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBimesterDto: UpdateBimesterDto,
  ) {
    return this.bimesterService.update(+id, updateBimesterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bimesterService.remove(+id);
  }
}
