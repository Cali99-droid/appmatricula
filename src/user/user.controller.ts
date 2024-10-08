import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

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
