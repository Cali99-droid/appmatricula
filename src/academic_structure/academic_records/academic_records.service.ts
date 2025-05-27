import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAcademicRecordDto } from './dto/create-academic_record.dto';
import { UpdateAcademicRecordDto } from './dto/update-academic_record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicRecord } from './entities/academic_record.entity';
import { DataSource, In, Repository } from 'typeorm';
import {
  AcademicAssignment,
  TypeAssignment,
} from '../academic_assignment/entities/academic_assignment.entity';
import { Student } from 'src/student/entities/student.entity';

import { ActivityClassroomService } from 'src/activity_classroom/activity_classroom.service';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { User } from 'src/user/entities/user.entity';
import { KeycloakTokenPayload } from 'src/auth/interfaces/keycloak-token-payload .interface';
import { AcademicRecordsResponseDto } from './dto/res-academic-record.dto';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private activityClassroomService: ActivityClassroomService,
    @Inject(DataSource)
    private dataSource: DataSource,
  ) {}
  async create(
    createAcademicRecordDto: CreateAcademicRecordDto,
    payload: KeycloakTokenPayload,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let competencies;
    try {
      const { academicAssignmentId, records, bimesterId } =
        createAcademicRecordDto;

      const us = await this.userRepository.findOne({
        where: {
          email: payload.email,
        },
      });
      const academicAssignment =
        await this.academicAssignmentRepository.findOne({
          where: {
            id: academicAssignmentId,
          },
          relations: [
            'area',
            'area.competency',
            'actCourse',
            'actCourse.course',
            'actCourse.competencies',
          ],
        });

      if (!academicAssignment) {
        throw new NotFoundException('Asignación no encontrada');
      }

      if (
        academicAssignment.typeAssignment === TypeAssignment.SPECIFIC_COURSE
      ) {
        competencies = academicAssignment.actCourse.competencies;
      } else {
        competencies = academicAssignment.area.competency;
      }

      const competenciesIds = competencies.map((c) => c.id);
      const invalidCompetencies = records.flatMap((e) =>
        e.competencies
          .filter((c) => !competenciesIds.includes(c.competencyId))
          .map((c) => c.competencyId),
      );

      if (invalidCompetencies.length > 0) {
        throw new BadRequestException(
          `Las competencias [${invalidCompetencies.join(', ')}] no pertenecen al curso o area`,
        );
      }

      for (const estudianteCalif of records) {
        // Validar que el estudiante existe
        // const estudiante = await this.estudianteRepository.findOneBy({
        //   id: estudianteCalif.estudianteId
        // });

        // if (!estudiante) {
        //   throw new NotFoundException(
        //     `Estudiante con ID ${estudianteCalif.estudianteId} no encontrado`
        //   );
        // }

        // Registrar cada competencia
        for (const competenciaCalif of estudianteCalif.competencies) {
          await queryRunner.manager.save(AcademicRecord, {
            student: { id: estudianteCalif.studentId },
            competency: { id: competenciaCalif.competencyId },
            academicAssignment: { id: academicAssignmentId },
            user: { id: us.id },
            value: competenciaCalif.value,
            bimester: { id: bimesterId },
            // comentario: competenciaCalif.comentario,
            // fechaRegistro: new Date(),
          });
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      handleDBExceptions(error, this.logger);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    academicRecordId: number,
    bimesterId: number,
  ): Promise<AcademicRecordsResponseDto> {
    /**lista de estudiantes  */
    let competencies;
    if (!bimesterId) {
      throw new NotFoundException('Param bimesterId is required');
    }
    const academicAssign = await this.academicAssignmentRepository.findOne({
      where: {
        id: academicRecordId,
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

    if (!academicAssign) {
      throw new NotFoundException('Asignación no encontrada');
    }

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
        bimester: { id: bimesterId },
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
          academicRecordId: calificacionExistente
            ? calificacionExistente.id
            : '',
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
      academicAssignment: {
        id: academicAssign.id,
        type: academicAssign.typeAssignment,
        area: academicAssign.area
          ? {
              id: academicAssign.area.id,
              name: academicAssign.area.name,
            }
          : undefined,
        course: academicAssign.actCourse?.course
          ? {
              id: academicAssign.actCourse.id,
              name: academicAssign.actCourse.course.name,
            }
          : undefined,
      },
      students: estudiantesDto,
    } as AcademicRecordsResponseDto;
  }

  findOne(id: number) {
    return `This action returns a #${id} academicRecord`;
  }

  async update(
    updateAcademicRecordDto: CreateAcademicRecordDto,
    payload: KeycloakTokenPayload,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let created = 0;
    let updated = 0;
    let competencies;

    try {
      const { academicAssignmentId, records, bimesterId } =
        updateAcademicRecordDto;

      const us = await this.userRepository.findOne({
        where: {
          email: payload.email,
        },
      });

      const academicAssignment =
        await this.academicAssignmentRepository.findOne({
          where: {
            id: academicAssignmentId,
          },
          relations: [
            'area',
            'area.competency',
            'actCourse',
            'actCourse.course',
            'actCourse.competencies',
          ],
        });

      if (!academicAssignment) {
        throw new NotFoundException('Asignación no encontrada');
      }

      if (
        academicAssignment.typeAssignment === TypeAssignment.SPECIFIC_COURSE
      ) {
        competencies = academicAssignment.actCourse.competencies;
      } else {
        competencies = academicAssignment.area.competency;
      }

      const competenciesIds = competencies.map((c) => c.id);
      const invalidCompetencies = records.flatMap((e) =>
        e.competencies
          .filter((c) => !competenciesIds.includes(c.competencyId))
          .map((c) => c.competencyId),
      );

      if (invalidCompetencies.length > 0) {
        throw new BadRequestException(
          `Las competencias [${invalidCompetencies.join(', ')}] no pertenecen al curso o area`,
        );
      }

      // 1. Validar duplicados en el payload
      this.validarDuplicadosEnPayload(updateAcademicRecordDto);

      // 2. Verificar existencia de calificaciones previas
      const existentes = await this.obtenerCalificacionesExistentes(
        updateAcademicRecordDto,
      );

      for (const estudianteCalif of records) {
        // Procesar cada competencia
        for (const competenciaCalif of estudianteCalif.competencies) {
          const clave = `${estudianteCalif.studentId}-${competenciaCalif.competencyId}`;
          const existente = existentes.get(clave);
          if (existente && !competenciaCalif.academicRecordId) {
            throw new ConflictException(
              `Ya existe calificación para el estudiante ${estudianteCalif.studentId} en la competencia ${competenciaCalif.competencyId}`,
            );
          }
          if (competenciaCalif.academicRecordId) {
            // Actualización de calificación existente
            const updateResult = await queryRunner.manager.update(
              AcademicRecord,
              {
                id: competenciaCalif.academicRecordId,
                student: { id: estudianteCalif.studentId },
                competency: { id: competenciaCalif.competencyId },
                // user: { id: us.id },
                academicAssignment: { id: academicAssignmentId },
              },
              {
                value: competenciaCalif.value,
                bimester: { id: bimesterId },
                user: { id: us.id },
              },
            );

            if (updateResult.affected > 0) {
              updated++;
            }
          } else {
            // Creación de nueva calificación
            await queryRunner.manager.save(AcademicRecord, {
              student: { id: estudianteCalif.studentId },
              competency: { id: competenciaCalif.competencyId },
              academicAssignment: { id: academicAssignmentId },
              user: { id: us.id },
              value: competenciaCalif.value,
              bimester: { id: bimesterId },
              // comentario: competenciaCalif.comentario,
              // fechaRegistro: new Date(),
            });
            created++;
          }
        }
      }

      await queryRunner.commitTransaction();
      return { updated, created };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error, this.logger);
    } finally {
      await queryRunner.release();
    }
  }
  remove(id: number) {
    return `This action removes a #${id} academicRecord`;
  }
  private validarDuplicadosEnPayload(
    updateAcademicRecordDto: UpdateAcademicRecordDto,
  ) {
    const duplicados = new Set<string>();
    const claves = new Set<string>();

    for (const estudianteCalif of updateAcademicRecordDto.records) {
      for (const competenciaCalif of estudianteCalif.competencies) {
        const clave = `${estudianteCalif.studentId}-${competenciaCalif.competencyId}`;
        if (claves.has(clave)) {
          duplicados.add(clave);
        }
        claves.add(clave);
      }
    }

    if (duplicados.size > 0) {
      throw new BadRequestException(
        `Payload contiene calificaciones duplicadas para las combinaciones: ${[...duplicados].join(', ')}`,
      );
    }
  }

  private async obtenerCalificacionesExistentes(
    updateAcademicRecordDto: UpdateAcademicRecordDto,
  ) {
    const estudianteIds = updateAcademicRecordDto.records.map(
      (e) => e.studentId,
    );
    const competenciaIds = updateAcademicRecordDto.records.flatMap((e) =>
      e.competencies.map((c) => c.competencyId),
    );

    const existentes = await this.academicRecordRepository.find({
      where: {
        academicAssignment: {
          id: updateAcademicRecordDto.academicAssignmentId,
        },
        student: In(estudianteIds),
        competency: In(competenciaIds),
        bimester: { id: updateAcademicRecordDto.bimesterId },
      },
      relations: {
        student: true,
        competency: true,
      },
    });

    // Mapear para búsqueda rápida
    const mapa = new Map<string, AcademicRecord>();
    existentes.forEach((cal) => {
      mapa.set(`${cal.student.id}-${cal.competency.id}`, cal);
    });
    return mapa;
  }
}
