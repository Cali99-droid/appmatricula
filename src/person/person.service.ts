import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import {
  Between,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { Person } from './entities/person.entity';
import { User } from 'src/user/entities/user.entity';
import { CreatePersonCrmDto } from './dto/create-person-crm.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Relationship } from 'src/relationship/entities/relationship.entity';
import { Family } from 'src/family/entities/family.entity';
import { EnrollmentSchedule } from 'src/enrollment_schedule/entities/enrollment_schedule.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { SearchByDateDto } from '../common/dto/search-by-date.dto';

@Injectable()
export class PersonService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_REGION'),
  });
  private readonly logger = new Logger('PersonService');

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Relationship)
    private readonly relationShipRepository: Repository<Relationship>,
    @InjectRepository(Family)
    private readonly familypRepository: Repository<Family>,
    @InjectRepository(EnrollmentSchedule)
    private readonly enrollmentScheduleRepository: Repository<EnrollmentSchedule>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}
  create(createPersonDto: CreatePersonDto) {
    return 'This action adds a new person';
  }
  async createParentCRM(data: CreatePersonCrmDto) {
    try {
      let familyRole = undefined;
      let gender = undefined;
      let idPerson = undefined;
      if (data.gender == 'Masculino') {
        gender = 'M';
        familyRole = 'P';
      } else {
        gender = 'F';
        familyRole = 'M';
      }
      const splitDate = data.birthDate.replace('th', '').split(' ');
      const dateFormated = `${splitDate[1]} ${splitDate[0]} ${splitDate[2]}`;
      const helpDate = new Date(dateFormated);
      // Verificar que la date es válida
      if (!helpDate)
        throw new NotFoundException(
          `Error  with dateBirth: ${helpDate} not found`,
        );

      const year = helpDate.getFullYear();
      const mounth = ('0' + (helpDate.getMonth() + 1)).slice(-2);
      const day = ('0' + helpDate.getDate()).slice(-2);

      const date = `${year}-${mounth}-${day}`;

      const validatPerson = await this.personRepository.findOne({
        where: { docNumber: data.docNumber },
      });
      if (validatPerson) {
        idPerson = validatPerson.id;
      } else {
        const person = this.personRepository.create({
          docNumber: data.docNumber,
          name: data.name,
          lastname: data.lastName,
          mLastname: data.mLastname,
          gender: gender,
          familyRole: familyRole,
          birthDate: date,
        });
        const personCreated = await this.personRepository.save(person);
        idPerson = personCreated.id;
      }
      const user = this.userRepository.create({
        email: data.email,
        password: bcrypt.hashSync(
          `${data.docNumber}${data.name.charAt(0).toUpperCase()}${data.lastName.charAt(0).toLocaleLowerCase()}`,
          10,
        ),
        person: { id: idPerson },
        crmGHLId: data.crmGHLId,
      });
      const userCreated = await this.userRepository.save(user);
      const getParent = await this.familypRepository.findOne({
        where: [
          {
            parentOneId: { id: idPerson },
            student: { enrollment: { isActive: true } },
          },
          {
            parentTwoId: { id: idPerson },
            student: { enrollment: { isActive: true } },
          },
        ],
        relations: {
          student: {
            enrollment: { activityClassroom: { grade: { level: true } } },
          },
        },
      });
      if (!getParent) {
        return {
          type: 'Interesado',
          email: userCreated.email,
          crmGHLId: userCreated.crmGHLId,
          name: data.name,
          lastName: `${data.lastName} ${data.mLastname}`,
        };
      }
      if (!getParent.student[0].enrollment) {
        return {
          type: 'Interesado',
          email: userCreated.email,
          crmGHLId: userCreated.crmGHLId,
          name: data.name,
          lastName: `${data.lastName} ${data.mLastname}`,
        };
      }
      return {
        type: 'Matriculado',
        email: userCreated.email,
        crmGHLId: userCreated.crmGHLId,
        name: data.name,
        lastName: `${data.lastName} ${data.mLastname}`,
        grade: getParent.student[0].enrollment[0].activityClassroom.grade.name,
        level:
          getParent.student[0].enrollment[0].activityClassroom.grade.level.name,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async findToCreateInCRM() {
    const users = await this.userRepository.find({
      where: {
        crmGHLId: IsNull(),
      },
    });
    const userDetails = users.map((user) => ({
      email: user.email,
      first_name: user.person.name,
      last_name: `${user.person.lastname},${user.person.mLastname}`,
    }));
    return userDetails;
  }
  async findToUpdateInCRM() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    const yesterday = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    yesterday.setDate(yesterday.getDate() - 1);
    const users = await this.userRepository.find({
      where: {
        crmGHLId: Not(IsNull()),
        updatedAt: Between(new Date(yesterday), new Date(tomorrow)),
      },
    });
    const userDetails = users.map((user) => ({
      crmGHLId: user.crmGHLId,
      email: user.email,
      first_name: user.person.name,
      last_name: user.person.name,
    }));
    return userDetails;
  }
  async findAll() {
    return `Get all person`;
  }
  async findOneStudent(id: number) {
    const person = await this.personRepository.findOne({
      where: { student: { id: id } },
    });
    if (!person) throw new NotFoundException(`person with id ${id} not found`);
    return person;
  }
  async findOne(id: number) {
    const person = await this.personRepository.findOne({
      where: { id: id },
      relations: { user: true },
    });
    if (!person) throw new NotFoundException(`person with id ${id} not found`);
    const { user, ...rest } = person;
    return {
      ...rest,
      email: !user ? null : user.email,
    };
  }
  async findParentsByStudentCode(id: string) {
    const relation = await this.relationShipRepository.find({
      where: {
        sonStudentCode: id,
      },
    });
    const docNumbers = relation.map((item) => item.dniAssignee);
    const parents = await this.personRepository.find({
      where: { docNumber: In(docNumbers) },
    });
    return parents;
  }
  //MODULO DE PADRES
  async findStudentsByParents(user: User) {
    const students = await this.familypRepository.findOne({
      where: [
        {
          parentOneId: { id: user.person.id },
          // student: { enrollment: { isActive: true } },
        },
        {
          parentTwoId: { id: user.person.id },
          // student: { enrollment: { isActive: true } },
        },
      ],
      relations: {
        student: true,
      },
    });
    return students;
  }
  async findAttendanceByStudent(id: number, searchByDateDto: SearchByDateDto) {
    if (isNaN(id)) {
      throw new NotFoundException(`Id is not valid`);
    }
    const startDate = searchByDateDto.startDate;
    const endDate = searchByDateDto.endDate;
    const attendance = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('studentId = :id', { id })
      .andWhere('attendance.arrivalDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
    attendance.forEach((entry) => {
      const date = new Date(entry.arrivalTime);
      date.setHours(date.getHours() - 5);
      const newTime = date.toISOString();
      (entry as any).time = newTime.split('T')[1].split('.')[0];
    });
    return attendance;
  }
  async findProfileUser(user: User) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const enrollShedule = await this.enrollmentScheduleRepository.findOne({
      where: {
        startDate: LessThanOrEqual(today),
        endDate: MoreThanOrEqual(today),
      },
    });
    return {
      user: {
        email: user.email,
        name: user.person.name,
        lastname: user.person.lastname,
        mLastname: user.person.mLastname,
      },
      enrollmentShedule: enrollShedule
        ? {
            type: enrollShedule.type,
            startDate: enrollShedule.startDate,
            endDate: enrollShedule.endDate,
            year: enrollShedule.year.name,
          }
        : undefined,
    };
  }
  async update(id: number, updatePersonDto: UpdatePersonDto) {
    const person = await this.personRepository.preload({
      id: id,
      ...updatePersonDto,
    });
    if (!person)
      throw new NotFoundException(`Person with studentId: ${id} not found`);
    try {
      await this.personRepository.save(person);
      return person;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} person`;
  }

  async uploadPhoto(fileName: string, file: Buffer, id: number) {
    const webpImage = await sharp(file).webp().toBuffer();

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: 'caebucket',
        Key: `colegio/${Date.now()}.webp`,
        Body: webpImage,
      }),
    );
  }
}
