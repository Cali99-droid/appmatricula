import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { EmailsService } from './emails.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { FindActivityClassroomDto } from './dto/find-activity_classroom.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateEmailByStudentDto } from './dto/create-byStudent.dto';
import { MailParams } from './interfaces/mail-params.interface';
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
  @Put('crm/:id')
  updateOnpened(@Param('id') id: string) {
    return this.emailsService.updateOpened(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emailsService.remove(+id);
  }

  @Post('test')
  sendEmailWithSES() {
    const params: MailParams = {
      to: 'orellano428@gmail.com',
      subject: 'TEST EMAIL SES',
      html: '<strong>ESTE ES UN TEST DE EMAIL DESDE SNS</strong>',
      text: 'ESTE ES UN TEST DE EMAIL DESDE SNS',
    };
    return this.emailsService.sendEmailWithSES(params);
  }
}
