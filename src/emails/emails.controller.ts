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
  Res,
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
import { Response } from 'express';
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

  @Put('crm/:id')
  updateOnpened(@Param('id') id: string) {
    return this.emailsService.updateOpened(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emailsService.remove(+id);
  }

  @Post('test')
  @Public()
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
  async handleSnsNotification(@Body() rawBody: string, @Res() res: Response) {
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error('Error parsing rawBody:', rawBody, e);
      return res.status(400).send('Invalid JSON');
    }

    const { Type, Message, SubscribeURL, TopicArn } = body;

    // Validación de campos obligatorios
    if (!Type) {
      return res.status(400).send('Missing Type field');
    }

    if (Type === 'SubscriptionConfirmation') {
      if (!SubscribeURL) {
        return res.status(400).send('Missing SubscribeURL');
      }
      try {
        const response = await this.httpService.axiosRef.get(SubscribeURL);
        console.log('Subscription confirmed successfully:', response.data);
        return res.status(200).send('Subscription confirmed');
      } catch (error) {
        console.error('Error confirming subscription:', error);
        return res.status(502).send('Error confirming subscription');
      }
    } else if (Type === 'Notification') {
      if (!Message) {
        return res.status(400).send('Missing Message');
      }
      try {
        const message =
          typeof Message === 'string' ? JSON.parse(Message) : Message;
        const notificationType = message.notificationType;

        if (!notificationType) {
          return res.status(400).send('Missing notificationType');
        }

        switch (notificationType) {
          case 'Bounce':
            await this.emailsService.registerBounce(message);
            break;
          case 'Complaint':
            await this.emailsService.registerComplaint(message);
            break;
          case 'Delivery':
            await this.emailsService.registerDelivery(message);
            break;
          default:
            console.warn('Unknown notificationType:', notificationType);
        }
      } catch (e) {
        console.error('Error processing notification:', Message, e);
        return res.status(400).send('Invalid notification message');
      }
    } else {
      console.warn('Unknown SNS Type:', Type);
    }

    return res.status(200).send('OK'); // Respuesta obligatoria para SNS
  }
}
