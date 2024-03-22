import { Injectable, Logger } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CreateManyEnrollmentDto } from './dto/create-many-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/person/entities/student.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Status } from './enum/status.enum';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';

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
  ) {}
  create(createEnrollmentDto: CreateEnrollmentDto) {
    return 'This action adds a new enrollment' + createEnrollmentDto;
  }

  async createMany(createManyEnrollmentDto: CreateManyEnrollmentDto) {
    const { persons, activityClassroomId } = createManyEnrollmentDto;

    try {
      const personsToCreate = this.personRepository.create(persons);
      const personsCreated = await this.personRepository.save(personsToCreate);

      const dataStudent = personsCreated.map((person) => {
        return {
          person,
        };
      });
      console.log(dataStudent);
      const studentCreate = this.studentRepository.create(dataStudent);
      const studentCreated = await this.studentRepository.save(studentCreate);
      const dataEnrollment = studentCreated.map((student) => {
        return {
          status: Status.DEFINITIVA,
          activityClassroom: { id: activityClassroomId } as ActivityClassroom,
          student: student,
        };
      });

      const enrollmentCreate = this.enrollmentRepository.create(dataEnrollment);
      const enrollmentCreated =
        await this.enrollmentRepository.save(enrollmentCreate);

      return enrollmentCreated;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
    console.log(createManyEnrollmentDto);
    return 'This action adds many enrollment';
  }

  findAll() {
    return `This action returns all enrollment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} enrollment`;
  }

  update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    return `This action updates a #${updateEnrollmentDto} enrollment`;
  }

  remove(id: number) {
    return `This action removes a #${id} enrollment`;
  }
}
