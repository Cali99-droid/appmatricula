import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';

import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchUserDto } from './dto/search-user.dto';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { FilterUserByRoleDto } from './dto/filter-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   // return this.userService.create(createUserDto);
  // }

  // @Patch('add-role')
  // addRole(@Body() addRoleDto: AddRoleDto) {
  //   return this.userService.addRoleToUser(addRoleDto);
  // }
  @ApiParam({
    name: 'searchTerm',
    required: false,
    description: 'termino a buscar',
    type: String,
  })
  @ApiParam({
    name: 'page',
    required: false,
    description: 'parámetro de paginación',
    type: String,
  })
  @ApiParam({
    name: 'limit',
    required: false,
    description: 'parámetro de paginación',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'search matches',
  })
  @Get('/search')
  findStudents(
    @Query() searchDto: SearchUserDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.userService.searchUser(searchDto, user);
  }

  @ApiQuery({
    name: 'role',
    required: false,
    description: 'role must be [docente, auxiliar]',
    type: String,
  })
  @Get()
  @ApiResponse({ status: 200, description: 'Detail User' })
  findAll(@Query() filterDto: FilterUserByRoleDto) {
    return this.userService.findAll(filterDto);
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
  @ApiQuery({
    name: 'sub',
    required: false,
    description: 'sub of user',
    type: String,
  })
  @Patch('assign-role/:sub')
  update(@Param('sub') sub: string, @Body() assignRoleDto: AssignRoleDto) {
    console.log(assignRoleDto);
    return this.userService.update(sub, assignRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  // @Post('/users-of-test')
  // createUsersOfTest(@Body() createUserDto: CreateUserOfTestDto) {
  //   return this.userService.createUsersOfTest(createUserDto);
  // }
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
