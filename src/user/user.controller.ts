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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserOfTestDto } from './dto/create-users-of-test.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // @Patch('add-role')
  // addRole(@Body() addRoleDto: AddRoleDto) {
  //   return this.userService.addRoleToUser(addRoleDto);
  // }

  @Get()
  @ApiResponse({ status: 200, description: 'Detail User' })
  findAll() {
    return this.userService.findAll();
  }
  @Get('/report')
  @ApiResponse({ status: 200, description: 'Report User' })
  reportUsers() {
    return this.userService.reportUsers();
  }
  @Get('/parent')
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'page to user',
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'page to user',
    type: String,
  })
  @ApiQuery({
    name: 'term',
    required: false,
    description: 'this term can be email,lastname,mlastName and name to user',
    type: String,
  })
  getParents(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('term') term?: string,
  ) {
    return this.userService.findParentUser(+page, +limit, term);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('/users-of-test')
  createUsersOfTest(@Body() createUserDto: CreateUserOfTestDto) {
    return this.userService.createUsersOfTest(createUserDto);
  }
  @Get('activity-classroom/:activityClassroomId')
  @ApiOperation({
    summary: 'get parents by ActivityClassroom',
  })
  // @ApiResponse({
  //   status: 200,
  //   description: 'array whith data ',
  //   type: [Person],
  // })
  @ApiResponse({
    status: 400,
    description: 'some data sending is bad ',
  })
  findByActivityClassroom(
    @Param('activityClassroomId') activityClassroomId: number,
  ) {
    return this.userService.findByActivityClassroom(+activityClassroomId);
  }
}
