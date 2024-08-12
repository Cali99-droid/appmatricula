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
import { EmailsService } from './emails.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { FindActivityClassroomDto } from './dto/find-activity_classroom.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateEmailByStudentDto } from './dto/create-byStudent.dto';
@ApiTags('Emails')
@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post('many')
  @ApiQuery({
    name: 'phaseId',
    required: true,
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
  @ApiQuery({
    name: 'gradeId',
    required: false,
    description: 'Id of the grade',
    type: Number,
  })
  @ApiQuery({
    name: 'section',
    required: false,
    description: 'Letter of the section',
    type: String,
  })
  create(
    @Body() createEmailDto: CreateEmailDto,
    @Query() findParams: FindActivityClassroomDto,
  ) {
    return this.emailsService.create(createEmailDto, findParams);
  }
  @Post('student')
  createbyStudent(@Body() createEmailDto: CreateEmailByStudentDto) {
    return this.emailsService.createByStudent(createEmailDto);
  }
  @Get()
  findAll() {
    return this.emailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmailDto: UpdateEmailDto) {
    return this.emailsService.update(+id, updateEmailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emailsService.remove(+id);
  }
}