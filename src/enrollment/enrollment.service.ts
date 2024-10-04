import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CreateManyEnrollmentDto } from './dto/create-many-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
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
import { User } from 'src/user/entities/user.entity';
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
  async create(createEnrollmentDto: CreateEnrollChildrenDto, user: User) {
    /**TODO: funcion paraValidar que sea el papá quien matricula */
    /**TODO: llamar a la funcion para Validar se matricule a una de las aulas disponibles para este estudiante */
    console.log(user);
    try {
      const codes = [];
      for (const ce of createEnrollmentDto.enrrollments) {
        const classroom =
          await this.activityClassroomRepository.findOneByOrFail({
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
        const enrollment = this.enrollmentRepository.create({
          student: { id: ce.studentId },
          activityClassroom: { id: ce.activityClassroomId },
          code: `${classroom.phase.year.name}${classroom.phase.type === TypePhase.Regular ? '1' : '2'}S${ce.studentId}`,
          status: Status.PREMATRICULADO,
        });

        await this.enrollmentRepository.save(enrollment);
        codes.push(enrollment.code);
      }

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

    // try {
    //   let vacant;
    //   const activityClassroom = await this.activityClassroomRepository.findOne({
    //     where: {
    //       id: 67,
    //     },
    //   });
    //   const configAscent = await this.ascentRepository.find({
    //     where: {
    //       originId: { id: activityClassroom.id },
    //       // year: { id: ac.yearId },
    //     },
    //   });

    //   if (configAscent) {
    //     /**calcular con el aula destino */
    //     // const configAscent = await this.ascentRepository.findOne({
    //     //   where: {
    //     //     originId: { id: activityClassroom.id },
    //     //     year: { id: activityClassroom.phase.year.id },
    //     //   },
    //     // });
    //     const ac = configAscent[0].originId;
    //     const enrrollmentRatified = await this.enrollmentRepository.find({
    //       where: {
    //         activityClassroom: ac,
    //         ratified: true,
    //       },
    //     });

    //     const capacity = activityClassroom.classroom.capacity;
    //     const ratifieds = enrrollmentRatified.length;
    //     const vacants = capacity - ratifieds;
    //     vacant = {
    //       origin: ac.grade.name + ' ' + ac.section,
    //       grade: activityClassroom.grade.name + ' ' + activityClassroom.section,
    //       capacity,
    //       ratifieds,
    //       vacants,
    //     };
    //   } else {
    //     /**si no hay configuracion adicional */
    //     console.log('no hay conf');
    //     const enrrollmentRatified = await this.enrollmentRepository.find({
    //       where: {
    //         activityClassroom: {
    //           grade: { position: activityClassroom.grade.position - 1 },
    //           section: activityClassroom.section,
    //           phase: {
    //             year: {
    //               name: (
    //                 parseInt(activityClassroom.phase.year.name) - 1
    //               ).toString(),
    //             },
    //           },
    //         },
    //         ratified: true,
    //       },
    //     });
    //     const acor = enrrollmentRatified[0].activityClassroom;

    //     const capacity = activityClassroom.classroom.capacity;
    //     const ratifieds = enrrollmentRatified.length;
    //     const vacants = capacity - ratifieds;
    //     vacant = {
    //       origin: acor.grade.name + ' ' + acor.section,
    //       grade: activityClassroom.grade.name + ' ' + activityClassroom.section,
    //       capacity,
    //       ratifieds,
    //       vacants,
    //     };
    //   }

    //   return vacant;
    // } catch (error) {
    //   handleDBExceptions(error, this.logger);
    // }
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
          ratified: previousEnrolls,
          enrollments: currentEnrroll,
          vacant: capacity - previousEnrolls - currentEnrroll,
          detailOrigin,
        });
        acc[gradeId].capacity += capacity;
        acc[gradeId].ratified += previousEnrolls;
        acc[gradeId].enrollments += currentEnrroll;
        acc[gradeId].vacant =
          acc[gradeId].capacity -
          acc[gradeId].ratified -
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
      throw new NotFoundException('Dont exists this fact');
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
          console.log(dest);
          if (
            dest.section === currentEnrrollment.activityClassroom.section ||
            dest.detailOrigin.section ===
              currentEnrrollment.activityClassroom.section ||
            dest.hasVacants
          ) {
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
      const vacants =
        destinationId.classroom.capacity - ratifieds - currentEnrroll.length;
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
          },
        });
        if (destings.length === 1) {
          oneDest = co.originId.id;
          origin = co.originId;
        }
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

      const vacants =
        activityClassroom.classroom.capacity -
        ratifieds -
        currentEnrroll.length;

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

    const vacants =
      activityClassroom.classroom.capacity - ratifieds - currentEnrroll.length;
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
