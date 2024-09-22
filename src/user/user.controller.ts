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
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

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
}
