import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ActivityClassroomService } from './activity_classroom.service';
import { CreateActivityClassroomDto } from './dto/create-activity_classroom.dto';
import { UpdateActivityClassroomDto } from './dto/update-activity_classroom.dto';
import { ActivityClassroom } from './entities/activity_classroom.entity';
import {
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchClassroomsDto } from 'src/common/dto/search-classrooms.dto';

@ApiTags('Activity Classroom')
@Controller('activity-classroom')
export class ActivityClassroomController {
  constructor(
    private readonly activityClassroomService: ActivityClassroomService,
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'ActivityClassroom was created',
    type: ActivityClassroom,
  })
  @ApiResponse({
    status: 400,
    description: 'exist ActivityClassroom ',
  })
  create(@Body() createActivityClassroomDto: CreateActivityClassroomDto) {
    return this.activityClassroomService.create(createActivityClassroomDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of Classrooms',
    type: [ActivityClassroom],
  })
  findAll() {
    return this.activityClassroomService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the activity classroom to find',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detail Activity Classroom',
    type: ActivityClassroom,
  })
  findOne(@Param('id') id: string) {
    return this.activityClassroomService.findOne(+id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the activity classroom to update',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Activity classroom was updated',
    type: ActivityClassroom,
  })
  @ApiResponse({
    status: 400,
    description: 'exist activity classroom ',
  })
  update(
    @Param('id') id: string,
    @Body() updateActivityClassroomDto: UpdateActivityClassroomDto,
  ) {
    return this.activityClassroomService.update(
      +id,
      updateActivityClassroomDto,
    );
  }
  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the activity classroom to delete',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Activity Classroom was deleted' })
  @ApiResponse({
    status: 404,
    description: 'Activity Classroom not found ',
  })
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.activityClassroomService.remove(+id);
    return res.status(200).json({
      status: 200,
      description: 'Activity Classroom was deleted',
    });
  }
  @Get('search/params')
  @ApiQuery({
    name: 'yearId',
    required: true,
    description: 'Id of the year',
    type: Number,
  })
  @ApiQuery({
    name: 'phaseId',
    required: false,
    description: 'Id of the phase',
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
    description: 'Array of classrooms from phase, year, campus or level',
    type: [ActivityClassroom],
  })
  searchClassrooms(@Query() searchClassroomsDto: SearchClassroomsDto) {
    return this.activityClassroomService.searchClassrooms(searchClassroomsDto);
  }
}
