import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAcademicAssignmentDto } from './dto/create-academic_assignment.dto';
import { UpdateAcademicAssignmentDto } from './dto/update-academic_assignment.dto';
import { AcademicAssignment } from './entities/academic_assignment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Area } from '../area/entities/area.entity';

@Injectable()
export class AcademicAssignmentService {
  private readonly logger = new Logger('academicStructureService');
  constructor(
    @InjectRepository(AcademicAssignment)
    private readonly academicAssignmentRepository: Repository<AcademicAssignment>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}
  async create(createAcademicAssignmentDto: CreateAcademicAssignmentDto) {
    try {
      const { activityClassroomId, areaId, userId, actCourseId, isTutor } =
        createAcademicAssignmentDto;
      if (isTutor) {
        const existingTutor = await this.academicAssignmentRepository.findOne({
          where: {
            activityClassroom: { id: activityClassroomId },
            isTutor: true,
          },
        });

        if (existingTutor) {
          throw new BadRequestException(
            'Ya existe un tutor asignado para esta aula.',
          );
        }
      }

      if (!actCourseId) {
        const existingAreaAssignment =
          await this.academicAssignmentRepository.findOne({
            where: {
              activityClassroom: { id: activityClassroomId },
              area: { id: areaId },
            },
          });

        if (existingAreaAssignment) {
          throw new BadRequestException(
            'Ya existe un docente asignado a esta área en el aula.',
          );
        }
      }

      // Validar si ya existe un docente para el curso en el aula (si se proporciona courseId)
      if (actCourseId) {
        const existingCourseAssignment =
          await this.academicAssignmentRepository.findOne({
            where: {
              activityClassroom: { id: activityClassroomId },
              actCourse: { id: actCourseId },
            },
          });

        if (existingCourseAssignment) {
          throw new BadRequestException(
            'Ya existe un docente asignado a este curso en el aula.',
          );
        }
      }

      // Crear la asignación
      const newAssignment = this.academicAssignmentRepository.create({
        activityClassroom: { id: activityClassroomId },
        area: { id: areaId },
        actCourse: actCourseId ? { id: actCourseId } : undefined,
        user: { id: userId },
        isTutor,
      });
      return await this.academicAssignmentRepository.save(newAssignment);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(activityClassroomId: number = 105) {
    try {
      const academicAssignments = await this.academicAssignmentRepository.find({
        where: {
          activityClassroom: { id: activityClassroomId },
        },
        relations: [
          'area',
          'actCourse',
          'actCourse.course',
          'user',
          'user.person',
        ],
      });
      console.log(academicAssignments);
      // 2. Obtener todas las áreas posibles por nivel (para incluir las que no tienen cursos)
      const areas = await this.areaRepository.find({
        where: {
          level: {
            id: academicAssignments[0].activityClassroom.grade.level.id,
          },
        },
        relations: ['course'],
      });

      // 3. Estructurar la respuesta
      return areas.map((area) => {
        // Buscar si el docente está asignado directamente al área
        const asignacionArea = academicAssignments.find(
          (a) => a.area?.id === area.id,
        );

        // Filtrar cursos del área
        const cursosDelArea = area.course.map((curso) => {
          // Buscar asignaciones a cursos específicos de este curso
          const asignacionCurso = academicAssignments.find(
            (a) => a.actCourse?.course?.id === curso.id,
          );

          return {
            id: curso.id,
            nombre: curso.name,
            asignacionCurso: asignacionCurso
              ? {
                  id: asignacionCurso.id,
                  docente: asignacionCurso.user.person.name,
                }
              : undefined,
          };
        });

        return {
          area: {
            id: area.id,
            nombre: area.name,
          },
          asignacionArea:
            cursosDelArea.length === 0
              ? {
                  id: asignacionArea?.id,
                  docente: asignacionArea?.user.person.name,
                }
              : undefined,
          cursos: cursosDelArea,
        };
      });
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
    return `This action returns all academicAssignment`;
  }

  async findOne(id: number) {
    try {
      const academicAssignment =
        await this.academicAssignmentRepository.findOne({
          where: {
            id,
          },
        });
      return academicAssignment;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async update(
    id: number,
    updateAcademicAssignmentDto: UpdateAcademicAssignmentDto,
  ) {
    const { activityClassroomId, areaId, actCourseId, userId, isTutor } =
      updateAcademicAssignmentDto;

    const teacherCompetency = await this.academicAssignmentRepository.preload({
      id,
      activityClassroom: { id: activityClassroomId },
      area: { id: areaId },
      actCourse: actCourseId ? { id: actCourseId } : undefined,
      user: { id: userId },
      isTutor,
    });

    if (!teacherCompetency) {
      throw new NotFoundException(`Asignación con id ${id} no encontrada`);
    }

    try {
      // Validar tutor duplicado (excepto este registro)
      if (isTutor) {
        const existingTutor = await this.academicAssignmentRepository.findOne({
          where: {
            activityClassroom: { id: activityClassroomId },
            isTutor: true,
          },
        });

        if (existingTutor && existingTutor.id !== id) {
          throw new BadRequestException(
            'Ya existe un tutor asignado para esta aula.',
          );
        }
      }

      // Validar duplicado de área
      const existingAreaAssignment =
        await this.academicAssignmentRepository.findOne({
          where: {
            activityClassroom: { id: activityClassroomId },
            area: { id: areaId },
          },
        });

      if (existingAreaAssignment && existingAreaAssignment.id !== id) {
        throw new BadRequestException(
          'Ya existe un docente asignado a esta área en el aula.',
        );
      }

      // Validar duplicado de curso
      if (actCourseId) {
        const existingCourseAssignment =
          await this.academicAssignmentRepository.findOne({
            where: {
              activityClassroom: { id: activityClassroomId },
              actCourse: { id: actCourseId },
            },
          });

        if (existingCourseAssignment && existingCourseAssignment.id !== id) {
          throw new BadRequestException(
            'Ya existe un docente asignado a este curso en el aula.',
          );
        }
      }

      await this.academicAssignmentRepository.save(teacherCompetency);
      return teacherCompetency;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} academicAssignment`;
  }
}
