import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Not, Repository } from 'typeorm';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Status } from './enum/status.enum';
import { ResponseEnrrollDto } from './dto/rs-enrolled-classroom.dto';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { SearchEnrolledDto } from './dto/searchEnrollmet-dto';
import { TypePhase } from 'src/phase/enum/type-phase.enum';
import { StudentService } from 'src/student/student.service';
import { SetRatifiedDto } from './dto/set-ratified.dto';
import { FindVacantsDto } from './dto/find-vacants.dto';
import { CreateAscentDto } from './dto/create-ascent.dto';
import { Ascent } from './entities/ascent.entity';
import {
  AvailableClassroom,
  VacantsClassrooms,
} from './interfaces/available.interface';
import { Vacants } from './interfaces/res-vacants.interface';
import { CreateEnrollChildrenDto } from './dto/create-enroll-children.dto';
import { ConfigService } from '@nestjs/config';
import { Rates } from 'src/treasury/entities/rates.entity';
import { Debt } from 'src/treasury/entities/debt.entity';
import axios from 'axios';
import { CreateNewEnrollmentDto } from './dto/create-new-enrrol';
import { DataAdmision } from 'src/family/interfaces/data-admision';
import { GetReportEnrrollDto } from './dto/get-report-enrroll.dto';
import { UpdateExpirationDto } from './dto/update-expiration.dto';
import { FamilyService } from 'src/family/family.service';
import { v4 as uuidv4 } from 'uuid';
import { UpdateManyEnrollmentDto } from './dto/update-many-enrollment.dto';
import { TreasuryService } from 'src/treasury/treasury.service';
import { SectionHistory } from './entities/section-history';
import { ActionType } from 'src/student/enum/actionType.enum';
import { User } from 'src/user/entities/user.entity';

import { SlackService } from 'src/common/slack/slack.service';
import { SlackChannel } from 'src/common/slack/slack.constants';

import { EnrollmentScheduleService } from 'src/enrollment_schedule/enrollment_schedule.service';
import { TypeEnrollmentSchedule } from 'src/enrollment_schedule/enum/type-enrollment_schedule';

import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger('EnrollmentService');
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Ascent)
    private readonly ascentRepository: Repository<Ascent>,
    @InjectRepository(SectionHistory)
    private readonly sectionHistoryRepository: Repository<SectionHistory>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
    @InjectRepository(Rates)
    private readonly ratesRepository: Repository<Rates>,
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    /**servicios */
    private readonly studentService: StudentService,
    private readonly treasuryService: TreasuryService,
    private readonly familyService: FamilyService,
    private readonly slackService: SlackService,
    private readonly enrollmentScheduleService: EnrollmentScheduleService,
    @InjectQueue('enrollment') private enrollQueue: Queue,
  ) {}
  /**env */
  private readonly urlAdmision = this.configService.getOrThrow('API_ADMISION');

  /**PREMATRICULAR */
  async create(createEnrollmentDto: CreateEnrollChildrenDto, user: any) {
    const roles = user.resource_access['client-test-appae'].roles;

    const isAuth = ['administrador-colegio', 'secretaria'].some((role) =>
      roles.includes(role),
    );
    const codes = [];
    const idsStudent = [];
    for (const ce of createEnrollmentDto.enrrollments) {
      /**Validar que sea el papá quien prematricula */
      if (!isAuth) {
        const father = await this.personRepository.findOneBy({
          // docNumber: user.dni,
          user: {
            email: user.email,
          },
        });

        const student = await this.studentRepository.findOne({
          where: {
            id: ce.studentId,
          },
          relations: {
            family: {
              parentOneId: true,
              parentTwoId: true,
            },
          },
        });

        if (
          student.family.parentOneId?.id !== father.id &&
          student.family.parentTwoId?.id !== father.id
        ) {
          throw new UnauthorizedException('This user is not authorized');
        }
      }

      /** funcion para Validar se pre - matricule a una de las aulas disponibles para este estudiante */
      const availables = await this.getAvailableClassrooms(ce.studentId);

      const ids = availables.map((av) => av.id);

      const isOkClassroom = ids.includes(ce.activityClassroomId);
      if (!isOkClassroom) {
        throw new BadRequestException('Incorrect Classroom or not available');
      }

      const classroom = await this.activityClassroomRepository.findOneByOrFail({
        id: ce.activityClassroomId,
      });
      const year = classroom.phase.year;
      const existEnrroll = await this.enrollmentRepository.findOne({
        where: {
          student: { id: ce.studentId },
          status: Status.RESERVADO,
          code: `${classroom.phase.year.name}${classroom.phase.type === TypePhase.Regular ? '1' : '2'}S${ce.studentId}`,
        },
      });
      if (!existEnrroll) {
        /**validar capacidad */
        const capacity = classroom.classroom.capacity;
        const enrollmentsByActivityClassroom =
          await this.enrollmentRepository.find({
            where: [
              {
                activityClassroom: {
                  id: ce.activityClassroomId,
                },
                status: Status.MATRICULADO,
              },
              {
                activityClassroom: {
                  id: ce.activityClassroomId,
                },
                status: Status.PREMATRICULADO, // Cambia esto por el estado adicional que necesites
              },
              {
                activityClassroom: {
                  id: ce.activityClassroomId,
                },
                status: Status.RESERVADO, // Cambia esto por el estado adicional que necesites
              },
              {
                activityClassroom: {
                  id: ce.activityClassroomId,
                },
                status: Status.EN_PROCESO, // Cambia esto por el estado adicional que necesites
              },
            ],
          });
        if (enrollmentsByActivityClassroom.length >= capacity) {
          throw new BadRequestException(
            'those enrolled exceed the capacity of the classroom ',
          );
        }
        const newExpirationDate = new Date();
        newExpirationDate.setDate(newExpirationDate.getDate() + 10);
        const enrollment = this.enrollmentRepository.create({
          student: { id: ce.studentId },
          activityClassroom: { id: ce.activityClassroomId },
          code: `${classroom.phase.year.name}${classroom.phase.type === TypePhase.Regular ? '1' : '2'}S${ce.studentId}`,
          status: Status.PREMATRICULADO,
          dateOfChange: new Date(),
          reservationExpiration: newExpirationDate,
        });
        const enrroll = await this.enrollmentRepository.save(enrollment);
        const activityClassroom =
          await this.activityClassroomRepository.findOneBy({
            id: ce.activityClassroomId,
          });
        /**generar deuda MATRICULA */
        const levelId = activityClassroom.grade.level.id;
        const campusDetailId = activityClassroom.classroom.campusDetail.id;

        const rate = await this.ratesRepository.findOne({
          where: {
            level: { id: levelId },
            campusDetail: { id: campusDetailId },
            concept: { id: 1 },
            yearId: year.id,
          },
          relations: {
            concept: true,
          },
        });
        const dateEnd = new Date();
        const createdDebt = this.debtRepository.create({
          dateEnd: new Date(dateEnd.setDate(dateEnd.getDate() + 30)),
          concept: { id: rate.concept.id },
          student: { id: ce.studentId },
          total: rate.total,
          status: false,
          description: enrroll.code,
          code: `MAT${enrroll.code}`,
          isCanceled: false,
        });

        await this.debtRepository.save(createdDebt);

        codes.push(enrollment.code);
        idsStudent.push(ce.studentId);
      } else {
        const newExpirationDate = new Date();
        newExpirationDate.setDate(newExpirationDate.getDate() + 10);
        existEnrroll.reservationExpiration = newExpirationDate;
        existEnrroll.dateOfChange = new Date();
        existEnrroll.status = Status.PREMATRICULADO;
        existEnrroll.isActive = true;
        existEnrroll.activityClassroom.id = ce.activityClassroomId;
        await this.enrollmentRepository.save(existEnrroll);
        codes.push(existEnrroll.code);
        idsStudent.push(ce.studentId);
      }
    }

    try {
      // await this.enrollmentRepository
      //   .createQueryBuilder()
      //   .update(Enrollment)
      //   .set({
      //     // isActive: false,
      //     status: Status.FINALIZADO,
      //   })
      //   .where('code NOT IN (:...codes)', { codes })
      //   .andWhere('studentId IN (:...idsStudent)', { idsStudent })
      //   .andWhere('status = :statusEnrroll', {
      //     statusEnrroll: Status.MATRICULADO,
      //   })
      //   // .orWhere('status = :otherStatusEnrroll', {
      //   //   otherStatusEnrroll: Status.EN_PROCESO,
      //   // })
      //   .execute();

      return codes;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  /**PONER MATRICULA EN PROCESO CUANDO SE TRASLADA */
  async createEnrollmentWithStatus(
    studentId: number,
    activityClassroomId: number,
    status: Status,
    code: string,
  ) {
    try {
      const newEnrroll = this.enrollmentRepository.create({
        student: { id: studentId },
        activityClassroom: { id: activityClassroomId },

        status,
        code,
      });
      return await this.enrollmentRepository.save(newEnrroll);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async createMany(createManyEnrollmentDto: UpdateManyEnrollmentDto) {
    const { persons, activityClassroomId } = createManyEnrollmentDto;
    let existingStudentCount = 0;
    let noexistingStudentCount = 0;
    try {
      for (const person of persons) {
        const existStudent = await this.enrollmentRepository.findOne({
          where: {
            activityClassroom: { id: activityClassroomId },
            student: {
              person: {
                docNumber: person.docNumber,
              },
            },
          },
        });
        if (!existStudent) {
          noexistingStudentCount++;
        }
        if (existStudent) {
          existStudent.student.studentCode = person.studentCode;
          existStudent.student.siagie = person.siagie;
          const student = await this.studentRepository.preload({
            id: existStudent.student.id,
            ...existStudent.student,
          });
          await this.studentRepository.save(student);
          existingStudentCount++;
        }
      }
      return {
        message: `Estudiantes Actualizados: ${existingStudentCount}`,
        error: `Estudiantes NO actualizados: ${noexistingStudentCount} `,
        statusCode: 200,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async findAll() {
    const enrollments = await this.enrollmentRepository.find();
    return enrollments;
  }
  async findEnrollmentByStudentAndStatus(studentId: number, status: Status) {
    try {
      const enroll = await this.enrollmentRepository.findOne({
        where: {
          student: { id: studentId },
          status: status,
        },
      });
      return enroll;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  // ** matriculados por aula
  async findByActivityClassroom(
    searchEnrolledDto: SearchEnrolledDto,
  ): Promise<ResponseEnrrollDto[]> {
    const { campusId, levelId, yearId } = searchEnrolledDto;
    const classrooms = await this.activityClassroomRepository.find({
      where: {
        phase: {
          year: !isNaN(+yearId) ? { id: +yearId } : {},
        },
        classroom: {
          campusDetail: !isNaN(+campusId) ? { id: +campusId } : {},
        },
        grade: {
          level: !isNaN(+levelId) ? { id: +levelId } : {},
        },
      },
    });
    const classroomsIds = classrooms.map((classroom) => {
      return classroom.id;
    });
    const enrollmentsByActivityClassroom = await this.enrollmentRepository.find(
      {
        where: {
          activityClassroom: {
            id: In(classroomsIds),
          },
        },
        order: {
          student: {
            person: { lastname: 'ASC', mLastname: 'ASC', name: 'ASC' },
          },
        },
      },
    );
    //**TODO: se debe utilizar el atributo  student.studentCode el temporal es student.person.studentCode */
    const data = enrollmentsByActivityClassroom.map(
      ({ id, status, student, activityClassroom }) => ({
        id,
        status,

        student: {
          id: student.id,
          name: student.person.name,
          lastname: student.person.lastname,
          mLastname: student.person.mLastname,
          gender: student.person.gender,
          docNumber: student.person.docNumber,
          studentCode:
            student.studentCode === null ? 'none' : student.studentCode,
        },
        activityClassroom: {
          id: activityClassroom.id,
          code: activityClassroom.classroom.code,
          grade: activityClassroom.grade.name,
          level: activityClassroom.grade.level.name,
          section: activityClassroom.section,
          gradeId: activityClassroom.grade.id,
          campusDetailId: activityClassroom.classroom.campusDetail.id,
        },
      }),
    );

    return data;
  }

  async findOne(id: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: id },
    });
    if (!enrollment)
      throw new NotFoundException(`Enrollment with id ${id} not found`);
    return enrollment;
  }

  async update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    const enrollment = await this.enrollmentRepository.preload({
      id: id,
      ...updateEnrollmentDto,
    });
    if (!enrollment)
      throw new NotFoundException(`Enrollment with id: ${id} not found`);
    try {
      await this.enrollmentRepository.save(enrollment);
      return enrollment;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const enrollment = await this.enrollmentRepository.findOneBy({ id });
    if (!enrollment)
      throw new NotFoundException(`Enrollment by id: '${id}' not found`);
    try {
      await this.enrollmentRepository.remove(enrollment);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async removeAllByActivityClassroom(activityClassroomId: number) {
    const enrollment = await this.enrollmentRepository.find({
      where: { activityClassroom: { id: activityClassroomId } },
    });
    if (enrollment.length <= 0)
      throw new NotFoundException(`Enrollment by id: not found`);
    try {
      await this.enrollmentRepository.remove(enrollment);
      return {
        message: 'successful deletion',
        error: '',
        statusCode: 200,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  /**RATIFICACION */
  async setRatified(query: SetRatifiedDto, code: string) {
    const { desicion } = query;
    // if (desicion != '1' ) {
    //   throw new BadRequestException(`desicion must be a number (1 or 2)`);
    // }
    const enrollment = await this.enrollmentRepository.findOne({
      where: { code },
    });
    if (!enrollment)
      throw new NotFoundException(`Enrollment by code: not found`);
    try {
      enrollment.ratified = desicion === '1' ? true : false;
      await this.enrollmentRepository.save(enrollment);
      return {
        message: 'successful update',
        error: '',
        statusCode: 200,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async getRatified(yearId: number) {
    const totalMatriculados = await this.enrollmentRepository.count({
      where: {
        activityClassroom: {
          phase: {
            year: { id: yearId },
          },
        },
      },
    });
    const totalRatificados = await this.enrollmentRepository.count({
      where: {
        activityClassroom: {
          phase: {
            year: { id: yearId },
          },
        },
        ratified: true,
      },
    });
    const totalNoRatificados = totalMatriculados - totalRatificados;
    return {
      totalMatriculados,
      totalRatificados,
      totalNoRatificados,
      // Otros datos
    };
  }

  async getVacantsTest() {
    return await this.calcVacantsToClassroom(107);
  }
  //: Promise<Vacants[]>
  async getVacants(yearId: number, query: FindVacantsDto): Promise<Vacants[]> {
    const { campusId, levelId } = query;
    const vacants: VacantsClassrooms[] = [];
    const whereCondition: any = {
      phase: {
        year: {
          id: yearId,
        },
      },
    };
    if (campusId) {
      whereCondition.classroom = {
        campusDetail: {
          id: campusId,
        },
      };
    }
    if (levelId) {
      whereCondition.grade = {
        level: {
          id: levelId,
        },
      };
    }
    try {
      const activityClassrooms = await this.activityClassroomRepository.find({
        where: whereCondition,
      });

      for (const ac of activityClassrooms) {
        // const enrrollmentRatified = await this.enrollmentRepository.find({
        //   where: {
        //     activityClassroom: {
        //       // id: activityClassrooms[0].id,
        //       grade: {
        //         // id: ac.grade.id,
        //         position: ac.grade.position - 1,
        //       },
        //       section: ac.section,
        //       phase: {
        //         year: {
        //           id: yearId - 1,
        //         },
        //       },
        //     },
        //     ratified: true,
        //   },
        // });

        // const currentEnrrollment = await this.enrollmentRepository.find({
        //   where: {
        //     activityClassroom: {
        //       // id: activityClassrooms[0].id,
        //       grade: {
        //         // id: ac.grade.id,
        //         position: ac.grade.position,
        //       },
        //       section: ac.section,
        //       phase: {
        //         year: {
        //           id: yearId,
        //         },
        //       },
        //     },
        //   },
        // });

        // const rtAndEnr = enrrollmentRatified.filter((item1) =>
        //   currentEnrrollment.some(
        //     (item2) => item1.student.id === item2.student.id,
        //   ),
        // );

        // /**menos los que ya estan matriculados, el calculo varia dependiendo del cronograma */
        // const capacity = ac.classroom.capacity;
        // const ratifieds = enrrollmentRatified.length - rtAndEnr.length;

        // /**temporal, la fórmula varia en funcion al cronograma */
        // const vacant = capacity - ratifieds - currentEnrrollment.length;
        // /**formula para cuando no tengan que ver los ratificados */
        // // const vacant = capacity - ratifieds - currentEnrrollment.length;
        const data: VacantsClassrooms = await this.calcVacantsToClassroom(
          ac.id,
        );

        vacants.push(data);
        // vacants.push({
        //   gradeId: ac.grade.id,
        //   grade: ac.grade.name,
        //   section: ac.section,
        //   level: ac.grade.level.name,
        //   capacity,
        //   ratified: ratifieds,
        //   // enrollments: rtAndEnr.length,
        //   enrollments: currentEnrrollment.length,
        //   vacant,
        // });
      }

      const groupedData = vacants.reduce((acc, curr) => {
        const {
          gradeId,

          grade,
          level,
          capacity,
          previousEnrolls,
          currentEnrroll,
          section,
          detailOrigin,
          reserved,
          onProcess,
        } = curr;

        if (!acc[gradeId]) {
          acc[gradeId] = {
            // gradeId,
            grade,
            level,
            capacity: 0,
            ratified: 0,
            enrollments: 0,
            vacant: 0,
            totalPreRegistered: 0,
            totalReserved: 0,
            totalOnProcces: 0,
            sections: [],
          };
        }
        acc[gradeId].sections.push({
          section,
          capacity,
          ratified: previousEnrolls,
          //ratified: 0,
          enrollments: currentEnrroll,
          vacant:
            capacity - previousEnrolls - currentEnrroll - reserved - onProcess, //antiguos
          totalReserved: reserved,
          totalOnProcces: onProcess,
          totalPreRegistered: 0,
          // vacant: capacity - currentEnrroll, nuevos
          detailOrigin,
        });
        acc[gradeId].capacity += capacity;
        acc[gradeId].totalReserved += reserved;
        acc[gradeId].totalOnProcces += onProcess;
        acc[gradeId].ratified += previousEnrolls;
        // acc[gradeId].ratified += 0;
        acc[gradeId].enrollments += currentEnrroll;
        acc[gradeId].vacant =
          acc[gradeId].capacity -
          acc[gradeId].ratified -
          acc[gradeId].enrollments -
          acc[gradeId].totalReserved -
          acc[gradeId].totalOnProcces;

        return acc;
      }, {});

      const result: Vacants[] = Object.values(groupedData);

      return result;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async getVacantsBySchedule(yearId: number, query: FindVacantsDto) {
    const schedule = await this.enrollmentScheduleService.findOneByDate({
      currentDate: this.convertISODateToYYYYMMDD(new Date()),
      type: TypeEnrollmentSchedule.Ratification,
      yearId: 17,
    });
    //TODO hacer que sea dependiente del cronograma, preguntar
    return schedule;
  }

  private convertISODateToYYYYMMDD(isoDateString) {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() devuelve un índice de mes basado en cero
    const day = date.getDate();

    // Añadir un cero a la izquierda para los meses y días menores de 10
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;

    return `${year}-${formattedMonth}-${formattedDay}`;
  }

  /**Configuracion de ascenso */
  async createAscent(createAscentDto: CreateAscentDto) {
    /**Validaciones */
    //TODO validar jerarquia */
    try {
      await this.ascentRepository
        .createQueryBuilder()
        .delete()
        .from('ascent')
        .where('originId = :id', { id: createAscentDto.originId })
        .execute();

      const promises = createAscentDto.destinations.map(
        async (destinationId) => {
          const ascent = this.ascentRepository.create({
            originId: { id: createAscentDto.originId },
            destinationId: { id: destinationId },
            year: { id: createAscentDto.yearId },
          });

          await this.ascentRepository.save(ascent);
        },
      );
      await Promise.all(promises);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async getAscent(yearId: number) {
    try {
      const ascents = await this.ascentRepository.find({
        where: {
          year: {
            id: yearId,
          },
        },
      });
      return ascents;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  /**obtener grado y seccion permitido para el usario */
  async getAvailableClassrooms(studentId: number) {
    //TODO  validar pertenecia del hijo s */
    //TODO agregar parametro para ver disponibloes segun modalidad, cambio o matricula
    const availables: AvailableClassroom[] = [];
    const currentEnrrollment = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.activityClassroom', 'ac')
      .leftJoinAndSelect('ac.grade', 'grade')
      .leftJoinAndSelect('ac.phase', 'phase')
      .leftJoinAndSelect('phase.year', 'year')
      .leftJoinAndSelect('ac.classroom', 'classroom')
      .leftJoinAndSelect('classroom.campusDetail', 'campusDetail')
      .where('enrollment.studentId = :id', { id: studentId })
      .orderBy('enrollment.id', 'DESC')
      .getOne();
    // await this.calcVacantsAc(12);
    if (!currentEnrrollment) {
      throw new NotFoundException('Dont exists this data');
    }
    if (currentEnrrollment.status === Status.RESERVADO) {
      const ac = currentEnrrollment.activityClassroom;
      const acs = await this.activityClassroomRepository.find({
        where: {
          grade: { id: ac.grade.id },
          phase: { id: ac.phase.id },
          classroom: {
            campusDetail: {
              id: ac.classroom.campusDetail.id,
            },
          },
        },
      });

      for (const act of acs) {
        const dest = await this.vacancyCalculation(act.id);

        if (dest.hasVacant || ac.id === dest.id) {
          const classroom: AvailableClassroom = {
            id: dest.id,
            name: dest.grade + ' ' + dest.section,
            vacants: dest.vacant,
            suggested: ac.id === dest.id,
            campus: act.classroom.campusDetail.name,
            level: act.grade.level.name,
          };
          availables.push(classroom);
        }
      }
      return availables;
    }
    if (
      currentEnrrollment.status === Status.PREMATRICULADO ||
      currentEnrrollment.status === Status.MATRICULADO
    ) {
      const ac = currentEnrrollment.activityClassroom;
      const acs = await this.activityClassroomRepository.find({
        where: {
          grade: { id: ac.grade.id },
          phase: { id: ac.phase.id },
          classroom: {
            campusDetail: {
              id: ac.classroom.campusDetail.id,
            },
          },
        },
      });

      for (const act of acs) {
        const dest = await this.vacancyCalculation(act.id);

        if (dest.hasVacant || ac.id === dest.id) {
          const classroom: AvailableClassroom = {
            id: dest.id,
            name: dest.grade + ' ' + dest.section,
            vacants: dest.vacant,
            suggested: ac.id === dest.id,
            campus: act.classroom.campusDetail.name,
            level: act.grade.level.name,
          };
          availables.push(classroom);
        }
      }
      return availables;
    }

    const yearId = currentEnrrollment.activityClassroom.phase.year.id;

    // return await this.calcVacantsToClassroom(153);
    try {
      const configAscent = await this.ascentRepository.find({
        where: {
          originId: { id: currentEnrrollment.activityClassroom.id },
          year: { id: yearId },
        },
      });
      /**un destino */
      if (configAscent.length === 1) {
        console.log('one dest');
        const { destinationId } = configAscent[0];
        const dest = await this.calcVacantsToClassroom(destinationId.id);
        const classroom: AvailableClassroom = {
          id: destinationId.id,
          name: destinationId.grade.name + ' ' + destinationId.section,
          vacants: dest.vacants,
          suggested: true,
          campus: destinationId.classroom.campusDetail.name,
          level: destinationId.grade.level.name,
        };
        availables.push(classroom);
        return availables;
      }
      /**mas de un destino */
      if (configAscent.length > 1) {
        /**tiene mas de un destino, entonces es el aula que se parte*/
        /**calcular las vacantes de sus destinos s*/

        for (const co of configAscent) {
          const dest = await this.calcVacantsToClassroom(co.destinationId.id);

          //dest.hasVacants
          /**dest.section === currentEnrrollment.activityClassroom.section ||
            dest.detailOrigin.section ===
              currentEnrrollment.activityClassroom.section */
          if (dest.hasVacants) {
            const classroom: AvailableClassroom = {
              id: co.destinationId.id,
              name:
                co.destinationId.grade.name + ' ' + co.destinationId.section,
              vacants: dest.vacants,
              suggested:
                dest.section === currentEnrrollment.activityClassroom.section ||
                dest.detailOrigin.section ===
                  currentEnrrollment.activityClassroom.section
                  ? true
                  : false,
              campus: co.destinationId.classroom.campusDetail.name,
              level: co.destinationId.grade.level.name,
            };

            availables.push(classroom);
          }
          // if (dest.hasVacants) {
          //   const classroom: AvailableClassroom = {
          //     id: co.destinationId.id,
          //     name:
          //       co.destinationId.grade.name + ' ' + co.destinationId.section,
          //     vacants: dest.vacants,
          //     suggested: false,
          //   };
          //   availables.push(classroom);
          // }
        }
        return availables;
      }
      /**Normal available */
      const campusId =
        currentEnrrollment.activityClassroom.classroom.campusDetail.id;
      const classrooms = await this.activityClassroomRepository.find({
        where: {
          // section: currentEnrrollment.activityClassroom.section,
          grade: {
            position: currentEnrrollment.activityClassroom.grade.position + 1,
          },
          phase: {
            year: {
              id: yearId + 1,
            },
          },
          classroom: {
            campusDetail: { id: campusId },
          },
        },
      });

      for (const ac of classrooms) {
        const dest = await this.vacancyCalculation(ac.id);

        // if (
        //   dest.section === currentEnrrollment.activityClassroom.section ||
        //   dest.hasVacants
        // ) {

        if (dest.hasVacant) {
          const classroom: AvailableClassroom = {
            id: ac.id,
            name: ac.grade.name + ' ' + ac.section,
            vacants: dest.vacant,
            suggested:
              dest.section === currentEnrrollment.activityClassroom.section
                ? true
                : false,
            campus: ac.classroom.campusDetail.name,
            level: ac.grade.level.name,
          };
          availables.push(classroom);
        }
        // if (dest.hasVacants) {
        //   const classroom: AvailableClassroom = {
        //     id: ac.id,
        //     name: ac.grade.name + ' ' + ac.section,
        //     vacants: dest.vacants,
        //     suggested: false,
        //   };
        //   availables.push(classroom);
        // }
      }
      // const classroom = {
      //   id: availableClassroom.id,
      //   name: availableClassroom.grade.name + ' ' + availableClassroom.section,
      // };
      // availables.push(classroom);
      console.log('normal dest');
      return availables;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  /**FUNCION PARA TRASLADOS */
  async getAvailableClassroomsToTransfers(
    studentId: number,
    campusIdParam?: number,
  ) {
    const availables: AvailableClassroom[] = [];
    const currentEnrrollment = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.activityClassroom', 'ac')
      .leftJoinAndSelect('ac.grade', 'grade')
      .leftJoinAndSelect('ac.phase', 'phase')
      .leftJoinAndSelect('phase.year', 'year')
      .leftJoinAndSelect('ac.classroom', 'classroom')
      .leftJoinAndSelect('classroom.campusDetail', 'campusDetail')
      .where('enrollment.studentId = :id', { id: studentId })
      .orderBy('enrollment.id', 'DESC')
      .getOne();

    if (!currentEnrrollment) {
      throw new NotFoundException('Dont exists this data');
    }

    const yearId = currentEnrrollment.activityClassroom.phase.year.id;

    try {
      const campusId = campusIdParam
        ? campusIdParam
        : currentEnrrollment.activityClassroom.classroom.campusDetail.id;
      const classrooms = await this.activityClassroomRepository.find({
        where: {
          // section: currentEnrrollment.activityClassroom.section,
          grade: {
            position: currentEnrrollment.activityClassroom.grade.position,
          },
          phase: {
            year: {
              id: yearId,
            },
          },
          classroom: {
            campusDetail: { id: campusId },
          },
        },
      });

      for (const ac of classrooms) {
        const dest = await this.vacancyCalculation(ac.id);

        if (dest.hasVacant) {
          const classroom: AvailableClassroom = {
            id: ac.id,
            name: ac.grade.name + ' ' + ac.section,
            vacants: dest.vacant,
            suggested:
              dest.section === currentEnrrollment.activityClassroom.section
                ? true
                : false,
            campus: ac.classroom.campusDetail.name,
            level: ac.grade.level.name,
          };
          availables.push(classroom);
        }
      }

      return availables;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  private async calcVacantsToClassroom(activityClassroomId: number) {
    const activityClassroom = await this.activityClassroomRepository.findOne({
      where: { id: activityClassroomId },
    });
    const yearId = activityClassroom.phase.year.id;

    /**se quita un año para calcular con la configuracion del año anteriror */
    const configAscent = await this.ascentRepository.find({
      where: {
        destinationId: { id: activityClassroomId },
        // originId:Not(value)
        year: { id: yearId - 1 },
      },
    });

    const origins = configAscent.map((c) => c.originId.id);
    if (configAscent.length === 1) {
      console.log('un dest');
      /** calcular vacantes */
      const { originId, destinationId } = configAscent[0];

      const enrolledInOther = await this.enrollmentRepository.find({
        where: {
          activityClassroom: {
            // id: activityClassrooms[0].id,
            grade: {
              // id: ac.grade.id,
              position: activityClassroom.grade.position,
            },
            section: Not(activityClassroom.section),
            phase: {
              year: {
                id: yearId,
              },
            },
            classroom: {
              campusDetail: { id: activityClassroom.classroom.campusDetail.id },
            },
          },
          ratified: true,
          status: Status.MATRICULADO,
          isActive: true,
        },
      });
      /**ADD DEFAULT CODE */
      const anotherOriginDefault = await this.enrollmentRepository.find({
        where: {
          activityClassroom: {
            // id: activityClassrooms[0].id,
            grade: {
              // id: ac.grade.id,
              position: activityClassroom.grade.position - 1,
            },
            section: activityClassroom.section,
            phase: {
              year: {
                id: yearId - 1,
              },
            },
            classroom: {
              campusDetail: { id: activityClassroom.classroom.campusDetail.id },
            },
          },
          ratified: true,
          status: Status.MATRICULADO,
          isActive: true,
        },
      });

      const enrollOrigin = await this.enrollmentRepository.find({
        where: {
          activityClassroom: { id: originId.id },
          ratified: true,
          status: Status.MATRICULADO,
          isActive: true,
        },
      });

      /**problema acá destinoID */
      const currentEnrroll = await this.enrollmentRepository.find({
        where: {
          activityClassroom: { id: destinationId.id },
        },
      });

      const currentReserved = await this.enrollmentRepository.find({
        where: {
          activityClassroom: { id: activityClassroom.id },
          status: Status.RESERVADO,
        },
      });

      const currentOnProcess = await this.enrollmentRepository.find({
        where: {
          activityClassroom: { id: activityClassroom.id },
          status: Status.EN_PROCESO,
        },
      });

      const rtAndEnr = enrollOrigin.filter((item1) =>
        currentEnrroll.some((item2) => item1.student.id === item2.student.id),
      );

      const rtAndEnrInOther = enrolledInOther.filter((item1) =>
        enrollOrigin.some((item2) => item1.student.id === item2.student.id),
      );
      const rtAndEnrInOtherDefault = anotherOriginDefault.filter((item1) =>
        enrollOrigin.some((item2) => item1.student.id === item2.student.id),
      );
      const ratifieds =
        enrollOrigin.length +
        anotherOriginDefault.length -
        rtAndEnr.length -
        rtAndEnrInOther.length -
        rtAndEnrInOtherDefault.length;
      // const vacants =
      //   destinationId.classroom.capacity - ratifieds - currentEnrroll.length;
      const vacants = destinationId.classroom.capacity - currentEnrroll.length;

      const res: VacantsClassrooms = {
        id: activityClassroom.id,
        gradeId: destinationId.grade.id,
        grade: destinationId.grade.name,
        section: destinationId.section,
        level: destinationId.grade.level.name,
        capacity: destinationId.classroom.capacity,
        previousEnrolls: ratifieds,
        currentEnrroll: currentEnrroll.length,
        vacants,
        reserved: currentReserved.length,
        onProcess: currentOnProcess.length,
        hasVacants: vacants > 0,
        type: 'O',
        detailOrigin: {
          id: originId.id,
          grade: originId.grade.name,
          section: originId.section,
          enrrolls: enrollOrigin.length,
        },
      };
      // console.log('solo un conf', res);
      return res;
    }

    /**si tiene mas de dos origenes -> buscar cual tiene dos destinos*/
    if (configAscent.length > 1) {
      console.log('doble dest');
      /**verificar cual tiene dos destinos */
      // let hasTwoDest;
      let oneDest;
      let origin;
      const configOrigin = await this.ascentRepository.find({
        where: {
          originId: In(origins),
          // year: { id: ac.yearId },
        },
      });
      /**recorrer la configuracion y verificar cualtiene dos destinos */
      for (const co of configOrigin) {
        const destings = await this.ascentRepository.find({
          where: {
            originId: { id: co.originId.id },
            destinationId: { section: Not(co.originId.section) },
          },
        });
        if (destings.length === 1) {
          oneDest = co.originId.id;
          origin = co.originId;
        }
        // console.log(destings);
        // else {
        //   hasTwoDest = co.originId.id;
        // }
      }

      /**calcular vacantes */
      const enrolledInOther = await this.enrollmentRepository.find({
        where: {
          activityClassroom: {
            // id: activityClassrooms[0].id,
            grade: {
              // id: ac.grade.id,
              position: activityClassroom.grade.position,
            },
            section: Not(activityClassroom.section),
            phase: {
              year: {
                id: yearId,
              },
            },
            classroom: {
              campusDetail: { id: activityClassroom.classroom.campusDetail.id },
            },
          },
          ratified: true,
        },
      });
      const enrollPriority = await this.enrollmentRepository.find({
        where: {
          activityClassroom: { id: oneDest },
          ratified: true,
        },
      });

      // const enrollNotPriority = await this.enrollmentRepository.find({
      //   where: {
      //     activityClassroom: { id: hasTwoDest },
      //   },
      // });

      const currentEnrroll = await this.enrollmentRepository.find({
        where: {
          activityClassroom: { id: activityClassroom.id },
        },
      });

      const currentReserved = await this.enrollmentRepository.find({
        where: {
          activityClassroom: { id: activityClassroom.id },
          status: Status.RESERVADO,
        },
      });

      const currentOnProcess = await this.enrollmentRepository.find({
        where: {
          activityClassroom: { id: activityClassroom.id },
          status: Status.EN_PROCESO,
        },
      });

      const rtAndEnr = enrollPriority.filter((item1) =>
        currentEnrroll.some((item2) => item1.student.id === item2.student.id),
      );
      const rtAndEnrInOther = enrolledInOther.filter((item1) =>
        enrollPriority.some((item2) => item1.student.id === item2.student.id),
      );

      const ratifieds =
        enrollPriority.length - rtAndEnr.length - rtAndEnrInOther.length;
      // console.log('priorti', enrollPriority.length);
      // console.log('rat y mat', rtAndEnr.length);
      // console.log('rat y other', rtAndEnrInOther.length);
      // console.log('capacidad', activityClassroom.classroom.capacity);
      // console.log('ratificados', ratifieds);
      // console.log('mat act', currentEnrroll.length);
      // const vacants =
      //   activityClassroom.classroom.capacity -
      //   ratifieds -
      //   currentEnrroll.length;
      const vacants =
        activityClassroom.classroom.capacity - currentEnrroll.length;

      const res: VacantsClassrooms = {
        id: activityClassroom.id,
        gradeId: activityClassroom.grade.id,
        grade: activityClassroom.grade.name,
        section: activityClassroom.section,
        level: activityClassroom.grade.level.name,
        capacity: activityClassroom.classroom.capacity,
        previousEnrolls: ratifieds,
        currentEnrroll: currentEnrroll.length,
        reserved: currentReserved.length,
        onProcess: currentOnProcess.length,
        vacants,
        hasVacants: vacants > 0,
        type: 'P',
        detailOrigin: {
          id: origin?.id,
          grade: origin?.grade.name,
          section: origin?.section,
          enrrolls: enrollPriority.length,
        },
      };
      // console.log('priority', res);
      return res;
    }

    /**calcular vacantes normalmente segun correlacion pero mateniendo a la sede */
    const enrolledInOther = await this.enrollmentRepository.find({
      where: {
        activityClassroom: {
          // id: activityClassrooms[0].id,
          grade: {
            // id: ac.grade.id,
            position: activityClassroom.grade.position,
          },
          section: Not(activityClassroom.section),
          phase: {
            year: {
              id: yearId,
            },
          },
          classroom: {
            campusDetail: { id: activityClassroom.classroom.campusDetail.id },
          },
        },
        ratified: true,

        status: Status.MATRICULADO,
        isActive: true,
      },
    });
    const enrollOrigin = await this.enrollmentRepository.find({
      where: {
        activityClassroom: {
          // id: activityClassrooms[0].id,
          grade: {
            // id: ac.grade.id,
            position: activityClassroom.grade.position - 1,
          },
          section: activityClassroom.section,
          phase: {
            year: {
              id: yearId - 1,
            },
          },
          classroom: {
            campusDetail: { id: activityClassroom.classroom.campusDetail.id },
          },
        },
        ratified: true,
        status: Status.MATRICULADO,
        isActive: true,
      },
    });
    const currentEnrroll = await this.enrollmentRepository.find({
      where: {
        activityClassroom: { id: activityClassroom.id },
        status: Status.MATRICULADO,
      },
    });

    const currentReserved = await this.enrollmentRepository.find({
      where: {
        activityClassroom: { id: activityClassroom.id },
        status: Status.RESERVADO,
      },
    });

    const currentOnProcess = await this.enrollmentRepository.find({
      where: {
        activityClassroom: { id: activityClassroom.id },
        status: Status.EN_PROCESO,
      },
    });

    const rtAndEnr = enrollOrigin.filter((item1) =>
      currentEnrroll.some((item2) => item1.student.id === item2.student.id),
    );
    const rtAndEnrInOther = enrolledInOther.filter((item1) =>
      enrollOrigin.some((item2) => item1.student.id === item2.student.id),
    );

    // console.log(rtAndEnrInOther.length === 1);
    const ratifieds =
      enrollOrigin.length - rtAndEnr.length - rtAndEnrInOther.length;

    // const vacants =
    //   activityClassroom.classroom.capacity - ratifieds - currentEnrroll.length;
    //!no tiene efecto */
    const vacants =
      activityClassroom.classroom.capacity -
      currentEnrroll.length -
      currentReserved.length;

    const res: VacantsClassrooms = {
      id: activityClassroom.id,
      gradeId: activityClassroom.grade.id,
      grade: activityClassroom.grade.name,
      level: activityClassroom.grade.level.name,
      section: activityClassroom.section,
      capacity: activityClassroom.classroom.capacity,
      previousEnrolls: ratifieds,
      currentEnrroll: currentEnrroll.length,
      reserved: currentReserved.length,
      onProcess: currentOnProcess.length,
      vacants,
      hasVacants: vacants > 0,
      type: 'N',
      detailOrigin: {
        id: enrollOrigin[0]?.activityClassroom.id || 0,
        grade: enrollOrigin[0]?.activityClassroom.grade.name || '0',
        section: enrollOrigin[0]?.activityClassroom.section || '0',
        enrrolls: enrollOrigin.length || 0,
      },
    };
    // console.log('normal', res);
    return res;
  }

  private async availableClassrooms(gradeId: number, campusId: number) {
    /**TODO USAR AÑO ACTIVO */
    const availableClassrooms = [];
    const classrooms = await this.activityClassroomRepository.find({
      where: {
        phase: {
          year: {
            id: 17,
          },
        },
        grade: { position: gradeId },
        classroom: {
          campusDetail: {
            id: campusId,
          },
        },
      },
      relations: {
        phase: {
          year: true,
        },
      },
    });

    for (const ac of classrooms) {
      const acv = await this.vacancyCalculation(ac.id);
      if (acv.hasVacant) {
        availableClassrooms.push(ac);
      }
    }

    return availableClassrooms;
  }

  /**calculo para nuevos */
  private async vacancyCalculation(activityClassroomId: number) {
    // Obtener la información del aula y su capacidad
    const ac = await this.activityClassroomRepository.findOne({
      where: { id: activityClassroomId },
      relations: ['classroom', 'grade'], // Traer las relaciones necesarias
    });

    if (!ac) {
      throw new Error('Activity classroom not found');
    }

    // Obtener los conteos de los diferentes estados en una sola consulta
    const enrollmentCounts = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('enrollment.status', 'status')
      .addSelect('COUNT(enrollment.id)', 'count')
      .where('enrollment.activityClassroomId = :activityClassroomId', {
        activityClassroomId,
      })
      .andWhere('enrollment.status IN (:...statuses)', {
        statuses: [
          Status.EN_PROCESO,
          Status.RESERVADO,
          Status.MATRICULADO,
          Status.PREMATRICULADO,
        ],
      })
      .groupBy('enrollment.status')
      .getRawMany();

    // Mapear los resultados en un objeto para facilitar el cálculo
    const counts = enrollmentCounts.reduce(
      (acc, row) => {
        acc[row.status] = parseInt(row.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );

    const reserved = counts[Status.RESERVADO] || 0;
    const enrollments = counts[Status.MATRICULADO] || 0;
    const pre_registered = counts[Status.PREMATRICULADO] || 0;
    const on_procces = counts[Status.EN_PROCESO] || 0;

    const capacity = ac.classroom.capacity;
    const vacant =
      capacity - reserved - enrollments - on_procces - pre_registered;
    const data = {
      id: ac.id,
      grade: ac.grade.name,
      section: ac.section,
      capacity,
      enrollments,
      pre_registered,
      on_procces,
      reserved,
      vacant,
      hasVacant: vacant > 0,
    };

    return data;
  }

  async getVacantsAll(yearId: number, query: FindVacantsDto) {
    const { campusId, levelId } = query;
    const vacants: any[] = [];
    const whereCondition: any = {
      phase: {
        year: {
          id: yearId,
        },
      },
    };
    if (campusId) {
      whereCondition.classroom = {
        campusDetail: {
          id: campusId,
        },
      };
    }
    if (levelId) {
      whereCondition.grade = {
        level: {
          id: levelId,
        },
      };
    }

    const activityClassrooms = await this.activityClassroomRepository.find({
      where: whereCondition,
    });

    for (const ac of activityClassrooms) {
      const data = await this.vacancyCalculation(ac.id);
      vacants.push(data);
    }

    // Agrupamos los datos por grado, manteniendo las secciones
    const groupedData = vacants.reduce(
      (acc, item) => {
        if (!acc[item.grade]) {
          acc[item.grade] = {
            grade: item.grade,
            capacity: 0,
            enrollments: 0,
            totalPreRegistered: 0,
            totalOnProcces: 0,
            totalReserved: 0,
            vacant: 0,
            sections: [],
          };
        }

        // Sumar totales generales
        acc[item.grade].capacity += item.capacity;
        acc[item.grade].enrollments += item.enrollments;
        acc[item.grade].totalPreRegistered += item.pre_registered;
        acc[item.grade].totalOnProcces += item.on_procces;
        acc[item.grade].totalReserved += item.reserved;
        acc[item.grade].vacant += item.vacant;

        // Agregar la sección específica
        acc[item.grade].sections.push({
          section: item.section,
          capacity: item.capacity,
          enrollments: item.enrollments,
          pre_registered: item.pre_registered,
          on_procces: item.on_procces,
          reserved: item.reserved,
          vacant: item.vacant,
          detailOrigin: {
            id: 0,
            grade: '0',
            section: '0',
            enrrolls: 0,
          },
        });

        return acc;
      },
      {} as Record<string, any>,
    );

    // Convertimos el objeto en un array
    const result = Object.values(groupedData);

    return result;
  }
  async getVacantsGeneral(gradeId: number, yearId: number, campusId: number) {
    /***NUEVO inicio */
    let vacantsTot = 0;
    let capacity = 0;
    const activityClassrooms = await this.activityClassroomRepository.find({
      where: {
        grade: { id: gradeId },
        phase: {
          year: { id: yearId },
        },
        classroom: {
          campusDetail: {
            id: campusId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    for (const ac of activityClassrooms) {
      const data: VacantsClassrooms = await this.calcVacantsToClassroom(ac.id);
      vacantsTot += data.capacity - data.previousEnrolls - data.currentEnrroll;
      capacity += data.capacity;
    }
    /***NUEVO FIN */
    // const idsAc = activityClassrooms.map((ac) => ac.id);

    // const countEnrroll = await this.enrollmentRepository.count({
    //   where: {
    //     activityClassroom: {
    //       id: In(idsAc),
    //     },
    //     ratified: true,
    //     status: In([
    //       Status.PREMATRICULADO,
    //       Status.EN_PROCESO,
    //       Status.MATRICULADO,
    //       Status.RESERVADO,
    //     ]),
    //   },
    // });

    /**data destino, aulas configuradas para el grado solicitado */

    // const activityClassroomsDest = await this.activityClassroomRepository.find({
    //   where: {
    //     grade: { id: gradeId },
    //     phase: {
    //       year: { id: yearId },
    //     },
    //   },
    // });

    // const capacities = activityClassrooms.map((ac) => ac.classroom.capacity);

    // const capacity = capacities.reduce(
    //   (accumulator, currentValue) => accumulator + currentValue,
    //   0,
    // );

    // const vacants = capacity - countEnrroll;

    return {
      hasVacants: vacantsTot > 0,
      capacity: capacity,
      enrrolls: capacity - vacantsTot,
      vacants: vacantsTot,
    };
  }
  async getStatusEnrollmentByUser(user: any) {
    // return {
    //   status: false,
    //   // message: user,
    // };
    const enrollments = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('student.family', 'family')
      .leftJoinAndSelect('family.parentOneId', 'parentOne')
      .leftJoinAndSelect('parentOne.user', 'userOne')
      .leftJoinAndSelect('family.parentTwoId', 'parentTwo')
      .leftJoinAndSelect('parentTwo.user', 'userTwo')
      .where('userOne.email = :email', { email: user.email })
      .orWhere('userTwo.email = :email', { email: user.email })
      .getMany();
    if (!enrollments) {
      return {
        status: false,
        message: 'No tiene hijos',
      };
    }
    const hasDebt = enrollments.some(
      (enrollment) => enrollment.student.hasDebt === true,
    );

    if (hasDebt) {
      return {
        status: false,
        message: 'El usuario tiene un hijo con deuda.',
      };
    }
    // const hascConditional = enrollments.some(
    //   (enrollment) => enrollment.behavior === Behavior.MATRICULA_CONDICIONADA,
    // );
    // if (hascConditional) {
    //   return {
    //     status: false,
    //     message: 'El usuario tiene un hijo que con matricula condicionada.',
    //   };
    // }
    // const hasLoss = enrollments.some(
    //   (enrollment) => enrollment.behavior === Behavior.PERDIDA_VACANTE,
    // );
    // if (hasLoss) {
    //   return {
    //     status: false,
    //     message: 'El usuario tiene un hijo que ha perdido su vacante.',
    //   };
    // }
    return {
      status: true,
      message: 'El usuario no tiene niguna restricción de matricula.',
    };
  }

  async enrrollStudent(studentId: number) {
    const enrroll = await this.enrollmentRepository.find({
      where: {
        status: Status.PREMATRICULADO,
        student: { id: studentId },
      },
      order: {
        id: 'DESC',
      },
    });
    if (enrroll.length === 0) {
      throw new BadRequestException(
        'The student does not have pre-registration',
      );
    }
    /** TODO validar que haya pagado  */
    const debts = await this.debtRepository.find({
      where: {
        student: {
          id: studentId,
        },
      },
    });
    if (debts.length > 0) {
      throw new BadRequestException('The student does has debts');
    }
    try {
      const currentEnrroll = enrroll[0];
      currentEnrroll.status = Status.MATRICULADO;
      currentEnrroll.isActive = true;
      await this.enrollmentRepository.save(currentEnrroll);
      return currentEnrroll;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  /**recibe y verifica datos de admision */
  async createNewStudent(createNewEnrollmentDto: CreateNewEnrollmentDto) {
    const body = {
      docNumber: createNewEnrollmentDto.docNumber,
    };

    try {
      /**Consultar si obtuvo vacante en admision */
      const response = await axios.post(
        `${this.urlAdmision}/admin/search-new`,
        body,
      );
      const data = response.data.data as DataAdmision;
      const { child } = data;
      /**validar que haya vacantes */
      const availableClassrooms = await this.availableClassrooms(
        child.grade,
        child.campus,
      );

      // console.log(child.grade, child.campus);
      // return availableClassrooms;
      if (availableClassrooms.length === 0) {
        throw new BadRequestException(
          `not available vacants for ${child.doc_number}`,
        );
      }
      /**CREAR LA DATA */

      await this.familyService.createFamilyFromAdmision(
        data,
        availableClassrooms[0],
      );

      const datas = availableClassrooms.map((ac) => {
        return {
          id: ac.id,
          section: ac.section,
          grade: ac.grade.name,
        };
      });
      return datas;
    } catch (error) {
      this.logger.error(
        `[ADMISION] Error consulta : ${createNewEnrollmentDto.docNumber}`,
      );
      throw new HttpException(
        `[ADMISION] Error al consultar: ${error.response?.data?.errors || error.message}`,
        error.response?.status || 500,
      );
    }
  }

  async searchNewStudent(searchDto: CreateNewEnrollmentDto) {
    const { docNumber } = searchDto;

    const query = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('student.family', 'family')
      .leftJoinAndSelect('family.parentOneId', 'parentOne')
      .leftJoinAndSelect('parentOne.user', 'parentOneUser')
      .leftJoinAndSelect('family.parentTwoId', 'parentTwo')
      .leftJoinAndSelect('parentTwo.user', 'parentTwoUser')
      .leftJoinAndSelect(
        'student.enrollment',
        'enrollment',
        'enrollment.status = :statusRe',
        {
          statusRe: 'on process',
        },
      );
    if (docNumber) {
      const searchTerms = docNumber
        .split(' ')
        .map((term) => term.trim())
        .filter((term) => term.length > 0);

      searchTerms.forEach((term, index) => {
        query.andWhere(
          `(LOWER(person.name) LIKE LOWER(:term${index}) OR LOWER(person.lastname) LIKE LOWER(:term${index}) OR LOWER(person.mLastname) LIKE LOWER(:term${index}))`,
          { [`term${index}`]: `%${term}%` },
        );
      });

      query.orWhere('person.docNumber = :dni', { dni: docNumber });
    }
    query.orderBy('person.lastname', 'ASC');
    // query.skip((page - 1) * limit).take(limit);
    const student = await query.getOne();
    if (!student) {
      throw new BadRequestException('Not available student');
    }
    const enrrollOnProccess = await this.enrollmentRepository.findOne({
      where: {
        status: Status.EN_PROCESO,
        student: { id: student.id },
      },
    });

    if (!enrrollOnProccess) {
      const family = student.family;
      const enrrollReserved = await this.enrollmentRepository.findOne({
        where: {
          status: Status.RESERVADO,
          student: { id: student.id },
        },
      });
      if (!enrrollReserved) {
        throw new BadRequestException('Not available enrroll reserved');
      }
      const formatData = {
        student: enrrollReserved.student,
        code: enrrollReserved.code,
        status: enrrollReserved.status,
        grade:
          enrrollReserved.activityClassroom.grade.name +
          ' ' +
          enrrollReserved.activityClassroom.section,
        campus: enrrollReserved.activityClassroom.classroom.campusDetail.name,
        family,
      };
      return formatData;
    }

    const family = student.family;
    // family.parentOneId.user;
    // family.parentOneId.email = family.parentOneId.user.email;
    // family.parentTwoId.email = family.parentOneId.user.email;
    const formatData = {
      student: enrrollOnProccess.student,
      code: enrrollOnProccess.code,
      status: enrrollOnProccess.status,
      grade:
        enrrollOnProccess.activityClassroom.grade.name +
        ' ' +
        enrrollOnProccess.activityClassroom.section,
      campus: enrrollOnProccess.activityClassroom.classroom.campusDetail.name,
      family,
    };

    return formatData;
  }

  async getReport(getReportDto: GetReportEnrrollDto) {
    const {
      campusId,
      activityClassroomId,
      yearId,
      levelId,
      status = Status.EN_PROCESO,
    } = getReportDto;

    // Construimos dinámicamente las condiciones de la consulta
    const classroomWhereClause: any = {
      phase: { year: { id: +yearId } },
      classroom: { campusDetail: { id: +campusId } },
    };

    if (activityClassroomId) {
      classroomWhereClause.id = +activityClassroomId;
    }
    if (levelId) {
      classroomWhereClause.grade = {
        level: { id: levelId },
      };
    }

    // Consulta a las aulas
    const classrooms = await this.activityClassroomRepository.find({
      where: classroomWhereClause,
    });

    const classroomIds = classrooms.map(({ id }) => id);

    if (classroomIds.length === 0) {
      // Si no hay aulas, devolvemos un array vacío
      return [];
    }

    // Consulta a los registros de matrícula
    const enrollments = await this.enrollmentRepository.find({
      where: {
        activityClassroom: { id: In(classroomIds) },
        status,
      },
      order: {
        student: {
          person: { lastname: 'ASC', mLastname: 'ASC', name: 'ASC' },
        },
      },
      relations: {
        student: {
          family: {
            parentOneId: true,
            parentTwoId: true,
          },
        },
      },
    });
    /**data img */
    const urlS3 = this.configService.getOrThrow('AWS_URL_BUCKET');
    const folderName = this.configService.getOrThrow('FOLDER_IMG_NAME');
    const defaultAvatar = this.configService.getOrThrow('AVATAR_NAME_DEFAULT');
    const urlPhoto = `${urlS3}${folderName}`;
    // Transformamos los datos de matrícula
    const reportData = enrollments.map(
      ({
        id,
        status,
        student,
        activityClassroom,
        reservationExpiration,
        dateOfChange,
      }) => {
        const parent = student.family.parentOneId?.cellPhone
          ? student.family.parentOneId
          : student.family.parentTwoId;

        return {
          id,
          status,
          student: `${student.person.lastname} ${student.person.mLastname} ${student.person.name}`,
          docNumber: student.person.docNumber,
          grade: activityClassroom.grade.name,
          section: activityClassroom.section,
          parent,
          creationDate: dateOfChange,
          expirationDate: reservationExpiration,
          siagie: student.siagie,
          studentCode:
            student.studentCode?.length < 14
              ? student.studentCode?.padStart(14, '0').toString()
              : student.studentCode?.toString() || ' ',
          modularCode:
            student.modularCode === 'no information' ? '' : student.modularCode,
          schoolName: student.school,
          activityClassroomId: activityClassroom.id,
          studentId: student.id,
          photo: student.photo
            ? `${urlPhoto}/${student.photo}`
            : `${urlPhoto}/${defaultAvatar}`,
        };
      },
    );

    return reportData;
  }

  async updateExpiration(id: number, updateExpirationDto: UpdateExpirationDto) {
    const enroll = await this.enrollmentRepository.findOneByOrFail({ id });
    const dest = await this.vacancyCalculation(enroll.activityClassroom.id);

    if (dest.vacant - 1 == -2) {
      throw new BadRequestException(
        'There are no vacancies for the default classroom',
      );
    }
    try {
      const { newExpiration } = updateExpirationDto;

      const expirationDate = new Date(newExpiration);
      enroll.reservationExpiration = expirationDate;
      return await this.enrollmentRepository.save(enroll);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  /**CHANGE SECTION */
  async changeSection(
    studentId: number,
    activityClassroomId: number,
    user: any,
    enrollCode: string,
  ) {
    /**Validar deudas */
    const data = await this.treasuryService.searchDebtsByDate(studentId);

    if (data.length > 0) {
      throw new BadRequestException('La familia tiene deudas vencidas');
    }

    // const vacant = await this.vacancyCalculation(activityClassroomId);
    // if (!vacant.hasVacant) {
    //   throw new BadRequestException(
    //     'Insufficient vacancies or the student is enrolled here',
    //   );
    // }

    const actualEnroll = await this.findEnrollmentByStudentAndStatus(
      studentId,
      Status.MATRICULADO,
    );
    if (!actualEnroll) {
      throw new NotFoundException('Enrollment actual not found');
    }

    const destinationEnroll = await this.findEnrollmentByStudentAndStatus(
      studentId,
      Status.EN_PROCESO,
    );
    if (!destinationEnroll) {
      throw new NotFoundException('Destination Enroll  not found');
    }
    if (destinationEnroll.code !== enrollCode) {
      throw new NotFoundException('Destination Enroll is not correct');
    }

    actualEnroll.status = Status.TRASLADADO;
    destinationEnroll.status = Status.MATRICULADO;
    actualEnroll.isActive = false;
    destinationEnroll.isActive = true;

    await this.enrollmentRepository.save(actualEnroll);
    await this.enrollmentRepository.save(destinationEnroll);

    try {
      const history = this.sectionHistoryRepository.create({
        currentClassroom: { id: actualEnroll.activityClassroom.id },
        previousClassroom: { id: destinationEnroll.activityClassroom.id },
        student: { id: actualEnroll.student.id },
        sub: user.sub,
      });

      return await this.sectionHistoryRepository.save(history);
    } catch (error) {
      console.log('ertor');
      console.log(error);
      handleDBExceptions(error, this.logger);
    }
  }
  /**CHANGE CAMPUS NOT USED*/
  async transferStudent(
    studentId: number,
    destinationSchool: string,
    user: any,
  ) {
    /**Validar deudas */
    const data = await this.treasuryService.searchDebtsByDate(studentId);
    if (data.length > 0) {
      throw new BadRequestException('The student has overdue debts');
    }

    /**verificar nota credito */

    const bill = await this.treasuryService.getBill(studentId, 4);
    if (!bill) {
      throw new BadRequestException(
        'the student has no payments - cuota de matricula',
      );
    }

    const creditNote = await this.treasuryService.getCreditNoteByBill(bill.id);

    if (!creditNote) {
      throw new BadRequestException('The credit note has not been issued');
    }

    const enroll = await this.enrollmentRepository.findOne({
      where: {
        student: { id: studentId },
        isActive: true,
      },
    });

    if (!enroll) {
      throw new BadRequestException(
        'The student does not have active enrollment',
      );
    }

    enroll.status = Status.TRASLADADO;
    await this.enrollmentRepository.save(enroll);
    const us = await this.userRepository.findOne({
      where: {
        email: user.email,
      },
    });
    const hs = await this.studentService.createHistory(
      ActionType.TRASLADADO,
      destinationSchool,
      us.id,
      studentId,
    );

    return hs;
  }
  /**MARKED AS A TRANSFERRED */
  async marketAsTransferStudent(studentId: number, user: any) {
    try {
      const actualEnroll = await this.findEnrollmentByStudentAndStatus(
        studentId,
        Status.MATRICULADO,
      );
      if (!actualEnroll) {
        throw new NotFoundException('Enrollment actual not found');
      }

      actualEnroll.status = Status.TRASLADADO;
      await this.enrollmentRepository.save(actualEnroll);

      const hs = await this.studentService.createHistory(
        ActionType.TRASLADADO,
        'Traslado externo',
        user.id,
        studentId,
      );

      return hs;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  /**CRON JOBS RESERVARDOS */
  async updateReservedScript() {
    try {
      await this.slackService.sendMessage(
        SlackChannel.GENERAL,
        '¡Hola desde producción !',
      );
      // const expiredRegistrations = await this.enrollmentRepository.find({
      //   where: [
      //     {
      //       status: Status.EN_PROCESO,
      //     },
      //     {
      //       status: Status.RESERVADO,
      //     },
      //     {
      //       status: Status.PREMATRICULADO,
      //     },
      //     {
      //       status: Status.MATRICULADO,
      //     },
      //   ],
      // });

      // expiredRegistrations.forEach((enr) => {
      //   let days: number;
      //   let date: Date;
      //   if (enr.status === Status.EN_PROCESO) {
      //     date = enr.createdAt;
      //     days = 5;
      //   }
      //   if (enr.status === Status.RESERVADO) {
      //     days = 25;
      //     date = enr.updatedAt ? enr.updatedAt : enr.createdAt;
      //   }
      //   if (enr.status === Status.PREMATRICULADO) {
      //     days = 10;
      //     date = enr.updatedAt ? enr.updatedAt : enr.createdAt;
      //   }
      //   if (enr.status === Status.MATRICULADO) {
      //     days = 0;
      //     date = new Date();
      //   }
      //   const newExpirationDate = new Date(date);
      //   newExpirationDate.setDate(newExpirationDate.getDate() + days);
      //   enr.reservationExpiration = newExpirationDate;
      //   enr.dateOfChange = date;
      // });

      // await this.enrollmentRepository.save(expiredRegistrations);
      // console.log('Successfully updated');
    } catch (error) {
      console.error('Error updating registrations in process:', error);
    }
  }

  async updateReservations() {
    try {
      this.logger.log(`Running cron jobs, deleted registrations in process...`);
      const today = new Date();

      const expiredRegistrations = await this.enrollmentRepository.find({
        where: {
          status: In([
            Status.EN_PROCESO,
            Status.PREMATRICULADO,
            Status.RESERVADO,
          ]),
          reservationExpiration: LessThanOrEqual(today),
        },
      });
      await this.enrollmentRepository.update(
        {
          status: In([
            Status.EN_PROCESO,
            Status.PREMATRICULADO,
            Status.RESERVADO,
          ]), // Agrega más estados según sea necesario
          reservationExpiration: LessThanOrEqual(today),
        },
        { status: Status.EXPIRADO },
      );

      /**DIJO QUE YA NO comunicarse con admision para liberar estado de vacante y email*/

      this.logger.log(
        `Successfully updated, affected: ${expiredRegistrations.length}`,
      );
      await this.slackService.sendMessage(
        SlackChannel.GENERAL,
        `Today ${expiredRegistrations.length} registrations that are in process will be affected`,
      );
      this.logger.log(`cron jobs completed succesfully`);
      return {
        deletedRows: expiredRegistrations.length,
        success: true,
      };
    } catch (error) {
      console.error('Error updating registrations in process:', error);
    }
  }

  async updateSchoolScript() {
    try {
      const enrollments = await this.enrollmentRepository
        .createQueryBuilder('enrollment')
        .leftJoinAndSelect('enrollment.student', 'student')
        .leftJoinAndSelect('student.person', 'person')
        .where('enrollment.status IN (:...statuses)', {
          statuses: [
            Status.EN_PROCESO,
            Status.RESERVADO,
            Status.PREMATRICULADO,
            Status.MATRICULADO,
          ],
        })
        .getMany();

      // Validamos que haya inscripciones antes de continuar
      if (enrollments.length === 0) {
        this.logger.warn('No se encontraron inscripciones para actualizar.');
        return;
      }

      // Creamos las promesas para hacer las solicitudes en paralelo
      const updatePromises = enrollments.map(async (e) => {
        if (!e.student || !e.student.person) {
          this.logger.warn(
            `Estudiante sin información de persona en inscripción ID: ${e.id}`,
          );
          return;
        }

        const body = { docNumber: e.student.person.docNumber };

        try {
          const response = await axios.post(
            `${this.urlAdmision}/admin/search-new`,
            body,
          );
          const data = response.data.data as DataAdmision;
          const { child } = data;

          if (child) {
            e.student.modularCode = child.modularCode;
            e.student.school = child.school;

            return this.studentRepository.save(e.student);
          }
        } catch (error) {
          this.logger.error(
            `Error al consultar la API para el estudiante ID: ${e.student.id}`,
            error,
          );
        }
      });

      // Esperamos a que todas las actualizaciones terminen
      await Promise.all(updatePromises);

      this.logger.log('Actualización de escuelas completada exitosamente.');
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async sendInfoEmail(level: number) {
    try {
      let from = 1;
      let to = 3;
      let link =
        'https://drive.google.com/drive/folders/15sv0D4umflxh_pOi-iR7JmUJk5fEu0CX?usp=sharing';
      if (level == 2) {
        (from = 3), (to = 9);
        link =
          'https://drive.google.com/drive/folders/1Lt8mCcycmATwc_NTETomNz0vuo5A06Nw?usp=sharing';
      }
      if (level == 3) {
        (from = 9), (to = 14);
        link =
          'https://drive.google.com/drive/folders/1r9PHZ_vsjrM345Iccdgha5_7JDyLFEsk?usp=sharing';
      }

      if (level !== 1 && level !== 2 && level !== 3) {
        throw new BadRequestException('errror');
      }
      const jobId = uuidv4();
      const data = await this.debtRepository.query(
        `SELECT en.id, st.code, concat(per.lastname, ' ', per.mLastname, ' ', per.name) student,
          CONCAT( g.name, ' ',ac.section, ' ', l.name) grade,
          concat(p.lastname, ' ', p.mLastname, ' ', p.name) parent, us.email
          FROM enrollment en

          inner join student st on st.id=en.studentId
          inner join person per on per.id = st.personId
          inner join family f on f.id=st.familyId
          inner join person p on p.id=f.respEnrollment
          inner join activity_classroom ac on ac.id=en.activityClassroomId
          inner join grade g on g.id=ac.gradeId
          inner join level l on l.id=g.levelId
          inner join user us on us.personId = p.id

          where en.status="registered"  and en.behavior ='normal' and g.position>=${from} and g.position<${to};`,
      );

      this.logger.log(`Iniciando envio de información`);
      const job = await this.enrollQueue.add(
        'enviar-info',
        {
          estudianteData: data,
          enviarEmail: true,
          jobId,
          link,
        },
        {
          attempts: 3, // Reintentar hasta 3 veces si falla
          backoff: {
            type: 'exponential',
            delay: 5000, // Esperar 5s, 10s, 20s entre reintentos
          },
          removeOnComplete: false, // Mantener jobs completados para consulta
          removeOnFail: false, // Mantener jobs fallidos para análisis
        },
      );

      // Notificar a Slack que el proceso comenzó
      await this.slackService.sendMessage(
        SlackChannel.GENERAL,
        'Iniciando envio de emails',
      );

      return {
        jobId,
        message: `Envio de Emails iniciado. Job ID: ${jobId}. Se procesarán ${data.length} estudiantes en segundo plano.`,
      };
    } catch (error) {
      console.log(error);
      handleDBExceptions(error, this.logger);
    }
  }

  /**script para crear un codigo para todos las matriculas */

  // async scripting() {
  //   const enrollments = await this.enrollmentRepository.find({
  //     relations: {
  //       activityClassroom: true,
  //     },
  //   });
  //   for (const enroll of enrollments) {
  //     const codeGe = `${enroll.activityClassroom.phase.year.name}${enroll.activityClassroom.phase.type === TypePhase.Regular ? '1' : '2'}S${enroll.student.id}`;
  //     const uptEnrroll: Enrollment = {
  //       id: enroll.id,
  //       code: codeGe,
  //       status: Status.DEFINITIVA,

  //       activityClassroom: enroll.activityClassroom,
  //     };
  //     await this.enrollmentRepository.save(uptEnrroll);
  //   }
  //   return enrollments;
  // }

  /**TRASLADOS */

  // async changeSection(acId: number, studentId: number) {
  //   const enrrollment = this.enrollmentRepository.findOne({
  //     where: {
  //       student: { id: studentId },
  //       status: Status.MATRICULADO,
  //     },
  //   });

  //   if (!enrrollment) {
  //     throw new BadRequestException('No tiene Matricula activa el estudiante');
  //   }
  // }
}
