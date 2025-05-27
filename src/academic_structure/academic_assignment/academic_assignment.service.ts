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
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { KeycloakTokenPayload } from 'src/auth/interfaces/keycloak-token-payload .interface';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AcademicAssignmentService {
  private readonly logger = new Logger('academicStructureService');
  constructor(
    @InjectRepository(AcademicAssignment)
    private readonly academicAssignmentRepository: Repository<AcademicAssignment>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,

    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createAcademicAssignmentDto: CreateAcademicAssignmentDto) {
    try {
      const {
        activityClassroomId,
        areaId,
        userId,
        actCourseId,
        isTutor,
        typeAssignment,
      } = createAcademicAssignmentDto;
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
        typeAssignment: typeAssignment,
        isTutor,
      });
      return await this.academicAssignmentRepository.save(newAssignment);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(activityClassroomId: number) {
    try {
      const actClassroom = await this.activityClassroomRepository.findOne({
        where: {
          id: parseInt(activityClassroomId.toString()),
        },
      });

      if (!actClassroom) {
        throw new NotFoundException('no existe el aula');
      }

      const academicAssignments = await this.academicAssignmentRepository.find({
        where: {
          activityClassroom: {
            id: actClassroom.id,
          },
        },
        relations: [
          'area',
          'actCourse',
          'actCourse.course',
          'actCourse.competencies',
          'user',
          'user.person',
        ],
      });

      const areas = await this.areaRepository.find({
        where: {
          level: {
            id: actClassroom.grade.level.id,
          },
        },
        relations: ['course'],
      });

      // 3. Estructurar la respuesta
      return areas.map((area) => {
        // Buscar si el docente está asignado directamente al área
        const asignacionArea = academicAssignments.find(
          (a) => a.area?.id === area.id && !a.actCourse,
        );

        // Filtrar cursos del área
        const cursosDelArea = area.course
          .map((curso) => {
            // Buscar asignaciones a cursos específicos de este curso
            const asignacionCurso = academicAssignments.find(
              (a) => a.actCourse?.course?.id === curso.id,
            );

            const fullName = [
              asignacionCurso?.user?.person?.lastname,
              asignacionCurso?.user?.person?.mLastname,
              asignacionCurso?.user?.person?.name,
            ]
              .filter(Boolean) // elimina valores falsy como null, undefined o ''
              .join(' ') // une con un espacio
              .trim();
            return {
              id: asignacionCurso?.id,
              courseId: asignacionCurso?.actCourse.id,
              name: asignacionCurso?.actCourse.course.name,
              teacherId: asignacionCurso?.user?.id || null,
              teacher: fullName || null,
              isTutor: asignacionCurso?.isTutor || false,
              competencies: asignacionCurso?.actCourse?.competencies.map(
                (c) => c.name,
              ),
              // courseAssignment: asignacionCurso
              //   ? {
              //       id: asignacionCurso.id,
              //       teacher: asignacionCurso.user.person.name,
              //     }
              //   : null,
            };
          })
          .filter((c) => c.teacher !== null);

        const fullName = [
          asignacionArea?.user?.person?.lastname,
          asignacionArea?.user?.person?.mLastname,
          asignacionArea?.user?.person?.name,
        ]
          .filter(Boolean) // elimina valores falsy como null, undefined o ''
          .join(' ') // une con un espacio
          .trim(); // elimina espacios sobrantes
        return {
          asignacionAreaId: asignacionArea?.id || null,
          areaId: area.id,
          isTutor: asignacionArea?.isTutor || false,
          area: area.name,
          teacherId: asignacionArea?.user?.id || null,
          teacher: fullName || null,
          courses: cursosDelArea,
        };
      });
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findOne(id: number) {
    try {
      const academicAssignment =
        await this.academicAssignmentRepository.findOne({
          where: {
            id,
          },
        });

      return {
        id: academicAssignment.id,
        isTutor: academicAssignment.isTutor,
        typeAssignment: academicAssignment.typeAssignment,
        user: {
          id: academicAssignment.user.id,
          email: academicAssignment.user.email,
        },
        area: {
          id: academicAssignment.area.id,
          name: academicAssignment.area.name,
        },
        actCourse: academicAssignment.actCourse,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async update(
    id: number,
    updateAcademicAssignmentDto: UpdateAcademicAssignmentDto,
  ) {
    const {
      activityClassroomId,
      areaId,
      userId,
      actCourseId,
      isTutor,
      typeAssignment,
    } = updateAcademicAssignmentDto;

    const teacherCompetency = await this.academicAssignmentRepository.preload({
      id,
      activityClassroom: { id: activityClassroomId },
      area: { id: areaId },
      actCourse: actCourseId ? { id: actCourseId } : undefined,
      user: { id: userId },
      typeAssignment: typeAssignment,
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
            actCourse: { id: null },
          },
        });

      if (existingAreaAssignment && existingAreaAssignment.id !== id) {
        throw new BadRequestException(
          'Ya existe un area asignada a esta área en el aula.',
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

  async remove(id: number) {
    try {
      const result = await this.academicAssignmentRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Asignacion no encontrada con ID ${id} no encontrado`,
        );
      }
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  /**TEACHER ASSIGMENTS */
  async findTeacherAssigments(yearId: number, payload: KeycloakTokenPayload) {
    try {
      const us = await this.userRepository.findOne({
        where: {
          email: payload.email,
        },
      });
      if (!us) {
        throw new NotFoundException('User not found');
      }

      const academicAssignments = await this.academicAssignmentRepository.find({
        where: {
          user: { id: us.id },
          activityClassroom: {
            phase: {
              year: {
                id: yearId,
              },
            },
          },
        },
        relations: [
          'area',
          'actCourse',
          'actCourse.course',
          // 'actCourse.competencies',
        ],
        order: {
          area: {
            order: 'ASC',
          },
        },
      });

      const formatData = academicAssignments.map((aa) => {
        return {
          id: aa.id,
          isTutor: aa.isTutor,
          typeAssignment: aa.typeAssignment,
          area: aa.area.name,
          phase: aa.activityClassroom.phase.type,
          activityClassroomId: aa.activityClassroom.id,
          gradeId: aa.activityClassroom.grade.id,
          grade: aa.activityClassroom.grade.name,
          activityClassroom: `${aa.activityClassroom.grade.name} ${aa.activityClassroom.section}`,
          level: aa.activityClassroom.grade.level.name,
          campusId: aa.activityClassroom.classroom.campusDetail.id,
          campus: aa.activityClassroom.classroom.campusDetail.name,
          course: {
            id: aa.actCourse?.id,
            name: aa.actCourse?.course?.name,
            // competency: aa.actCourse?.competencies,
          },
        };
      });

      return formatData;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
