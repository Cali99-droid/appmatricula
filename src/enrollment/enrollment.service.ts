import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CreateManyEnrollmentDto } from './dto/create-many-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
    private readonly studentService: StudentService,
  ) {}
  async create(createEnrollmentDto: CreateEnrollmentDto) {
    try {
      const classroom = await this.activityClassroomRepository.findOneBy({
        id: createEnrollmentDto.activityClassroomId,
      });
      const capacity = classroom.classroom.capacity;
      const enrollmentsByActivityClassroom =
        await this.enrollmentRepository.find({
          where: {
            activityClassroom: {
              id: createEnrollmentDto.activityClassroomId,
            },
          },
        });
      if (enrollmentsByActivityClassroom.length >= capacity) {
        throw new BadRequestException(
          'those enrolled exceed the capacity of the classroom ',
        );
      }
      const enrollment = this.enrollmentRepository.create({
        student: { id: createEnrollmentDto.studentId },
        activityClassroom: { id: createEnrollmentDto.activityClassroomId },
        status: createEnrollmentDto.status,
      });
      await this.enrollmentRepository.save(enrollment);
      return enrollment;
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

  async getVacantsExample() {
    try {
      let vacant;
      const activityClassroom = await this.activityClassroomRepository.findOne({
        where: {
          id: 151,
        },
      });
      const configAscent = await this.ascentRepository.findOne({
        where: {
          destinationId: { id: activityClassroom.id },
          // year: { id: ac.yearId },
        },
      });

      if (configAscent) {
        /**calcular con el aula destino */
        // const configAscent = await this.ascentRepository.findOne({
        //   where: {
        //     originId: { id: activityClassroom.id },
        //     year: { id: activityClassroom.phase.year.id },
        //   },
        // });
        const ac = configAscent.originId;
        const enrrollmentRatified = await this.enrollmentRepository.find({
          where: {
            activityClassroom: ac,
            ratified: true,
          },
        });

        const capacity = activityClassroom.classroom.capacity;
        const ratifieds = enrrollmentRatified.length;
        const vacants = capacity - ratifieds;
        vacant = {
          origin: ac.grade.name + ' ' + ac.section,
          grade: activityClassroom.grade.name + ' ' + activityClassroom.section,
          capacity,
          ratifieds,
          vacants,
        };
      } else {
        /**si no hay configuracion adicional */
        const enrrollmentRatified = await this.enrollmentRepository.find({
          where: {
            activityClassroom: {
              grade: { position: activityClassroom.grade.position - 1 },
              section: activityClassroom.section,
              phase: {
                year: {
                  name: (
                    parseInt(activityClassroom.phase.year.name) - 1
                  ).toString(),
                },
              },
            },
            ratified: true,
          },
        });
        const acor = enrrollmentRatified[0].activityClassroom;

        const capacity = activityClassroom.classroom.capacity;
        const ratifieds = enrrollmentRatified.length;
        const vacants = capacity - ratifieds;
        vacant = {
          origin: acor.grade.name + ' ' + acor.section,
          grade: activityClassroom.grade.name + ' ' + activityClassroom.section,
          capacity,
          ratifieds,
          vacants,
        };
      }

      return vacant;
    } catch (error) {
      handleDBExceptions(this.logger, error);
    }
  }

  async getVacants(yearId: number, query: FindVacantsDto) {
    const { campusId, levelId } = query;
    const vacants = [];
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
        const enrrollmentRatified = await this.enrollmentRepository.find({
          where: {
            activityClassroom: {
              // id: activityClassrooms[0].id,
              grade: {
                // id: ac.grade.id,
                position: ac.grade.position - 1,
              },
              section: ac.section,
              phase: {
                year: {
                  id: yearId - 1,
                },
              },
            },
            ratified: true,
          },
        });

        const currentEnrrollment = await this.enrollmentRepository.find({
          where: {
            activityClassroom: {
              // id: activityClassrooms[0].id,
              grade: {
                // id: ac.grade.id,
                position: ac.grade.position,
              },
              section: ac.section,
              phase: {
                year: {
                  id: yearId,
                },
              },
            },
          },
        });

        const rtAndEnr = enrrollmentRatified.filter((item1) =>
          currentEnrrollment.some(
            (item2) => item1.student.id === item2.student.id,
          ),
        );

        /**menos los que ya estan matriculados, el calculo varia dependiendo del cronograma */
        const capacity = ac.classroom.capacity;
        const ratifieds = enrrollmentRatified.length - rtAndEnr.length;

        /**temporal, la fórmula varia en funcion al cronograma */
        const vacant = capacity - ratifieds - currentEnrrollment.length;
        /**formula para cuando no tengan que ver los ratificados */
        // const vacant = capacity - ratifieds - currentEnrrollment.length;
        vacants.push({
          gradeId: ac.grade.id,
          grade: ac.grade.name,
          section: ac.section,
          level: ac.grade.level.name,
          capacity,
          ratified: ratifieds,
          // enrollments: rtAndEnr.length,
          enrollments: currentEnrrollment.length,
          vacant,
        });
      }

      const groupedData = vacants.reduce((acc, curr) => {
        const {
          gradeId,
          grade,
          level,
          capacity,
          ratified,
          enrollments,
          section,
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
          ratified,
          enrollments,
          vacant: capacity - ratified - enrollments,
        });
        acc[gradeId].capacity += capacity;
        acc[gradeId].ratified += ratified;
        acc[gradeId].enrollments += enrollments;
        acc[gradeId].vacant =
          acc[gradeId].capacity -
          acc[gradeId].ratified -
          acc[gradeId].enrollments;

        return acc;
      }, {});

      const result = Object.values(groupedData);

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
      const ascent = this.ascentRepository.create({
        originId: { id: createAscentDto.originId },
        destinationId: { id: createAscentDto.destinationId },
        year: { id: createAscentDto.yearId },
      });

      await this.ascentRepository.save(ascent);
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
}
