import { In, Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { CreateActivityCourseDto } from './dto/activityCourse.dto';
import { ActivityCourse } from './entities/activityCourse.entity';
import { Competency } from '../competency/entities/competency.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { ActivityCourseResponseDto } from './dto/activityCourseResponse.dto';
import { UpdateActivityCourseDto } from './dto/update-activityCourse.dto';
import { Area } from '../area/entities/area.entity';
import { Level } from 'src/level/entities/level.entity';

@Injectable()
export class CourseService {
  private readonly logger = new Logger('courseService');
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(ActivityCourse)
    private readonly activityCourseRepository: Repository<ActivityCourse>,
    @InjectRepository(Competency)
    private readonly competencyRepository: Repository<Competency>,
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    // const existCompetency = await this.courseRepository.findOneBy({
    //   competency: { id: createCourseDto.competencyId },
    // });
    // if (existCompetency) {
    //   throw new NotFoundException(
    //     `Competency with id ${createCourseDto.competencyId} exists`,
    //   );
    // }
    try {
      const course = this.courseRepository.create({
        name: createCourseDto.name,
        area: { id: createCourseDto.areaId },
        // competency: { id: createCourseDto.competencyId },
        // activityClassroom: {
        //   id: isNaN(createCourseDto.activityClassRoomId)
        //     ? undefined
        //     : createCourseDto.activityClassRoomId,
        // },
        status: true,
      });
      return await this.courseRepository.save(course);
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(areaId?: number) {
    const courses = await this.courseRepository.find({
      where: {
        area: { id: isNaN(areaId) ? undefined : areaId },
        // },
        // relations: {
        //   competency: true,
        //   // activityClassroom: true,
      },
    });
    return courses;
  }

  async findOne(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id: id },
      // relations: {
      //   competency: true,
      //   // activityClassroom: true,
      // },
    });
    if (!course) throw new NotFoundException(`Course with id ${id} not found`);
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    // const existingCourse = await this.courseRepository.findOne({
    //   where: [
    //     {
    //       competency: { id: updateCourseDto.competencyId },
    //       // activityClassroom: {
    //       //   id: isNaN(updateCourseDto.activityClassRoomId)
    //       //     ? undefined
    //       //     : updateCourseDto.activityClassRoomId,
    //       // },
    //     },
    //   ],
    // });
    // if (existingCourse != undefined) {
    //   if (id != existingCourse.id) {
    //     throw new BadRequestException(`An Course with already exists.`);
    //   }
    // }
    try {
      const course = await this.courseRepository.preload({
        id: id,
        name: updateCourseDto.name,
        area: { id: updateCourseDto.areaId },
        // competency: { id: updateCourseDto.competencyId },
        // activityClassroom: {
        //   id: isNaN(updateCourseDto.activityClassRoomId)
        //     ? undefined
        //     : updateCourseDto.activityClassRoomId,
        // },
      });
      return await this.courseRepository.save(course);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const course = await this.courseRepository.findOneBy({ id });
    if (!course) throw new NotFoundException(`Course by id: '${id}' not found`);
    try {
      await this.courseRepository.remove(course);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  /**ACTIVITY */
  async createActivityCourse(createDto: CreateActivityCourseDto): Promise<any> {
    try {
      const { courseId, forAllClassrooms, competencies, activityClassrooms } =
        createDto;

      const cursoPeriodo = this.activityCourseRepository.create({
        course: { id: courseId },
        forAllClassrooms,
      });

      // Asignar competencias
      cursoPeriodo.competencies = await this.competencyRepository.findBy({
        id: In(competencies.map((c) => c.id)),
      });

      // Asignar aulas si no es para todas
      if (!forAllClassrooms && activityClassrooms) {
        cursoPeriodo.activityClassrooms =
          await this.activityClassroomRepository.findBy({
            id: In(activityClassrooms),
          });
      }

      const saved = await this.activityCourseRepository.save(cursoPeriodo);
      // console.log(saved);
      return saved;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAllActivityCourse(): Promise<ActivityCourseResponseDto[]> {
    try {
      const cursosPeriodo = await this.activityCourseRepository.find({
        relations: [
          'course',
          'course.area',
          'activityClassrooms',
          'competencies',
        ],
      });
      return cursosPeriodo.map(this.mapToResponseDto);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findOneActivityCourse(id: number): Promise<ActivityCourseResponseDto> {
    const cursoPeriodo = await this.activityCourseRepository.findOne({
      where: { id },
      relations: [
        'course',
        'course.area',
        'activityClassrooms',
        'competencies',
      ],
    });

    if (!cursoPeriodo) {
      throw new NotFoundException(`CursoPeriodo con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(cursoPeriodo);
  }

  async updateActivityCourse(
    id: number,
    updateDto: UpdateActivityCourseDto,
  ): Promise<any> {
    const cursoPeriodo = await this.activityCourseRepository.findOne({
      where: { id },
      relations: ['competencies', 'activityClassrooms'],
    });

    if (!cursoPeriodo) {
      throw new NotFoundException(`CursoPeriodo con ID ${id} no encontrado`);
    }

    // Actualizar propiedades básicas
    if (updateDto.forAllClassrooms !== undefined) {
      cursoPeriodo.forAllClassrooms = updateDto.forAllClassrooms;
    }

    // Actualizar competencias si vienen en el DTO
    if (updateDto.competencies) {
      cursoPeriodo.competencies = await this.competencyRepository.findBy({
        id: In(updateDto.competencies.map((c) => c.id)),
      });
    }

    // Actualizar curso si viene
    if (updateDto.courseId) {
      cursoPeriodo.course = { id: updateDto.courseId } as Course;
    }

    // Actualizar aulas si vienen en el DTO y no es para todas
    if (updateDto.activityClassrooms && !cursoPeriodo.forAllClassrooms) {
      cursoPeriodo.activityClassrooms =
        await this.activityClassroomRepository.findBy({
          id: In(updateDto.activityClassrooms),
        });
    }

    const saved = await this.activityCourseRepository.save(cursoPeriodo);
    return saved;
  }

  async removeActivityCourse(id: number): Promise<void> {
    try {
      const result = await this.activityCourseRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`CursoPeriodo con ID ${id} no encontrado`);
      }
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findByActivityClassroom(id: number) {
    try {
      const ac = await this.activityClassroomRepository.findOne({
        where: { id: id },
      });
      // 1. Obtener todas las áreas activas
      const areas = await this.areaRepository.find({
        where: { status: true, level: { id: ac.grade.level.id } },
        relations: ['level'],
      });

      // 2. Obtener cursos del periodo para el aula específica
      const cursosPeriodo = await this.activityCourseRepository.find({
        where: {
          // periodo: { id: periodoId },
          activityClassrooms: { id: id }, // Relación ManyToMany con aulas
        },
        relations: [
          'course',
          'course.area',
          'activityClassrooms',
          'competencies',
        ],
      });

      // 3. Estructurar la respuesta
      return areas.map((area) => {
        const cursosFiltrados = cursosPeriodo
          .filter((cp) => cp.course.area.id === area.id)
          .map((cp) => ({
            id: cp.course.id,
            nombre: cp.course.name,
            // descripcion: cp.course.descripcion,
            competencias: cp.competencies.map((c) => ({
              id: c.id,
              nombre: c.name,
            })),
            forAllClassrooms: cp.forAllClassrooms,
          }));

        return {
          id: area.id,
          nombre: area.name,
          nivel: {
            id: area.level.id,
            nombre: area.level.name,
          },
          cursos: cursosFiltrados,
          cantidadCursos: cursosFiltrados.length,
        };
      });
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async getActivityCourseBylevel(nivelId: number = 3) {
    // 1. Obtener el nivel con sus áreas
    const nivel = await this.levelRepository.findOne({
      where: { id: nivelId },
      relations: ['area'],
    });

    if (!nivel) {
      throw new NotFoundException(`Nivel con ID ${nivelId} no encontrado`);
    }

    // 2. Obtener todos los cursosPeriodo para las áreas de este nivel
    const cursosPeriodo = await this.activityCourseRepository.find({
      where: {
        course: {
          area: {
            level: { id: nivelId },
          },
        },
        active: true,
      },
      relations: [
        'course',
        'course.area',

        'activityClassrooms',
        'competencies',
      ],
    });

    // 3. Estructurar la respuesta
    const resultado: any = {
      // nivel: {
      //   id: nivel.id,
      //   nombre: nivel.nombre,
      // },
      areas: nivel.area.map((area) => ({
        id: area.id,
        nombre: area.name,
        cursosPeriodo: cursosPeriodo
          .filter((cp) => cp.course.area.id === area.id)
          .map(this.mapToResponseDto),
      })),
    };

    return resultado;
  }

  private mapToResponseDto(
    activityCourse: ActivityCourse,
  ): ActivityCourseResponseDto {
    return {
      id: activityCourse.id,
      forAllClassrooms: activityCourse.forAllClassrooms,
      active: activityCourse.active,
      course: {
        id: activityCourse.course.id,
        name: activityCourse.course.name,
        area: {
          id: activityCourse.course.area.id,
          name: activityCourse.course.area.name,
        },
      },
      // periodo: {
      //   id: activityCourse.periodo.id,
      //   nombre: activityCourse.periodo.nombre,
      // },
      activityClassroom:
        activityCourse.activityClassrooms?.map((aula) => ({
          id: aula.id,
          section: aula.section,
        })) || [],
      competencies:
        activityCourse.competencies?.map((competencia) => ({
          id: competencia.id,
          name: competencia.name,
        })) || [],
    };
  }
}
