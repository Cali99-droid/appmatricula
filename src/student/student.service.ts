import { Injectable, NotFoundException } from '@nestjs/common';
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
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class StudentService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_REGION'),
  });
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
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
        parentTwo: student.family
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

  findOne(id: number) {
    return `This action returns a #${id} student`;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
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
}
