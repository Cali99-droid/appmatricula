import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CreateManyEnrollmentDto } from './dto/create-many-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Or, Repository } from 'typeorm';
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

import { Rates } from 'src/treasury/entities/rates.entity';
import { Debt } from 'src/treasury/entities/debt.entity';
import axios from 'axios';
import { CreateNewEnrollmentDto } from './dto/create-new-enrrol';
import { FamilyService } from 'src/family/family.service';
import { DataAdmision } from 'src/family/interfaces/data-admision';
@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger('EnrollmentService');
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Ascent)
    private readonly ascentRepository: Repository<Ascent>,
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

    /**servicios */
    private readonly studentService: StudentService,
    private readonly familyService: FamilyService,
  ) {}

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

      /**validar capacidad */

      const classroom = await this.activityClassroomRepository.findOneByOrFail({
        id: ce.activityClassroomId,
      });
      const capacity = classroom.classroom.capacity;
      const enrollmentsByActivityClassroom =
        await this.enrollmentRepository.find({
          where: {
            activityClassroom: {
              id: ce.activityClassroomId,
            },
          },
        });
      if (enrollmentsByActivityClassroom.length >= capacity) {
        throw new BadRequestException(
          'those enrolled exceed the capacity of the classroom ',
        );
      }
      const existEnrroll = await this.enrollmentRepository.findOne({
        where: {
          student: { id: ce.studentId },
          status: Status.RESERVADO,
          code: `${classroom.phase.year.name}${classroom.phase.type === TypePhase.Regular ? '1' : '2'}S${ce.studentId}`,
        },
      });
      if (!existEnrroll) {
        const enrollment = this.enrollmentRepository.create({
          student: { id: ce.studentId },
          activityClassroom: { id: ce.activityClassroomId },
          code: `${classroom.phase.year.name}${classroom.phase.type === TypePhase.Regular ? '1' : '2'}S${ce.studentId}`,
          status: Status.PREMATRICULADO,
        });
        const enrroll = await this.enrollmentRepository.save(enrollment);
        const activityClassroom =
          await this.activityClassroomRepository.findOneBy({
            id: ce.activityClassroomId,
          });
        /**generar deuda */
        const levelId = activityClassroom.grade.level.id;
        const campusDetailId = activityClassroom.classroom.campusDetail.id;

        const rate = await this.ratesRepository.findOne({
          where: {
            level: { id: levelId },
            campusDetail: { id: campusDetailId },
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
        });

        await this.debtRepository.save(createdDebt);

        codes.push(enrollment.code);
        idsStudent.push(ce.studentId);
      } else {
        existEnrroll.status = Status.PREMATRICULADO;
        existEnrroll.activityClassroom.id = ce.activityClassroomId;
        await this.enrollmentRepository.save(existEnrroll);
        codes.push(existEnrroll.code);
        idsStudent.push(ce.studentId);
      }
    }

    try {
      await this.enrollmentRepository
        .createQueryBuilder()
        .update(Enrollment)
        .set({
          isActive: false,
          status: Status.FINALIZADO,
        })
        .where('code NOT IN (:...codes)', { codes })
        .andWhere('studentId IN (:...idsStudent)', { idsStudent })
        .andWhere('status = :statusEnrroll', {
          statusEnrroll: Status.MATRICULADO,
        })
        // .orWhere('status = :otherStatusEnrroll', {
        //   otherStatusEnrroll: Status.EN_PROCESO,
        // })
        .execute();

      return codes;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async createMany(createManyEnrollmentDto: CreateManyEnrollmentDto) {
    const { persons, activityClassroomId } = createManyEnrollmentDto;
    // validar capacidad de aula

    const classroom = await this.activityClassroomRepository.findOneBy({
      id: activityClassroomId,
    });

    const capacity = classroom.classroom.capacity;

    if (persons.length > capacity) {
      throw new BadRequestException(
        'those enrolled exceed the capacity of the classroom ',
      );
    }
    try {
      //Validar Personas

      const dataNoExist: any[] = [];
      const dataEnrollment: any[] = [];
      for (const person of persons) {
        const existPerson = await this.personRepository.findOne({
          where: { studentCode: person.studentCode },
        });

        if (existPerson) {
          let student;
          student = await this.studentRepository.findOne({
            where: { person: { id: existPerson.id } },
          });

          if (!student) {
            student = await this.studentRepository.save({
              person: existPerson,
              studentCode: person.studentCode,
            });
          }

          const existEnrollment = await this.enrollmentRepository.findOne({
            where: {
              student: { id: student.id },
              activityClassroom: {
                phase: { id: classroom.phase.id },
              },
            },
          });

          if (!existEnrollment) {
            const enrollment = this.enrollmentRepository.create({
              student: { id: student.id },
              activityClassroom: { id: activityClassroomId },
              status: Status.EN_PROCESO,
              code: `${classroom.phase.year.name}${classroom.phase.type === TypePhase.Regular ? '1' : '2'}S${student.id}`,
            });
            const saveEnrollment =
              await this.enrollmentRepository.save(enrollment);
            dataEnrollment.push(saveEnrollment);
          }
        } else {
          dataNoExist.push(person);
        }
      }

      // Crear y guardar personas que no existen
      const personsCreated = await this.personRepository.save(
        this.personRepository.create(dataNoExist),
      );

      // Crear y guardar estudiantes que no existen
      const studentsCreated = await this.studentRepository.save(
        personsCreated.map((person) => ({
          person,
          studentCode: person.studentCode,
        })),
      );
      // Crear y guardar matriculas
      const enrollments = await this.enrollmentRepository.save(
        studentsCreated.map((student) => ({
          status: Status.EN_PROCESO,
          activityClassroom: { id: activityClassroomId },
          student,
          code: `${classroom.phase.year.name}${classroom.phase.type === TypePhase.Regular ? '1' : '2'}S${student.id}`,
        })),
      );
      await this.studentService.updateStudentCodes();
      // await this.scripting();
      dataEnrollment.push(enrollments);
      return enrollments;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const enrollments = await this.enrollmentRepository.find();
    return enrollments;
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
            student.studentCode === null
              ? student.person.studentCode
              : student.studentCode,
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
            sections: [],
          };
        }
        acc[gradeId].sections.push({
          section,
          capacity,
          // ratified: previousEnrolls,
          ratified: 0,
          enrollments: currentEnrroll,
          // vacant: capacity - previousEnrolls - currentEnrroll,

          vacant: capacity - currentEnrroll,
          detailOrigin,
        });
        acc[gradeId].capacity += capacity;
        // acc[gradeId].ratified += previousEnrolls;
        acc[gradeId].ratified += 0;
        acc[gradeId].enrollments += currentEnrroll;
        acc[gradeId].vacant =
          acc[gradeId].capacity -
          // acc[gradeId].ratified -
          acc[gradeId].enrollments;

        return acc;
      }, {});

      const result: Vacants[] = Object.values(groupedData);

      return result;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
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

        if (dest.hasVacant) {
          const classroom: AvailableClassroom = {
            id: dest.id,
            name: dest.grade + ' ' + dest.section,
            vacants: dest.vacant,
            suggested: false,
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
        console.log('more dest');
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
        const dest = await this.calcVacantsToClassroom(ac.id);
        if (
          dest.section === currentEnrrollment.activityClassroom.section ||
          dest.hasVacants
        ) {
          const classroom: AvailableClassroom = {
            id: ac.id,
            name: ac.grade.name + ' ' + ac.section,
            vacants: dest.vacants,
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
        },
      });
      const enrollOrigin = await this.enrollmentRepository.find({
        where: { activityClassroom: { id: originId.id }, ratified: true },
      });
      /**problema acá destinoID */
      const currentEnrroll = await this.enrollmentRepository.find({
        where: {
          activityClassroom: { id: destinationId.id },
        },
      });

      const rtAndEnr = enrollOrigin.filter((item1) =>
        currentEnrroll.some((item2) => item1.student.id === item2.student.id),
      );

      const rtAndEnrInOther = enrolledInOther.filter((item1) =>
        enrollOrigin.some((item2) => item1.student.id === item2.student.id),
      );
      const ratifieds =
        enrollOrigin.length - rtAndEnr.length - rtAndEnrInOther.length;
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
        console.log(destings);
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
        vacants,
        hasVacants: vacants > 0,
        type: 'P',
        detailOrigin: {
          id: origin.id,
          grade: origin.grade.name,
          section: origin.section,
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
      },
    });
    const currentEnrroll = await this.enrollmentRepository.find({
      where: {
        activityClassroom: { id: activityClassroom.id },
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

    const vacants =
      activityClassroom.classroom.capacity - currentEnrroll.length;
    const res: VacantsClassrooms = {
      id: activityClassroom.id,
      gradeId: activityClassroom.grade.id,
      grade: activityClassroom.grade.name,
      level: activityClassroom.grade.level.name,
      section: activityClassroom.section,
      capacity: activityClassroom.classroom.capacity,
      previousEnrolls: ratifieds,
      currentEnrroll: currentEnrroll.length,
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
            id: 16,
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

    const idsAc = activityClassrooms.map((ac) => ac.id);

    const countEnrroll = await this.enrollmentRepository.count({
      where: {
        activityClassroom: {
          id: In(idsAc),
        },
        ratified: true,
      },
    });

    /**data destino, aulas configuradas para el grado solicitado */

    // const activityClassroomsDest = await this.activityClassroomRepository.find({
    //   where: {
    //     grade: { id: gradeId },
    //     phase: {
    //       year: { id: yearId },
    //     },
    //   },
    // });

    const capacities = activityClassrooms.map((ac) => ac.classroom.capacity);

    const capacity = capacities.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const vacants = capacity - countEnrroll;

    return {
      hasVacants: vacants > 0,
      capacity: capacity,
      enrrolls: countEnrroll,
      vacants,
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
    console.log(hasDebt);
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
        `https://api-admision.dev-solware.com/api/admin/search-new`,
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
        throw new BadRequestException('not available vacants');
      }
      /**CREAR LA DATA */

      const created = await this.familyService.createFamilyFromAdmision(
        data,
        availableClassrooms[0],
      );

      return created;
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
    const student = await this.studentRepository.findOne({
      where: {
        person: { docNumber: searchDto.docNumber },
      },
      relations: {
        family: {
          parentOneId: true,
          parentTwoId: true,
        },
      },
    });
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

  async migrateStudentAdm(
    createNewEnrollmentDto: CreateNewEnrollmentDto,
    user: any,
  ) {
    const body = {
      docNumber: createNewEnrollmentDto.docNumber,
    };

    try {
      /**Consultar si obtuvo vacante en admision */
      const response = await axios.post(
        `https://api-admision.dev-solware.com/api/admin/search-new`,
        body,
      );
      const data = response.data.data as DataAdmision;
      const { child } = data;
      /**CREAR LA DATA */
      // const created = await this.familyService.createFamilyFromAdmision(data, );
      // /**crear Pago*/

      // return created;
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
}
