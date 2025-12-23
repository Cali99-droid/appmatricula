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
import { getSchoolDocumentsEmail } from './helpers/bodyInfo';

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
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer; // NUEVO: Soporte para Buffer
    path?: string; // Mantener soporte para archivos
  }>;
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
      const from = 'informes@mail.colegioae.com';
      const mailOptions = {
        from: `"Colegio AE" <${from}>`,
        to: this.env === 'prod' ? to : 'carlos.orellano@ae.edu.pe',
        subject,
        text: 'Boleta de Notas',
        html: body,
        replyTo: 'soporte@colegioae.freshdesk.com',
        bcc: 'informes@mail.colegioae.com',
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

  /**
   * Envía un email
   */
  async enviarEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Colegio AE" <${this.configService.getOrThrow<string>('AWS_SES_FROM')}>`,
        to:
          this.env === 'prod'
            ? options.to //options.to
            : 'carlos.orellano@ae.edu.pe',
        subject: options.subject,
        cc: 'informes@mail.colegioae.com',
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        replyTo: 'soporte@colegioae.freshdesk.com',
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email enviado exitosamente a ${options.to}: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error al enviar email a ${options.to}: ${error.message}`,
      );
      return false;
    }
  }

  async enviarEmailInfo(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Colegio AE" <informes@mail.colegioae.com>`,
        to:
          this.env === 'prod'
            ? options.to //options.to
            : 'carlos.orellano@ae.edu.pe',
        subject: options.subject,
        //  cc: 'informes@mail.colegioae.com',
        cc:
          this.env === 'prod'
            ? 'informes@mail.colegioae.com' //options.to
            : 'carlosjhardel4@gmail.com',
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        replyTo: 'soporte@colegioae.freshdesk.com',
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email enviado exitosamente a ${options.to}: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error al enviar email a ${options.to}: ${error.message}`,
      );
      return false;
    }
  }
  async enviarCartaCobranza(
    emailDestino: string,
    nombreApoderado: string,
    nombreEstudiante: string,
    montoDeuda: number,
    pdfPath: string,
  ): Promise<boolean> {
    const subject = 'Carta de Cobranza - Colegio Albert Einstein';

    const html = this.crearHtmlCartaCobranza(
      nombreApoderado,
      nombreEstudiante,
      montoDeuda,
    );

    return this.enviarEmail({
      to: emailDestino,
      subject,
      html,
      attachments: [
        {
          filename: `Carta_Cobranza_${nombreEstudiante.replace(/\s+/g, '_')}.pdf`,
          path: pdfPath,
        },
      ],
    });
  }

  async enviarInfo(
    emailDestino: string,
    dataSubject: string,
    link: string,
  ): Promise<boolean> {
    const subject = `Año académico 2026 - ${dataSubject}`;

    const html = getSchoolDocumentsEmail(link);

    return this.enviarEmailInfo({
      to: emailDestino,
      subject,
      html,
      // attachments: [
      //   {
      //     filename: `Carta_Cobranza_${nombreEstudiante.replace(/\s+/g, '_')}.pdf`,
      //     path: pdfPath,
      //   },
      // ],
    });
  }

  async enviarCartaCobranzaConBuffer(
    emailDestino: string,
    nombreApoderado: string,
    nombreEstudiante: string,
    montoDeuda: number,
    pdfBuffer: Buffer,
    codigoDocumento: string,
  ): Promise<boolean> {
    const subject = 'Carta de Cobranza - Colegio Albert Einstein';

    const html = this.crearHtmlCartaCobranza(
      nombreApoderado,
      nombreEstudiante,
      montoDeuda,
    );

    return this.enviarEmail({
      to: emailDestino,
      subject,
      html,
      attachments: [
        {
          filename: `Carta_Cobranza_${codigoDocumento}.pdf`,
          content: pdfBuffer, // Enviar el Buffer directamente
        },
      ],
    });
  }

  async enviarCartaFinalConBuffer(
    emailDestino: string,
    nombreApoderado: string,
    nombreEstudiante: string,

    pdfBuffer: Buffer,
    codigoDocumento: string,
  ): Promise<boolean> {
    const subject = `Comunicado sobre vacante de ${nombreEstudiante}`;

    const html = this.crearHtmlCartaFinal(nombreApoderado, nombreEstudiante);

    return this.enviarEmail({
      to: emailDestino,
      subject,
      html,
      attachments: [
        {
          filename: `Carta_Perdida_Vacante_${codigoDocumento}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
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

  /**
   * Crea el contenido HTML para el email de cobranza
   */
  private crearHtmlCartaCobranza(
    nombreApoderado: string,
    nombreEstudiante: string,
    montoDeuda: number,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #003366;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
          }
          .footer {
            background-color: #003366;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 0 0 5px 5px;
            font-size: 12px;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #d9534f;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Colegio Albert Einstein</h1>
          <p>Comunicación Importante</p>
        </div>
        
        <div class="content">
          <p>Estimado(a) <strong>${nombreApoderado}</strong>,</p>
          
          <p>Reciba un cordial saludo de parte de la Dirección del Colegio Albert Einstein.</p>
          
          <p>Le escribimos para informarle sobre una situación importante relacionada con las pensiones de enseñanza correspondientes al estudiante <strong>${nombreEstudiante}</strong>.</p>
          
          <div class="highlight">
            <p><strong>Monto pendiente de pago:</strong></p>
            <p class="amount">S/. ${montoDeuda.toFixed(2)}</p>
          </div>
          
          <p>Adjunto a este correo encontrará la <strong>Carta de Cobranza oficial</strong> con todos los detalles sobre:</p>
          <ul>
            <li>El monto exacto de la deuda</li>
            <li>Los canales de pago disponibles</li>
            <li>Los plazos para regularizar su situación</li>
            <li>Las consecuencias del impago</li>
          </ul>
          
          <p><strong>Canales de pago disponibles:</strong></p>
          <ul>
            <li>Agente BBVA Banco Continental</li>
            <li>Agente BCP Banco de Crédito del Perú</li>
            <li>Oficinas del Colegio: Jr. Huaylas N° 245 – Independencia</li>
          </ul>
          
          <div class="highlight">
            <p><strong>⚠️ IMPORTANTE:</strong> Le solicitamos regularizar el pago dentro de las próximas <strong>24 horas</strong> para evitar inconvenientes con la matrícula del próximo año académico.</p>
          </div>
          
          <p>Para cualquier consulta o coordinación de pago, no dude en comunicarse con nosotros:</p>
          <ul>
            <li>📞 Teléfono: [Número de contacto]</li>
            <li>📧 Email: [Email del colegio]</li>
            <li>🕐 Horario: Lunes a viernes de 7:30am a 6:30pm</li>
          </ul>
          
          <p>Agradecemos su pronta atención a la presente comunicación.</p>
          
          <p>Atentamente,</p>
          <p><strong>Dirección<br>Colegio Albert Einstein</strong></p>
        </div>
        
        <div class="footer">
          <p>Este es un correo automático, por favor no responder a esta dirección.</p>
          <p>Colegio Albert Einstein - Jr. Huaylas N° 245 – Independencia, Huaraz</p>
          <p>&copy; ${new Date().getFullYear()} Todos los derechos reservados</p>
        </div>
      </body>
      </html>
    `;
  }

  private crearHtmlCartaFinal(
    nombreApoderado: string,
    nombreEstudiante: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .header {
            background-color: #d32f2f;
            color: white;
            padding: 25px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .alert-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-left: 5px solid #d32f2f;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .urgent-box {
            background-color: #ffebee;
            padding: 20px;
            border-left: 4px solid #d32f2f;
            margin: 25px 0;
            border-radius: 4px;
          }
          .urgent-box h3 {
            color: #d32f2f;
            margin-top: 0;
            font-size: 18px;
          }
          .info-box {
            background-color: #fff3e0;
            padding: 15px;
            border-left: 4px solid #ff9800;
            margin: 20px 0;
          }
          .footer {
            background-color: #d32f2f;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 5px 5px;
            font-size: 12px;
          }
          .student-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
          }
          .contact-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .important-text {
            color: #d32f2f;
            font-weight: bold;
          }
          ul {
            padding-left: 20px;
          }
          li {
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="alert-icon">⚠️</div>
          <h1>Comunicación Urgente</h1>
          <p style="margin: 0;">Colegio Albert Einstein</p>
        </div>
        
        <div class="content">
          <p>Estimado(a) <strong>${nombreApoderado}</strong>,</p>
          
          <div class="urgent-box">
            <h3>🚨 PÉRDIDA DE VACANTE COMUNICADA</h3>
            <p>Lamentamos informarle que debido al <strong>incumplimiento en el pago de las pensiones escolares</strong>, hemos procedido a comunicar la <span class="important-text">pérdida de vacante</span> para el estudiante:</p>
          </div>

          <div class="student-info">
            <p style="margin: 5px 0;"><strong>Estudiante:</strong> ${nombreEstudiante}</p>
          
            <p style="margin: 5px 0;"><strong>Periodo afectado:</strong> Año Académico 2026</p>
          </div>

          <p>Esta medida se toma en <strong>estricta aplicación del Reglamento Interno</strong> del Colegio Albert Einstein, toda vez que los incumplimientos vienen afectando directamente la prestación del servicio educativo que brindamos a toda nuestra comunidad.</p>

          <div class="info-box">
            <p><strong>📄 Documento adjunto:</strong></p>
            <p>Encontrará adjunta la carta oficial de comunicación de pérdida de vacante.</p>
          </div>

        

          <div class="contact-info">
            <h4 style="margin-top: 0; color: #1976d2;">📍 Información de Contacto:</h4>
            <p style="margin: 5px 0;"><strong>Dirección:</strong> Jr. Huaylas N° 245 – Independencia, Huaraz</p>
            <p style="margin: 5px 0;"><strong>Horario:</strong> Lunes a viernes de 7:30am a 6:30pm</p>
            <p style="margin: 5px 0;"><strong>Sábados:</strong> 8:00am a 11:00am</p>
            <p style="margin: 5px 0;"><strong>Teléfono:</strong> 943 861 219</p>
          </div>

          <p style="margin-top: 25px;">Lamentamos profundamente haber llegado a esta situación. Quedamos a su disposición para cualquier consulta o aclaración que requiera.</p>

          <p style="margin-top: 20px;">Atentamente,</p>
          <p style="margin-top: 5px;"><strong>Jorge Pineda Fernández<br>Director<br>Colegio Albert Einstein</strong></p>
        </div>
        
        <div class="footer">
          <p style="margin: 5px 0;">⚠️ Este es un documento oficial y requiere su atención inmediata</p>
          <p style="margin: 5px 0;">Colegio Albert Einstein - Jr. Huaylas N° 245 – Independencia, Huaraz</p>
          <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Todos los derechos reservados</p>
        </div>
      </body>
      </html>
    `;
  }
}
