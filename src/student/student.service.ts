import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import * as sharp from 'sharp';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository } from 'typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { UpdateBehaviorDto } from 'src/enrollment/dto/update-behavior.dto';
import { Behavior } from 'src/enrollment/enum/behavior.enum';
import { UpdateAllowNextRegistrationDto } from 'src/enrollment/dto/update-allowNextRegistration.dto';
import { SearchEstudiantesDto } from './dto/search-student.dto';

@Injectable()
export class StudentService {
  private readonly logger = new Logger('StudentService');
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_REGION'),
  });
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}
  create(createStudentDto: CreateStudentDto) {
    return 'This action adds a new student';
  }

  async findAll() {
    const student = await this.studentRepository.find({
      relations: {
        family: { parentOneId: true, parentTwoId: true },
        enrollment: {
          activityClassroom: {
            grade: true,
            classroom: { campusDetail: true },
            schoolShift: true,
          },
        },
      },
      // where: {
      //   enrollment: Not(IsNull()),
      // },
    });
    const students = student.map((student) => {
      const lastEnrollment = student.enrollment.length;
      return {
        docNumber: student.person.docNumber,
        studentName: `${student.person.lastname} ${student.person.mLastname}, ${student.person.name}`,
        parentOne: student.family
          ? `${student.family.parentOneId.lastname} ${student.family.parentOneId.mLastname}, ${student.family.parentOneId.name}`
          : undefined,
        parentTwo:
          student.family && student.family.parentTwoId
            ? `${student.family.parentTwoId.lastname} ${student.family.parentTwoId.mLastname}, ${student.family.parentTwoId.name}`
            : undefined,
        level:
          student.enrollment.length !== 0
            ? student.enrollment[lastEnrollment - 1].activityClassroom.grade
                .level.name
            : undefined,
        grade:
          student.enrollment.length !== 0
            ? student.enrollment[lastEnrollment - 1].activityClassroom.grade
                .name
            : undefined,
        section:
          student.enrollment.length !== 0
            ? student.enrollment[lastEnrollment - 1].activityClassroom.section
            : undefined,
        campus:
          student.enrollment.length !== 0
            ? student.enrollment[lastEnrollment - 1].activityClassroom.classroom
                .campusDetail.name
            : undefined,
        shift:
          student.enrollment.length !== 0
            ? student.enrollment[lastEnrollment - 1].activityClassroom
                .schoolShift.shift
            : undefined,
      };
    });
    return students;
  }

  async findStudents(searchDto: SearchEstudiantesDto) {
    const { searchTerm, page = 1, limit = 10 } = searchDto;

    const query = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('student.family', 'family')
      .leftJoinAndSelect(
        'student.enrollment',
        'enrollment',
        'enrollment.status = :estadoActivo',
        { estadoActivo: 'registered' },
      );

    if (searchTerm) {
      query.andWhere(
        '(person.name LIKE :searchTerm OR person.mlastname LIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      );
    }

    query.skip((page - 1) * limit).take(limit);

    const [results, total] = await query.getManyAndCount();

    const data = results.map((estudiante) => ({
      ...estudiante,
      tieneMatriculaActiva: estudiante.enrollment.length > 0,
    }));
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id, enrollment: { isActive: true } },
      relations: {
        enrollment: { activityClassroom: { grade: { level: true } } },
      },
    });
    if (!student)
      throw new NotFoundException(`student with id ${id} not found`);
    return student;
  }
  async findAutocomplete(value: string) {
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('student.family', 'family')
      .leftJoinAndSelect('family.parentOneId', 'parentOne')
      .leftJoinAndSelect('parentOne.user', 'user')
      .where('person.name LIKE :value', { value: `%${value}%` })
      .orWhere('person.lastname LIKE :value', { value: `%${value}%` })
      .orWhere('person.mLastname LIKE :value', { value: `%${value}%` })
      .andWhere('family.id IS NOT NULL')
      .andWhere('user.id IS NOT NULL')
      .getMany();
    return students.filter(
      (student) =>
        student.family &&
        student.family.parentOneId &&
        student.family.parentOneId.user,
    );
  }
  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const {
      personId,
      familyId,

      ...rest
    } = updateStudentDto;
    const student = await this.studentRepository.preload({
      id: id,
      person: isNaN(personId) ? undefined : { id: personId },
      family: isNaN(familyId) ? undefined : { id: familyId },

      ...rest,
    });
    if (!student)
      throw new NotFoundException(`Student with id: ${id} not found`);
    try {
      await this.studentRepository.save(student);
      return student;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }

  async uploadPhoto(fileName: string, file: Buffer, id: number) {
    try {
      const student = await this.studentRepository.findOneByOrFail({ id });
      const webpImage = await sharp(file).webp().toBuffer();
      const folderName = this.configService.getOrThrow('FOLDER_IMG_NAME');
      const namePhoto = `${Date.now()}.webp`;
      if (student.photo) {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.configService.getOrThrow('BUCKET_NAME'),
            Key: `${folderName}/${student.photo}`,
          }),
        );
      }
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.configService.getOrThrow('BUCKET_NAME'),
          Key: `${folderName}/${namePhoto}`,
          Body: webpImage,
          ACL: 'public-read',
        }),
      );
      const urlS3 = this.configService.getOrThrow('AWS_URL_BUCKET');
      const urlPhoto = `${urlS3}${folderName}/${namePhoto}`;

      await this.studentRepository
        .createQueryBuilder()
        .update()
        .set({ photo: namePhoto })
        .where('id = :id', { id })
        .execute();
      return { urlPhoto };
    } catch (error) {
      console.log(error);
      throw new NotFoundException(error.message);
    }
  }

  async updateStudentCodes() {
    const students = await this.studentRepository.find();
    for (let i = 0; i < students.length; i++) {
      const codigo = (i + 1).toString().padStart(8, '0');
      students[i].code = codigo;
    }

    console.log('updating codes...');
    await this.studentRepository.save(students);
    return {
      ms: 'updating codes',
    };
  }

  async generateCodigo(): Promise<string> {
    const lastStudent = await this.studentRepository.find({
      order: { code: 'DESC' },
      take: 1,
    });

    let newCodigo = '00000001'; // Default value if there are no students yet

    if (lastStudent.length > 0) {
      const lastCodigo = parseInt(lastStudent[0].code, 10);
      newCodigo = (lastCodigo + 1).toString().padStart(8, '0');
    }

    return newCodigo;
  }
  async findByActivityClassroomDebTors(
    activityClassroomId: number,
    hasDebt: boolean,
  ) {
    if (isNaN(activityClassroomId) || activityClassroomId <= 0) {
      throw new NotFoundException(
        `activityClassroomId must be a number greater than 0`,
      );
    }
    const students = await this.studentRepository.find({
      where: {
        enrollment: { activityClassroom: { id: activityClassroomId } },
        hasDebt: hasDebt,
      },
      relations: [
        'family.parentOneId.user',
        'family.parentTwoId.user',
        'person',
        'enrollment',
        'enrollment.activityClassroom',
        // 'enrollment.activity_classroom.grade',
        'enrollment.activityClassroom.grade.level',
      ],
    });
    const filteredDebTors = students.map((e) => ({
      student: {
        person: {
          name: e.person?.name ?? null,
          lastname: e.person?.lastname ?? null,
          mLastname: e.person?.mLastname ?? null,
          grade: e.enrollment[0]?.activityClassroom.grade?.name,
          level: e.enrollment[0]?.activityClassroom.grade?.level?.name,
          section: e.enrollment[0]?.activityClassroom.section,
          hasDebt: e.hasDebt,
          behavior: e.enrollment[0].behavior,
          behaviorDescription: e.enrollment[0].behaviorDescription,
        },
        // enrolllment: {
        //   behavior: e.enrollment[0].behavior,
        //   behaviorDescription: e.enrollment[0].behaviorDescription,
        // },
        family: {
          parentOneId: {
            name: e.family?.parentOneId?.name ?? null,
            lastname: e.family?.parentOneId?.lastname ?? null,
            mLastname: e.family?.parentOneId?.mLastname ?? null,
            familyRole: e.family?.parentOneId?.familyRole ?? null,
            cellPhone: e.family?.parentOneId?.cellPhone ?? null,
            user: {
              email: e.family?.parentOneId?.user?.email ?? null,
            },
          },
          parentTwoId: {
            name: e.family?.parentTwoId?.name ?? null,
            lastname: e.family?.parentTwoId?.lastname ?? null,
            mLastname: e.family?.parentTwoId?.mLastname ?? null,
            familyRole: e.family?.parentTwoId?.familyRole ?? null,
            cellPhone: e.family?.parentTwoId?.cellPhone ?? null,
            user: {
              email: e.family?.parentTwoId?.user?.email ?? null,
            },
          },
        },
      },
    }));
    return {
      total: students.length,
      filteredDebTors,
    };
  }
  async findByActivityClassroomBehavior(activityClassroomId: number) {
    if (isNaN(activityClassroomId) || activityClassroomId <= 0) {
      throw new NotFoundException(
        `activityClassroomId must be a number greater than 0`,
      );
    }
    const students = await this.studentRepository.find({
      where: {
        enrollment: { activityClassroom: { id: activityClassroomId } },
      },
      relations: [
        'family.parentOneId.user',
        'family.parentTwoId.user',
        'person',
        'enrollment',
        'enrollment.activityClassroom',
        'enrollment.activityClassroom.grade.level',
      ],
    });
    const filteredBehavior = students.map((e) => ({
      id: e.enrollment[0]?.id,
      student: {
        person: {
          name: e.person?.name ?? null,
          lastname: e.person?.lastname ?? null,
          mLastname: e.person?.mLastname ?? null,
          grade: e.enrollment[0]?.activityClassroom.grade?.name,
          level: e.enrollment[0]?.activityClassroom.grade?.level?.name,
          section: e.enrollment[0]?.activityClassroom.section,
          hasDebt: e.hasDebt,
          behavior: e.enrollment[0].behavior,
          behaviorDescription: e.enrollment[0].behaviorDescription,
          commitmentDocumentURL: e.enrollment[0].commitmentDocumentURL,
        },
      },
    }));
    return {
      total: students.length,
      filteredBehavior,
    };
  }
  mapBehaviorToDescription(behavior: string | undefined): string | null {
    const behaviorMap: { [key: string]: string } = {
      normal: 'Normal',
      'conditional registration': 'Matricula Condicionada',
      'loss of vacancy': 'Perdida de Vacante',
    };
    return behavior !== undefined ? behaviorMap[behavior] ?? null : null;
  }
  async findOneBehavior(id: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: id },
    });
    if (!enrollment)
      throw new NotFoundException(`Enrollment with id ${id} not found`);
    const filteredBehavior = {
      id: enrollment.id,
      behavior: enrollment.behavior,
      behaviorDescription: enrollment.behaviorDescription,
    };
    return filteredBehavior;
  }

  async updateBehavior(id: number, updateBehaviorDto: UpdateBehaviorDto) {
    const enrollment = await this.enrollmentRepository.preload({
      id: id,
      behavior: updateBehaviorDto.behavior,
      behaviorDescription: updateBehaviorDto.behaviorDescription,
      allowNextRegistration:
        updateBehaviorDto.behavior == Behavior.NORMAL ? true : false,
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

  async findOneCommitmentDocumentURL(id: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: id },
    });
    if (!enrollment)
      throw new NotFoundException(`Enrollment with id ${id} not found`);
    const filteredBehavior = {
      id: enrollment.id,
      commitmentDocumentURL: enrollment.commitmentDocumentURL,
      allowNextRegistration: enrollment.allowNextRegistration,
    };
    return filteredBehavior;
  }
  async updateAllowNextRegistration(
    id: number,
    updateAllowNextRegistrationDto: UpdateAllowNextRegistrationDto,
  ) {
    const enrollment = await this.enrollmentRepository.preload({
      id: id,
      allowNextRegistration:
        updateAllowNextRegistrationDto.allowNextRegistration,
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
  async uploadPDF(file: Buffer, id: number) {
    try {
      const enrollment = await this.enrollmentRepository.findOneByOrFail({
        id,
      });
      const folderName = this.configService.getOrThrow('FOLDER_IMG_NAME');
      const webpImage = await sharp(file).webp().toBuffer();
      const pdfFileName = `${Date.now()}.webp`;

      if (enrollment.commitmentDocumentURL) {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.configService.getOrThrow('BUCKET_NAME'),
            Key: `${folderName}/${enrollment.commitmentDocumentURL}`,
          }),
        );
      }

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.configService.getOrThrow('BUCKET_NAME'),
          Key: `${folderName}/${pdfFileName}`,
          Body: webpImage,
          ACL: 'public-read',
        }),
      );

      const urlS3 = this.configService.getOrThrow('AWS_URL_BUCKET');
      const urlPDF = `${urlS3}${folderName}/${pdfFileName}`;

      await this.enrollmentRepository
        .createQueryBuilder()
        .update()
        .set({ commitmentDocumentURL: pdfFileName })
        .where('id = :id', { id })
        .execute();
      return { urlPDF };
    } catch (error) {
      console.error(error);
      throw new NotFoundException(error.message);
    }
  }
}
