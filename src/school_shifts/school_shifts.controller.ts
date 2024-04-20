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
import {
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SchoolShiftsService } from './school_shifts.service';
import { CreateSchoolShiftDto } from './dto/create-school_shift.dto';
import { UpdateSchoolShiftDto } from './dto/update-school_shift.dto';
import { SchoolShift } from './entities/school_shift.entity';
import { SearchSchoolShiftsDto } from './dto/search-school_shift.dto';

@ApiTags('School Shifts')
@Controller('school-shifts')
export class SchoolShiftsController {
  constructor(private readonly schoolShiftsService: SchoolShiftsService) {}
  @Post()
  @ApiResponse({
    status: 201,
    description: 'SchoolShift was created',
    type: SchoolShift,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for SchoolShift ',
  })
  create(@Body() createSchoolShiftDto: CreateSchoolShiftDto) {
    return this.schoolShiftsService.create(createSchoolShiftDto);
  }

  @Get()
  @ApiQuery({
    name: 'yearId',
    required: true,
    description: 'Id of the year',
    type: Number,
  })
  @ApiQuery({
    name: 'campusId',
    required: false,
    description: 'Id of the campus',
    type: Number,
  })
  @ApiQuery({
    name: 'levelId',
    required: false,
    description: 'Id of the level',
    type: Number,
  })
  @ApiOkResponse({
    status: 200,
    description: 'Array of SchoolShifts',
    type: [SchoolShift],
  })
  findAll(@Query() searchSchoolShiftDto: SearchSchoolShiftsDto) {
    return this.schoolShiftsService.findAll(searchSchoolShiftDto);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar niveles específicos, puedes enviar el id, codigo modular o el nombre del nivel',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detail SchoolShift',
    type: SchoolShift,
  })
  @ApiResponse({
    status: 404,
    description: 'SchoolShift  not found ',
  })
  findOne(@Param('id') id: string) {
    return this.schoolShiftsService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'SchoolShift was updated',
    type: SchoolShift,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for SchoolShift ',
  })
  @ApiResponse({
    status: 404,
    description: 'SchoolShift  not found ',
  })
  update(
    @Param('id') id: string,
    @Body() updateSchoolShiftDto: UpdateSchoolShiftDto,
  ) {
    return this.schoolShiftsService.update(+id, updateSchoolShiftDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'SchoolShift was deleted' })
  @ApiResponse({
    status: 404,
    description: 'SchoolShift  not found ',
  })
  remove(@Param('id') id: string) {
    return this.schoolShiftsService.remove(+id);
  }
}
