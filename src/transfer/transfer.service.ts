/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  FinalDecision,
  MainStatus,
  ProcessState,
  TransferRequest,
} from './entities/transfer-request.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { KeycloakTokenPayload } from 'src/auth/interfaces/keycloak-token-payload .interface';
import { UserService } from 'src/user/user.service';
import {
  TransferMeeting,
  TransferMeetingType,
} from './entities/transfer-meeting.entity';
import { UpdateTransferMeetingDto } from './dto/update-transfer-meeting.dto';
import { CreateTransferMeetingDto } from './dto/create-transfer-meeting.dto';
import { AuthorRole, TransferReport } from './entities/transfer-report.entity';
import { UpdateTransferReportDto } from './dto/update-transfer-report.dto';
import { CreateTransferReportDto } from './dto/create-transfer-report.dto';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { TreasuryService } from 'src/treasury/treasury.service';
import { TypeOfDebt } from 'src/treasury/enum/TypeOfDebt.enum';
import { EmailsService } from 'src/emails/emails.service';
import {
  EmailTemplateParams,
  generateRegistrationEmail,
} from './helpers/email-request';

import { PersonService } from 'src/person/person.service';
import {
  DecisionEmailParams,
  generateDecisionEmail,
} from './helpers/email-final';
import { Status } from 'src/enrollment/enum/status.enum';
import { SearchTranfersDto } from './dto/search-tranfer.dto';
import { ActivityClassroomService } from 'src/activity_classroom/activity_classroom.service';
import {
  ProcessStateTracking,
  RequestTrackingArea,
  TransferRequestTracking,
} from './entities/transfer-resquest-tracking.entity';
import { CreateRequestTrackingDto } from './dto/create-request-tracking.dto';

// import { customAlphabet } from 'nanoid';

@Injectable()
export class TransfersService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_REGION'),
  });
  private readonly logger = new Logger('transfers');
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(TransferRequest)
    private readonly transferRequestRepository: Repository<TransferRequest>,

    @InjectRepository(TransferMeeting)
    private readonly transferMeetingRepository: Repository<TransferMeeting>,

    @InjectRepository(TransferReport)
    private readonly transferReportRepository: Repository<TransferReport>,

    @InjectRepository(TransferRequestTracking)
    private readonly requestTrackingRepository: Repository<TransferRequestTracking>,

    private readonly userService: UserService,
    private readonly enrollmentService: EnrollmentService,
    private readonly treasuryService: TreasuryService,
    private readonly emailsService: EmailsService,
    private readonly activityClassroomService: ActivityClassroomService,

    private readonly personService: PersonService,
  ) {}

  // private generateRequestCode(): string {
  //   const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
  //   return `TR-${nanoid()}`;
  //   return `TR-126`;
  // }

  private generateRequestCode() {
    return this.transferRequestRepository.query(
      `SELECT MAX(id) as id FROM transfer_request WHERE id IS NOT NULL`,
    );
  }

  async createRequestTracking(
    createRequestTrackingDto: CreateRequestTrackingDto,
  ): Promise<TransferRequestTracking> {
    const requestTracking = this.requestTrackingRepository.create(
      createRequestTrackingDto,
    );
    return await this.requestTrackingRepository.save(requestTracking);
  }

  async create(
    createTransferDto: CreateTransferDto,
    user: KeycloakTokenPayload,
  ): Promise<TransferRequest> {
    try {
      const actualEnroll =
        await this.enrollmentService.findEnrollmentByStudentAndStatus(
          createTransferDto.studentId,
          Status.MATRICULADO,
        );
      if (!actualEnroll) {
        throw new NotFoundException('Estudiante no tiene Matricula Activa');
      }
      const availableClassroomsIds = (
        await this.enrollmentService.getAvailableClassroomsToTransfers(
          createTransferDto.studentId,
          createTransferDto.destinationCampusId,
        )
      ).map((ava) => ava.id);
      if (
        !availableClassroomsIds.includes(
          createTransferDto.destinationClassroomId,
        )
      ) {
        throw new BadRequestException('No hay vacantes para esta solicitud');
      }
      const us = await this.userService.findByEmail(user.email);
      const id = await this.generateRequestCode();

      const code = id ? Number(id[0].id) + 1 : 1;
      const newRequest = this.transferRequestRepository.create({
        ...createTransferDto,
        user: { id: us.id },
        requestCode: `TR-${code.toString().padStart(4, '0')}`,
        personId: createTransferDto.parentId,
        enrollCode: `${actualEnroll.code}TR${code}`,
      });
      const request = await this.transferRequestRepository.save(newRequest);

      await this.enrollmentService.createEnrollmentWithStatus(
        createTransferDto.studentId,
        createTransferDto.destinationClassroomId,
        Status.EN_PROCESO,
        `${actualEnroll.code}TR${code}`,
      );
      /**VERIFY DEBTS */
      const resDebt = await this.treasuryService.findDebts(
        createTransferDto.studentId,
        TypeOfDebt.VENCIDA,
      );

      const parent = await this.personService.findOne(
        createTransferDto.parentId,
      );
      if (parent.email) {
        const student = await this.personService.findOneStudent(
          createTransferDto.studentId,
        );
        const templateParams: EmailTemplateParams = {
          parentName: `${parent.name} ${parent.lastname}`,
          studentName: `${student.name} ${student.lastname}`,
          requestCode: newRequest.requestCode,
          statusCheckUrl: 'https://colegioae.edu.pe/traslados/consulta', // URL real de tu app
          hasDebts: resDebt.debts.length > 0,
        };

        // 3. Generas el contenido del email
        const { subject, html } = generateRegistrationEmail(templateParams);

        // 4. Envías el correo usando tu servicio existente
        await this.emailsService.sendEmailWithSES({
          to: parent.email,
          subject,
          html,
          text: `Su solicitud de traslado ha sido registrada con el código: ${newRequest.requestCode}`, // Versión de texto plano
        });
        /**SEND EMAIL */
      }

      const trackingData = {
        area: RequestTrackingArea.SECRETARY,
        transferRequestId: request.id,
        userId: us.id,
        notes: 'Solicitud creada',
        status: ProcessStateTracking.REGISTERED,
        arrivalDate: new Date(),
      };
      await this.createRequestTracking(trackingData);
      return request;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async getOneRequest(id: number) {
    try {
      const request = await this.transferRequestRepository.findOne({
        where: {
          id,
        },
        relations: {
          student: {
            person: true,
          },
          person: true,
          originClassroom: true,
          destinationClassroom: true,
        },
      });
      const { student, person, originClassroom, destinationClassroom, ...res } =
        request;
      const formatRequest = {
        ...res,
        studentName: `${student.person.lastname.toLocaleUpperCase()} ${student.person.mLastname.toLocaleUpperCase()} ${student.person.name.toLocaleUpperCase()}`,
        parentName: `${person.lastname.toLocaleUpperCase()} ${person.mLastname.toLocaleUpperCase()} ${person.name.toLocaleUpperCase()}`,
        originClassroom: `${originClassroom.grade.name} ${originClassroom.section}`,
        destinationClassroom: `${destinationClassroom.grade.name} ${destinationClassroom.section}`,
      };

      return formatRequest;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async getAllRequests(query: SearchTranfersDto, user: KeycloakTokenPayload) {
    const { status, campusId, levelId } = query;

    const idsAc =
      await this.activityClassroomService.getIdsByLevelIdCampusIdAndCodes(
        campusId,
        levelId,
        user.resource_access['client-test-appae'].roles,
      );
    const resquestsOptions: any = {
      where: {
        mainStatus: status,
        // user: { id: us.id },
        originClassroom: {
          id: In(idsAc),
        },
      },
    };

    if (
      user.resource_access['client-test-appae'].roles.includes('secretaria') &&
      !user.resource_access['client-test-appae'].roles.includes(
        'administrador-colegio',
      )
    ) {
      const us = await this.userService.findByEmail(user.email);
      resquestsOptions.where = {
        user: { id: us.id },
        mainStatus: status,
        originClassroom: {
          id: In(idsAc),
        },
      };
    }

    try {
      const requests = await this.transferRequestRepository.find({
        where: resquestsOptions.where,
        relations: {
          student: {
            person: true,
          },
        },
        order: {
          id: 'DESC',
        },
      });

      return requests.map((r) => {
        // 1. Desestructura 'r': saca 'student' y guarda el resto en 'rest'
        const { student, ...rest } = r;

        // 2. Devuelve un nuevo objeto con las propiedades de 'rest' y la nueva 'studentName'
        return {
          ...rest,
          studentName: `${student.person.lastname} ${student.person.mLastname} ${student.person.name}`,
        };
      });
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async getStatusByCode(requestCode: string) {
    const request = await this.transferRequestRepository.findOne({
      where: { requestCode },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    const route = await this.requestTrackingRepository.find({
      where: {
        transferRequestId: request.id,
      },
      relations: {
        user: {
          person: true,
        },
        transferRequest: {
          transferMeeting: true,
          destinationClassroom: true,
        },
      },
    });

    return route.map((r) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user, createdAt, updatedAt, transferRequest, ...res } = r;
      const { transferMeeting, destinationClassroom } = transferRequest;
      let meeting = [];

      if (
        res.area === RequestTrackingArea.PSYCHOLOGY &&
        res.status === ProcessStateTracking.MEETING_SCHEDULED
      ) {
        meeting =
          res.area === RequestTrackingArea.PSYCHOLOGY
            ? transferMeeting.filter(
                (tm) => tm.type == TransferMeetingType.PSYCHOLOGIST,
              )
            : [];
      }
      if (
        res.area === RequestTrackingArea.CORDINATOR &&
        res.status === ProcessStateTracking.MEETING_SCHEDULED
      ) {
        meeting =
          res.area === RequestTrackingArea.CORDINATOR
            ? transferMeeting.filter(
                (tm) => tm.type == TransferMeetingType.ADMINISTRATOR,
              )
            : [];
      }

      return {
        ...res,
        responsible: `${user.person.lastname} ${user.person.mLastname} ${user.person.name}`,
        meetingDate: meeting[0]?.meetingDate,
        destinationClassroom: `${destinationClassroom.grade.name} ${destinationClassroom.section}`,
        codeClassroom: `${destinationClassroom.classroom.code}`,
      };
    });
    // // Si está cerrada, la respuesta es directa
    // if (request.mainStatus === MainStatus.CLOSED) {
    //   return {
    //     status: `Finalizado - ${request.finalDecision}`,
    //     message: `El proceso de traslado ha concluido. Razón: ${request.decisionReason}`,
    //   };
    // }
    // if (request.mainStatus === MainStatus.PENDING_AGREEMENT) {
    //   return {
    //     status: `En Proceso - ${request.finalDecision}`,
    //     message: `En espera de acta de trasalado`,
    //   };
    // }

    // // Si está abierta, construimos un mensaje descriptivo
    // let psychMessage = 'Evaluación psicológica pendiente.';
    // if (request.psychologistState === ProcessState.MEETING_SCHEDULED) {
    //   psychMessage = 'Entrevista psicológica agendada.';
    // } else if (request.psychologistState === ProcessState.REPORT_UPLOADED) {
    //   psychMessage = 'Evaluación psicológica completada.';
    // }

    // let adminMessage = 'Evaluación con coordinación de sede pendiente.';
    // if (request.administratorState === ProcessState.MEETING_SCHEDULED) {
    //   adminMessage = 'Entrevista con coordinación de sede agendada.';
    // }

    // if (request.administratorState === ProcessState.REPORT_UPLOADED) {
    //   adminMessage = 'Entrevista con coordinación de sede completada.';
    // }

    // return {
    //   status: 'En Proceso',
    //   message: `${psychMessage} ${adminMessage} Estamos trabajando en su solicitud.`,
    // };
  }

  /**MEETINGS */
  // CREATE
  async createTransferMeeting(
    createDto: CreateTransferMeetingDto,
    user: KeycloakTokenPayload,
  ): Promise<TransferMeeting> {
    const us = await this.userService.findByEmail(user.email);
    const { type, transferRequestId } = createDto;
    let area: RequestTrackingArea;
    const exist = await this.transferMeetingRepository.findOne({
      where: {
        transferRequestId,
        type,
      },
    });
    if (exist) {
      throw new BadRequestException(
        `Ya existe un agendamiento para la solicitud #${createDto.transferRequestId}.`,
      );
    }

    const transferRequest = await this.transferRequestRepository.findOne({
      where: {
        id: transferRequestId,
      },
    });
    const newMeeting = this.transferMeetingRepository.create({
      ...createDto,
      user: { id: us.id }, // Asocia el usuario que agenda la reunión
    });

    if (type === TransferMeetingType.ADMINISTRATOR) {
      transferRequest.administratorState = ProcessState.MEETING_SCHEDULED;
      area = RequestTrackingArea.CORDINATOR;
    }
    if (type === TransferMeetingType.PSYCHOLOGIST) {
      transferRequest.psychologistState = ProcessState.MEETING_SCHEDULED;
      area = RequestTrackingArea.PSYCHOLOGY;
    }

    await this.transferRequestRepository.save(transferRequest);
    const trackingData = {
      area: area,
      transferRequestId: transferRequest.id,
      userId: us.id,
      notes: 'Reunión Agendada',
      status: ProcessStateTracking.MEETING_SCHEDULED,
      arrivalDate: new Date(),
    };
    await this.createRequestTracking(trackingData);
    return this.transferMeetingRepository.save(newMeeting);
  }

  // READ ALL FOR A SPECIFIC TRANSFER REQUEST
  async findAllTransferMeetingByRequest(
    transferRequestId: number,
    user: KeycloakTokenPayload,
  ): Promise<TransferMeeting[]> {
    const us = await this.userService.findByEmail(user.email);

    return this.transferMeetingRepository.find({
      where: { transferRequestId, user: { id: us.id } },
      relations: ['user'], // Opcional: para traer info del usuario que agendó
    });
  }

  async findMeetingsByUser(user: KeycloakTokenPayload): Promise<any[]> {
    const us = await this.userService.findByEmail(user.email);
    const roles = user.resource_access['client-test-appae'].roles;
    let status;

    const data = await this.transferMeetingRepository.find({
      where: { user: { id: us.id } },
      relations: {
        transferRequest: true,
      }, // Opcional: para traer info del usuario que agendó
    });
    const format = data.map((t) => {
      const {
        updatedAt,
        createdAt,
        transferRequestId,
        transferRequest,
        ...rest
      } = t;
      const { administratorState, psychologistState, requestCode } =
        transferRequest;

      if (roles.includes('psicologia-traslados')) {
        status = psychologistState;
      }
      if (roles.includes('cordinador-academico')) {
        status = administratorState;
      }
      return {
        ...rest,
        transferRequest: {
          id: transferRequest.id,
          requestCode,
          status,
        },
      };
    });
    return format;
  }

  // READ ONE
  async findOneTransferMeeting(id: number): Promise<TransferMeeting> {
    const meeting = await this.transferMeetingRepository.findOne({
      where: { id },
      relations: ['user', 'transferRequest'],
    });
    if (!meeting) {
      throw new NotFoundException(`Agendamiento con ID #${id} no encontrado.`);
    }
    return meeting;
  }

  // UPDATE
  async updateTransferMeeting(
    id: number,
    updateDto: UpdateTransferMeetingDto,
  ): Promise<TransferMeeting> {
    // 'preload' busca la entidad y la fusiona con los nuevos datos del DTO
    const meeting = await this.transferMeetingRepository.preload({
      id,
      ...updateDto,
    });
    if (!meeting) {
      throw new NotFoundException(`Agendamiento con ID #${id} no encontrado.`);
    }
    return this.transferMeetingRepository.save(meeting);
  }

  // DELETE
  async removeTransferMeeting(id: number): Promise<{ message: string }> {
    const meeting = await this.transferMeetingRepository.findOne({
      where: { id },
    }); // Reutilizamos findOne para verificar que existe
    const { type, transferRequestId } = meeting;
    const transferRequest = await this.transferRequestRepository.findOne({
      where: {
        id: transferRequestId,
      },
    });
    if (type === TransferMeetingType.ADMINISTRATOR) {
      transferRequest.administratorState = ProcessState.PENDING;
    }
    if (type === TransferMeetingType.PSYCHOLOGIST) {
      transferRequest.psychologistState = ProcessState.PENDING;
    }
    await this.transferRequestRepository.save(transferRequest);
    await this.transferMeetingRepository.remove(meeting);
    return { message: `Agendamiento con ID #${id} eliminado correctamente.` };
  }

  /**REPORTS */
  // CREATE
  async createTransferReport(
    createDto: CreateTransferReportDto,
    user: KeycloakTokenPayload,
  ): Promise<TransferReport> {
    const { transferRequestId, authorRole } = createDto;
    let area: RequestTrackingArea;
    let status: ProcessStateTracking;
    const exist = await this.transferReportRepository.findOne({
      where: {
        transferRequestId,
        authorRole,
      },
    });
    if (exist) {
      throw new BadRequestException(
        `Ya existe un informe para la solicitud #${createDto.transferRequestId}.`,
      );
    }
    const transferRequest = await this.transferRequestRepository.findOneBy({
      id: createDto.transferRequestId,
    });
    const us = await this.userService.findByEmail(user.email);
    if (!transferRequest) {
      throw new NotFoundException(
        `Solicitud de traslado con ID #${createDto.transferRequestId} no encontrada.`,
      );
    }

    const newReport = this.transferReportRepository.create({
      ...createDto,
      user: { id: us.id },
    });

    // Lógica para actualizar el estado de la solicitud principal
    if (createDto.authorRole === AuthorRole.PSYCHOLOGIST) {
      transferRequest.psychologistState = ProcessState.REPORT_UPLOADED;
      area = RequestTrackingArea.PSYCHOLOGY;
      status = ProcessStateTracking.REPORT_UPLOADED;
    } else if (createDto.authorRole === AuthorRole.ADMINISTRATOR) {
      // Valida que el informe psicológico exista antes de continuar
      if (transferRequest.psychologistState !== ProcessState.REPORT_UPLOADED) {
        throw new BadRequestException(
          'No se puede registrar la decisión final sin el informe psicológico.',
        );
      }
      transferRequest.administratorState = ProcessState.REPORT_UPLOADED;
      transferRequest.finalDecision = createDto.conclusion
        ? FinalDecision.APPROVED
        : FinalDecision.DENIED;
      transferRequest.decisionReason = createDto.content;
      // Actualiza el estado principal según la lógica de negocio
      transferRequest.mainStatus = createDto.conclusion
        ? MainStatus.PENDING_AGREEMENT
        : MainStatus.CLOSED;
      status = createDto.conclusion
        ? ProcessStateTracking.REPORT_UPLOADED
        : ProcessStateTracking.FINALIZED;
      area = RequestTrackingArea.CORDINATOR;
    }
    /**send email */

    await this.transferRequestRepository.save(transferRequest);
    const report = await this.transferReportRepository.save(newReport);

    if (createDto.authorRole === AuthorRole.ADMINISTRATOR) {
      /**SEND EMAIL */
      const resDebt = await this.treasuryService.findDebts(
        transferRequest.studentId,
        TypeOfDebt.VENCIDA,
      );

      const parent = await this.personService.findOne(transferRequest.personId);
      if (parent.email) {
        const student = await this.personService.findOneStudent(
          transferRequest.studentId,
        );
        // 1. Preparas los parámetros para la plantilla
        const emailParams: DecisionEmailParams = {
          parentName: `${parent.name} ${parent.lastname}`,
          studentName: `${student.name} ${student.lastname}`,
          requestCode: transferRequest.requestCode,
          approved: transferRequest.finalDecision === FinalDecision.APPROVED,
          reason: transferRequest.decisionReason,
          hasDebts: resDebt.debts.length > 0,
        };

        // 3. Generas el contenido del email
        const { subject, html, text } = generateDecisionEmail(emailParams);

        await this.emailsService.sendEmailWithSES({
          to: parent.email,
          subject,
          html,
          text,
        });
      }
    }
    const msg =
      createDto.authorRole === AuthorRole.ADMINISTRATOR
        ? 'Solicitud Aceptada, a la espera de Acta de cambio de sección'
        : 'Reporte Finalizado';
    const trackingData = {
      area: area,
      transferRequestId: transferRequest.id,
      userId: us.id,
      notes: createDto.conclusion ? msg : 'Reporte Finalizado',
      status: status,
      arrivalDate: new Date(),
    };
    await this.createRequestTracking(trackingData);

    return report;
  }

  // READ ALL FOR A REQUEST
  async findAllByRequestTransferReport(
    transferRequestId: number,
    user: KeycloakTokenPayload,
  ): Promise<TransferReport[]> {
    if (
      user.resource_access['client-test-appae'].roles.includes(
        'cordinador-academico',
      )
    ) {
      return this.transferReportRepository.find({
        where: { transferRequestId },
        relations: ['user'],
      });
    }
    const us = await this.userService.findByEmail(user.email);
    return this.transferReportRepository.find({
      where: { transferRequestId, user: { id: us.id } },
      relations: ['user'],
    });
  }

  // READ ONE
  async findOneTransferReport(id: number): Promise<TransferReport> {
    const report = await this.transferReportRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!report) {
      throw new NotFoundException(`Informe con ID #${id} no encontrado.`);
    }
    return report;
  }

  // UPDATE
  async updateTransferReport(
    id: number,
    updateDto: UpdateTransferReportDto,
  ): Promise<TransferReport> {
    const report = await this.transferReportRepository.preload({
      id,
      ...updateDto,
    });
    if (!report) {
      throw new NotFoundException(`Informe con ID #${id} no encontrado.`);
    }
    return this.transferReportRepository.save(report);
  }

  // DELETE
  async removeTransferReport(id: number): Promise<{ message: string }> {
    const report = await this.findOneTransferReport(id);
    const { authorRole, transferRequestId } = report;
    const transferRequest = await this.transferRequestRepository.findOne({
      where: {
        id: transferRequestId,
      },
    });
    if (authorRole === AuthorRole.ADMINISTRATOR) {
      transferRequest.administratorState = ProcessState.MEETING_SCHEDULED;
    }
    if (authorRole === AuthorRole.PSYCHOLOGIST) {
      transferRequest.psychologistState = ProcessState.MEETING_SCHEDULED;
    }
    await this.transferRequestRepository.save(transferRequest);
    await this.transferReportRepository.remove(report);
    return { message: `Informe con ID #${id} eliminado correctamente.` };
  }

  /**UPLOAD ACTA */
  async finalizeWithAct(id: number, file: Buffer, user: KeycloakTokenPayload) {
    try {
      if (!file) {
        throw new BadRequestException('Need a file');
      }
      const us = await this.userService.findByEmail(user.email);
      // const webpImage = await sharp(file).webp().toBuffer();
      const nameAct = `${Date.now()}.pdf`;
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: 'caebucket',
          Key: `colegio/actas/${nameAct}`,
          Body: file,
          ACL: 'public-read',
        }),
      );

      const urlS3 = this.configService.getOrThrow('AWS_URL_BUCKET');
      const urlPDF = `${urlS3}colegio/actas/${nameAct}`;
      const request = await this.transferRequestRepository.findOne({
        where: { id },
      });

      request.agreementActUrl = urlPDF;
      request.mainStatus = MainStatus.CLOSED;
      await this.enrollmentService.changeSection(
        request.studentId,
        request.destinationClassroomId,
        user,
        request.enrollCode,
      );
      const trackingData = {
        area: RequestTrackingArea.SECRETARY,
        transferRequestId: request.id,
        userId: us.id,
        notes: 'Acta Subida y cambio efectuado',
        status: ProcessStateTracking.FINALIZED,
        arrivalDate: new Date(),
      };
      await this.createRequestTracking(trackingData);
      return await this.transferRequestRepository.save(request);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
