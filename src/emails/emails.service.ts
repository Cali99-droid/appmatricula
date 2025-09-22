import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { CreateEmailByStudentDto } from './dto/create-byStudent.dto';

import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Email } from './entities/email.entity';
import { FindActivityClassroomDto } from './dto/find-activity_classroom.dto';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Family } from 'src/family/entities/family.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { TypeEmail } from './enum/type-email';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { Student } from 'src/student/entities/student.entity';
import * as aws from '@aws-sdk/client-ses';
import * as nodemailer from 'nodemailer';
import { MailParams } from './interfaces/mail-params.interface';
import { EmailDetail } from './entities/emailDetail.entity';
import { getBodyEmail, getText } from './helpers/bodyEmail';
import { EmailEventLog } from './entities/EmailEventLog,entity';

interface EmailEventPayload {
  Message?: string;
  bounce?: {
    bounceType: string;
    bouncedRecipients: Array<{ emailAddress: string }>;
  };
  complaint?: {
    complainedRecipients: Array<{ emailAddress: string }>;
  };
  delivery?: {
    recipients: string[];
  };
}
@Injectable()
export class EmailsService {
  private readonly logger = new Logger('EmailsService');
  private readonly env = this.configService.get('NODE_ENV');
  private ses: aws.SES;
  private transporter: nodemailer.Transporter;
  constructor(
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
    private readonly configService: ConfigService,
    @InjectRepository(Email)
    private readonly userRepository: Repository<Email>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Family)
    private readonly familyRepository: Repository<Family>,
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(EmailDetail)
    private readonly emailDetailRepository: Repository<EmailDetail>,
    @InjectRepository(EmailEventLog)
    private readonly emailEventLogRepository: Repository<EmailEventLog>,
    private readonly httpService: HttpService,
  ) {
    /**nodemailer SES */
    this.ses = new aws.SES({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.transporter = nodemailer.createTransport({
      SES: { aws, ses: this.ses },
    });
  }
  async create(
    createEmailDto: CreateEmailDto,
    findActivity: FindActivityClassroomDto,
  ) {
    let phaseName = '';
    let campusName = '';
    let levelName = '';
    let gradeName = '';
    let section = '';
    let receivers = '';
    if (isNaN(findActivity.phaseId)) {
      if (createEmailDto.studentIds === undefined) {
        throw new BadRequestException(`No hay emails para ser enviados`);
      }

      const createEmailByStudentDto: CreateEmailByStudentDto = {
        studentIds: createEmailDto.studentIds,
        subject: createEmailDto.subject,
        body: createEmailDto.body,
      };
      return await this.createByStudent(createEmailByStudentDto);
    } else {
      const dataActivityClassroom = await this.activityClassroomRepository.find(
        {
          where: [
            {
              phase: { id: findActivity.phaseId },
              classroom: {
                campusDetail: {
                  id: !isNaN(findActivity.campusId)
                    ? findActivity.campusId
                    : undefined,
                },
              },
              grade: {
                id: !isNaN(findActivity.gradeId)
                  ? findActivity.gradeId
                  : undefined,
                level: {
                  id: !isNaN(findActivity.levelId)
                    ? findActivity.levelId
                    : undefined,
                },
              },
              section: findActivity.section ? findActivity.section : undefined,
            },
          ],
        },
      );
      if (dataActivityClassroom.length > 0) {
        const firstActivityClassroom = dataActivityClassroom[0];
        phaseName =
          `${firstActivityClassroom.phase.type} ${firstActivityClassroom.phase.year.name}` ||
          '';
        if (!isNaN(findActivity.campusId)) {
          campusName =
            `, Sede: ${firstActivityClassroom.classroom.campusDetail.name}` ||
            '';
        }
        if (!isNaN(findActivity.levelId)) {
          levelName = `, ${firstActivityClassroom.grade.level.name}` || '';
        }
        if (!isNaN(findActivity.gradeId)) {
          gradeName = `, ${firstActivityClassroom.grade.name}` || '';
        }
        if (findActivity.section) {
          section = `, ${firstActivityClassroom.section}` || '';
        }
      }
      receivers = `Fase: ${phaseName} ${campusName} ${levelName} ${gradeName} ${section}`;
      const activityClassroomIds = dataActivityClassroom.map(
        (activityClassroom) => activityClassroom.id,
      );
      const dataEnrollment = await this.enrollmentRepository.find({
        where: {
          activityClassroom: { id: In(activityClassroomIds) },
          student: {
            family: Not(IsNull()),
          },
        },
        relations: {
          activityClassroom: false,
          student: {
            family: {
              parentOneId: { user: true },
              parentTwoId: { user: true },
            },
          },
        },
      });
      const filteredEnrollment = dataEnrollment.filter((enrollment) => {
        const family = enrollment.student.family;
        return family.parentOneId.user !== null;
      });
      if (filteredEnrollment.length < 1) {
        throw new BadRequestException(`No hay emails para ser enviados`);
      }
      try {
        let contEmail = 0;
        const dataEmail = this.emailRepository.create({
          receivers,
          subject: createEmailDto.subject,
          body: createEmailDto.body,
          type: createEmailDto.type,
        });

        const createdEmail = await this.emailRepository.save(dataEmail);

        await Promise.all(
          filteredEnrollment.map(async (enrollment) => {
            const family = enrollment.student.family;

            const sendAndSaveEmail = async (
              parentId: number,
              parentName: string,
              parentEmail: string,
              studentName: string,
            ) => {
              await this.sendEmailAmazon(
                parentEmail,
                createEmailDto.subject,
                createEmailDto.body,
                studentName,
                parentName,
              );

              const data = this.emailDetailRepository.create({
                student: { id: enrollment.student.id },
                parent: { id: parentId },
                email: { id: createdEmail.id },
                status: true,
              });

              await this.emailDetailRepository.save(data);
              contEmail = contEmail + 1;
            };

            if (family.parentOneId?.user) {
              await sendAndSaveEmail(
                family.parentOneId.id,
                family.parentOneId.name,
                family.parentOneId.user.email,
                enrollment.student.person.name,
              );
            }

            if (family.parentTwoId?.user) {
              await sendAndSaveEmail(
                family.parentTwoId.id,
                family.parentTwoId.name,
                family.parentTwoId.user.email,
                enrollment.student.person.name,
              );
            }
          }),
        );
        return {
          message: `Se enviaron ${contEmail} emails exitosamente.`,
        };
      } catch (error) {
        handleDBExceptions(error, this.logger);
      }
    }
  }

  async sendEmail(
    id: number,
    type: TypeEmail,
    year: string,
    code: string,
    stundentName: string,
    nameParent: string,
    email: string,
    subject: string,
    body: string,
  ) {
    const url = this.configService.get('GHL_EMAILS_URL');
    try {
      await firstValueFrom(
        this.httpService.post(url, {
          id: id,
          type: type,
          year: year,
          code: code,
          name_son: stundentName,
          name_parent: nameParent,
          email: email,
          subject: subject,
          body: body,
        }),
      );
    } catch (error) {
      throw error;
    }
  }
  async createByStudent(createEmail: CreateEmailByStudentDto) {
    const students = await this.studentRepository.find({
      where: { id: In(createEmail.studentIds) },
      relations: {
        family: { parentOneId: { user: true }, parentTwoId: { user: true } },
        person: true,
      },
    });
    if (!students.length) {
      throw new BadRequestException(
        `No se encontraron estudiantes con los IDs proporcionados.`,
      );
    }
    const studentNames = students.map((student) => student.person.name);
    const receivers =
      studentNames.length > 3
        ? `${studentNames.slice(0, 3).join(', ')} y ${studentNames.length - 3} alumnos más`
        : studentNames.join(', ');
    const emailData = this.emailRepository.create({
      receivers,
      subject: createEmail.subject,
      body: createEmail.body,
      type: TypeEmail.Other,
    });
    const createdEmail = await this.emailRepository.save(emailData);
    try {
      let contEmail = 0;
      for (const student of students) {
        const family = student.family;

        if (!family) {
          console.warn(
            `El estudiante ${student.person.name} no tiene familia asociada.`,
          );
          continue;
        }

        if (family.parentOneId?.user) {
          await this.sendEmailAmazon(
            family.parentOneId.user.email,
            createEmail.subject,
            createEmail.body,
            student.person.name,
            family.parentOneId.name,
          );

          const emailDetailOne = this.emailDetailRepository.create({
            student: { id: student.id },
            parent: { id: family.parentOneId.id },
            email: { id: createdEmail.id },
            status: true,
          });
          await this.emailDetailRepository.save(emailDetailOne);
          contEmail = contEmail + 1;
        }

        // Enviar email a parentTwo si tiene usuario
        if (family.parentTwoId?.user) {
          await this.sendEmailAmazon(
            family.parentOneId.user.email,
            createEmail.subject,
            createEmail.body,
            student.person.name,
            family.parentTwoId.name,
          );

          const emailDetailTwo = this.emailDetailRepository.create({
            student: { id: student.id },
            parent: { id: family.parentTwoId.id },
            email: { id: createdEmail.id },
            status: true,
          });
          await this.emailDetailRepository.save(emailDetailTwo);
          contEmail = contEmail + 1;
        }
      }
      return {
        message: `Se enviaron ${contEmail} emails exitosamente.`,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async sendEmailAmazon(
    email: string,
    subject: string,
    body: string,
    student: string,
    parent: string,
  ) {
    try {
      const mailOptions = {
        from:
          '"Colegio Albert Einstein"' +
          this.configService.getOrThrow<string>('AWS_SES_FROM'),
        to: this.env === 'prod' ? email : 'adnesperillar@gmail.com',
        subject,
        body: getText(body, student, parent),
        html: getBodyEmail(body, student, parent),
      };
      await this.transporter.sendMail(mailOptions as any);
    } catch (error) {
      this.logger.error(error);
    }
  }
  async findAll() {
    const emails = await this.emailRepository.find({
      select: {
        id: true,
        type: true,
        receivers: true,
        subject: true,
        body: true,
        createdAt: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return emails;
  }

  async findOne(id: number) {
    const email = await this.emailRepository.findOne({
      where: { id: id },
      relations: {
        emailDetails: {
          parent: {
            user: true,
          },
        },
      },
    });
    const nuevaFecha = new Date(email.createdAt);
    nuevaFecha.setHours(nuevaFecha.getHours() - 5);
    email.createdAt = nuevaFecha;
    if (!email) throw new NotFoundException(`Email with id ${id} not found`);
    return email;
  }
  async updateOpened(id: number) {
    const email = await this.emailRepository.preload({
      id: id,
      // opened: true,
    });
    if (!email) throw new NotFoundException(`Email with id: ${id} not found`);
    try {
      await this.emailRepository.save(email);
      return email;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} email`;
  }

  async sendEmailWithSES(params: MailParams): Promise<void> {
    const { to, subject, text, html } = params;
    console.log('enviando email');
    const mailOptions = {
      from: `"Colegio AE" <${this.configService.getOrThrow<string>('AWS_SES_FROM')}>`,
      to: this.env === 'prod' ? to : 'carlos.orellano@ae.edu.pe',
      subject,
      text,
      html,
      replyTo: 'soporte@colegioae.freshdesk.com',
    };

    try {
      await this.transporter.sendMail(mailOptions as any);
    } catch (error) {
      this.logger.error('Error sending email:', error); // 👈 Log detallado
      throw error;
    }
  }

  async sendEmailWithAttachment(
    to: string,
    subject: string,
    body: string,
    attachment: Buffer,
    filename: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `"Colegio AE" <${this.configService.getOrThrow<string>('AWS_SES_FROM')}>`,
        to: this.env === 'prod' ? to : 'carlos.orellano@ae.edu.pe',
        subject,
        text: 'Boleta de Notas',
        html: body,
        replyTo: 'soporte@colegioae.freshdesk.com',
        attachments: [
          {
            // filename,
            filename: filename,
            content: attachment.toString('base64'),
            encoding: 'base64',
            contentType: 'application/pdf',
          },
        ],
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  private async saveEmailEvent(
    email: string,
    eventType: 'Bounce' | 'Complaint' | 'Delivery',
    reason?: string,
  ): Promise<void> {
    try {
      await this.emailEventLogRepository.save({
        email,
        eventType,
        reason,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(`Error saving ${eventType} event for ${email}:`, error);
      // Considerar notificación a sistema de monitoreo
    }
  }

  private parsePayloadMessage(payload: EmailEventPayload): any {
    try {
      return payload.Message ? JSON.parse(payload.Message) : payload;
    } catch (error) {
      console.error('Error parsing message payload:', error);
      return payload;
    }
  }

  async registerBounce(payload: EmailEventPayload): Promise<void> {
    const parsedPayload = this.parsePayloadMessage(payload);
    const bounce = parsedPayload.bounce || payload.bounce;

    if (!bounce || !bounce.bouncedRecipients) {
      console.warn('Invalid bounce payload:', payload);
      return;
    }

    await Promise.all(
      bounce.bouncedRecipients.map((recipient) =>
        this.saveEmailEvent(
          recipient.emailAddress,
          'Bounce',
          bounce.bounceType,
        ),
      ),
    );
  }

  async registerComplaint(payload: EmailEventPayload): Promise<void> {
    const parsedPayload = this.parsePayloadMessage(payload);
    const complaint = parsedPayload.complaint || payload.complaint;

    if (!complaint || !complaint.complainedRecipients) {
      console.warn('Invalid complaint payload:', payload);
      return;
    }

    await Promise.all(
      complaint.complainedRecipients.map((recipient) =>
        this.saveEmailEvent(
          recipient.emailAddress,
          'Complaint',
          'User marked as spam',
        ),
      ),
    );
  }

  async registerDelivery(payload: EmailEventPayload): Promise<void> {
    const parsedPayload = this.parsePayloadMessage(payload);
    const delivery = parsedPayload.delivery || payload.delivery;

    if (!delivery || !delivery.recipients) {
      console.warn('Invalid delivery payload:', payload);
      return;
    }

    await Promise.all(
      delivery.recipients.map((recipient) =>
        this.saveEmailEvent(recipient, 'Delivery'),
      ),
    );
  }
}
