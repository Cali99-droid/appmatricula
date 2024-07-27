import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
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
@Injectable()
export class EmailsService {
  private readonly logger = new Logger('EmailsService');
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
    private readonly httpService: HttpService,
  ) {}
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
    const dataActivityClassroom = await this.activityClassroomRepository.find({
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
            id: !isNaN(findActivity.gradeId) ? findActivity.gradeId : undefined,
            level: {
              id: !isNaN(findActivity.levelId)
                ? findActivity.levelId
                : undefined,
            },
          },
          section: findActivity.section ? findActivity.section : undefined,
        },
      ],
    });
    if (dataActivityClassroom.length > 0) {
      const firstActivityClassroom = dataActivityClassroom[0];
      phaseName =
        `${firstActivityClassroom.phase.type} ${firstActivityClassroom.phase.year.name}` ||
        '';
      if (!isNaN(findActivity.campusId)) {
        campusName =
          `, Sede: ${firstActivityClassroom.classroom.campusDetail.name}` || '';
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
          // family: {
          //   parentOneId: { user: Not(IsNull()) },
          // },
        },
      },
      relations: {
        activityClassroom: false,
        student: {
          family: { parentOneId: { user: true }, parentTwoId: { user: true } },
        },
      },
    });
    const filteredEnrollment = dataEnrollment.filter((enrollment) => {
      const family = enrollment.student.family;
      return family.parentOneId.user !== null;
    });
    const emailsParents = filteredEnrollment.map((enrollment) => {
      const family = enrollment.student.family;
      if (family.parentOneId.user) {
        this.sendEmail(
          createEmailDto.type,
          enrollment.activityClassroom.phase.year.name,
          enrollment.code,
          enrollment.student.person.name,
          family.parentOneId.name,
          family.parentOneId.user.email,
          createEmailDto.subject,
          createEmailDto.body,
        );
      }
      if (family.parentTwoId.user) {
        this.sendEmail(
          createEmailDto.type,
          enrollment.activityClassroom.phase.year.name,
          enrollment.code,
          enrollment.student.person.name,
          family.parentTwoId.name,
          family.parentTwoId.user.email,
          createEmailDto.subject,
          createEmailDto.body,
        );
      }
      return {
        id: family.id,
      };
    });
    if (emailsParents.length < 1) {
      throw new BadRequestException(`No hay emails para ser enviados`);
    }
    try {
      const data = this.emailRepository.create({
        receivers: receivers,
        subject: createEmailDto.subject,
        body: createEmailDto.body,
        quantity: emailsParents.length.toString(),
        type: createEmailDto.type,
      });

      return await this.emailRepository.save(data);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async sendEmail(
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
  async findAll() {
    const emails = await this.emailRepository.find({
      select: {
        id: true,
        type: true,
        receivers: true,
        subject: true,
        body: true,
        quantity: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return emails;
  }

  findOne(id: number) {
    return `This action returns a #${id} email`;
  }

  update(id: number, updateEmailDto: UpdateEmailDto) {
    return `This action updates a #${id} email`;
  }

  remove(id: number) {
    return `This action removes a #${id} email`;
  }
}
