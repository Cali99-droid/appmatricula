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
@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger('EnrollmentService');
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
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
  /**script para crear un codigo para todos las matriculas */

  async scripting() {
    const enrollments = await this.enrollmentRepository.find({
      relations: {
        activityClassroom: true,
      },
    });
    for (const enroll of enrollments) {
      const codeGe = `${enroll.activityClassroom.phase.year.name}${enroll.activityClassroom.phase.type === TypePhase.Regular ? '1' : '2'}S${enroll.student.id}`;
      const uptEnrroll: Enrollment = {
        id: enroll.id,
        code: codeGe,
        status: Status.DEFINITIVA,
        activityClassroom: enroll.activityClassroom,
      };
      await this.enrollmentRepository.save(uptEnrroll);
    }
    return enrollments;
  }
}
