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
  Headers,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EmailsService } from './emails.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { FindActivityClassroomDto } from './dto/find-activity_classroom.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateEmailByStudentDto } from './dto/create-byStudent.dto';
import { MailParams } from './interfaces/mail-params.interface';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Public } from 'nest-keycloak-connect';
@ApiTags('Emails')
@Controller('emails')
export class EmailsController {
  constructor(
    private readonly emailsService: EmailsService,
    private readonly httpService: HttpService,
  ) {}

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

  @Post('/logs')
  @Public()
  async handleSnsNotification(
    @Headers('x-amz-sns-message-type') messageType: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    let payload = body;

    // A veces NestJS parsea automáticamente, pero a veces SNS envía como texto plano
    if (typeof body === 'string') {
      try {
        payload = JSON.parse(body);
      } catch (err) {
        console.error('❌ Error al parsear el body:', err);
        return;
      }
    }

    if (messageType === 'SubscriptionConfirmation') {
      const subscribeUrl = payload.SubscribeURL;
      console.log('🔔 Confirmando suscripción automáticamente:', subscribeUrl);

      if (!subscribeUrl) {
        console.error('❌ No se encontró SubscribeURL en el mensaje');
        return;
      }

      await firstValueFrom(this.httpService.get(subscribeUrl));
      return { message: 'Suscripción confirmada' };
    }

    if (messageType !== 'Notification') {
      throw new HttpException('Tipo no soportado', HttpStatus.BAD_REQUEST);
    }

    const notificationType = payload?.notificationType;

    if (notificationType === 'Bounce') {
      await this.emailsService.registerBounce(payload);
    } else if (notificationType === 'Complaint') {
      await this.emailsService.registerComplaint(payload);
    } else if (notificationType === 'Delivery') {
      await this.emailsService.registerDelivery(payload);
    }

    return { ok: true };
  }
}
