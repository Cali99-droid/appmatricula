import { Injectable, Logger } from '@nestjs/common';
import { CreateAcademicRecordDto } from './dto/create-academic_record.dto';
import { UpdateAcademicRecordDto } from './dto/update-academic_record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicRecord } from './entities/academic_record.entity';
import { Repository } from 'typeorm';
import {
  AcademicAssignment,
  TypeAssignment,
} from '../academic_assignment/entities/academic_assignment.entity';
import { Student } from 'src/student/entities/student.entity';

import { ActivityClassroomService } from 'src/activity_classroom/activity_classroom.service';

@Injectable()
export class AcademicRecordsService {
  private readonly logger = new Logger('AcademicRecordsService');
  constructor(
    @InjectRepository(AcademicRecord)
    private readonly academicRecordRepository: Repository<AcademicRecord>,

    @InjectRepository(AcademicAssignment)
    private readonly academicAssignmentRepository: Repository<AcademicAssignment>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    private activityClassroomService: ActivityClassroomService,
  ) {}
  create(createAcademicRecordDto: CreateAcademicRecordDto) {
    return 'This action adds a new academicRecord';
  }

  async findAll() {
    /**lista de estudiantes  */
    let competencies;
    const academicAssign = await this.academicAssignmentRepository.findOne({
      where: {
        id: 1,
      },
      relations: [
        'area',
        'area.competency',
        'actCourse',
        'actCourse.course',
        'actCourse.competencies',
        'user',
        'user.person',
      ],
    });

    if (academicAssign.typeAssignment === TypeAssignment.SPECIFIC_COURSE) {
      competencies = academicAssign.actCourse.competencies;
    } else {
      competencies = academicAssign.area.competency;
    }

    const students = await this.activityClassroomService.findStudents(
      academicAssign.activityClassroom.id,
    );

    const records = await this.academicRecordRepository.find({
      where: {
        academicAssignment: { id: academicAssign.id },
      },
      relations: {
        student: true,
        competency: true,
        academicAssignment: true,
      },
    });

    //  Estructurar la respuesta
    const estudiantesDto = students.map((estudiante) => {
      // let index = 0;
      const competenciasDto = competencies.map((competencia) => {
        const calificacionExistente = records.find(
          (c) =>
            c.student.id === estudiante.id &&
            c.competency.id === competencia.id &&
            c.academicAssignment.id === academicAssign.id,
        );
        // index += 1;
        return {
          id: competencia.id,
          name: competencia.name,
          // cod: index,
          value: calificacionExistente ? calificacionExistente.value : '',
        };
      });

      return {
        studentCode: estudiante.studentCode,
        studentId: estudiante.id,
        student: `${estudiante.lastname} ${estudiante.mLastname} ${estudiante.name}`,
        competencies: competenciasDto,
      };
    });

    return {
      asignacion: {
        id: academicAssign.id,
        type: academicAssign.typeAssignment,
        area: academicAssign.area
          ? {
              id: academicAssign.area.id,
              name: academicAssign.area.name,
            }
          : undefined,
        curso: academicAssign.actCourse?.course
          ? {
              id: academicAssign.actCourse.id,
              name: academicAssign.actCourse.course.name,
            }
          : undefined,
      },
      students: estudiantesDto,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} academicRecord`;
  }

  update(id: number, updateAcademicRecordDto: UpdateAcademicRecordDto) {
    return `This action updates a #${id} academicRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} academicRecord`;
  }
}
