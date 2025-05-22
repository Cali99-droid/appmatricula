import { In, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { CreateActivityCourseDto } from './dto/activityCourse.dto';
import { ActivityCourse } from './entities/activityCourse.entity';
import { Competency } from '../competency/entities/competency.entity';
import { ActivityCourseResponseDto } from './dto/activityCourseResponse.dto';
import { UpdateActivityCourseDto } from './dto/update-activityCourse.dto';
import { Area } from '../area/entities/area.entity';
import { Level } from 'src/level/entities/level.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import { SearchActivityCourseDto } from './dto/search-activity-course.dto';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Campus } from 'src/campus/entities/campus.entity';
import { Phase } from 'src/phase/entities/phase.entity';

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
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,

    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
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
        status: createCourseDto.status,
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
        status: updateCourseDto.status,
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
      const {
        courseId,
        forAllGrades,
        competencies,
        grades,
        campusId,
        levelId,
        phaseId,
      } = createDto;

      const acourse = await this.activityCourseRepository.findOne({
        where: [
          {
            competencies: { id: In(competencies) },
            campus: { id: campusId },
            grades: { id: In(grades) },
          },
          {
            forAllGrades: true,
            competencies: { id: In(competencies) },
            campus: { id: campusId },
          },
        ],
      });

      if (acourse) {
        throw new BadRequestException('Competencia en uso');
      }
      const level = await this.levelRepository.findOne({
        where: {
          id: levelId,
          // grade: {
          //   id: In(grades),
          // },
        },
        relations: {
          area: {
            course: true,
          },
          grade: true,
        },
      });

      const courseIds = level.area
        .filter((a) => a.course.length != 0)
        .map((a) => a.course)
        .flat()
        .map((c) => c.id);
      if (!courseIds.includes(courseId)) {
        throw new BadRequestException(
          'El curso no esta habilitado para este nivel',
        );
      }

      // Obtener los IDs de los grados de ese nivel
      const levelGradeIds = level.grade.map((g) => g.id);

      // Verificar si TODOS los `grades` que recibiste están en los del nivel
      const allMatch = grades.every((id) => levelGradeIds.includes(id));

      if (!allMatch) {
        throw new BadRequestException(
          'Alguno de los grados nos pertenecen al nivel',
        );
      }

      const cursoPeriodo = this.activityCourseRepository.create({
        course: { id: courseId },
        campus: { id: campusId },
        phase: { id: phaseId },
        forAllGrades,
      });

      // Asignar competencias
      cursoPeriodo.competencies = await this.competencyRepository.findBy({
        id: In(competencies),
      });

      // Asignar aulas si no es para todas
      if (!forAllGrades && grades) {
        cursoPeriodo.grades = await this.gradeRepository.findBy({
          id: In(grades),
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
      relations: ['competencies'],
    });

    if (!cursoPeriodo) {
      throw new NotFoundException(`CursoPeriodo con ID ${id} no encontrado`);
    }

    // Actualizar propiedades básicas
    if (updateDto.forAllGrades !== undefined) {
      cursoPeriodo.forAllGrades = updateDto.forAllGrades;
    }

    // Actualizar competencias si vienen en el DTO
    if (updateDto.competencies) {
      cursoPeriodo.competencies = await this.competencyRepository.findBy({
        id: In(updateDto.competencies),
      });
    }

    if (updateDto.campusId) {
      cursoPeriodo.campus = { id: updateDto.campusId } as Campus;
    }

    if (updateDto.phaseId) {
      cursoPeriodo.phase = { id: updateDto.phaseId } as Phase;
    }

    // Actualizar curso si viene
    if (updateDto.courseId) {
      cursoPeriodo.course = { id: updateDto.courseId } as Course;
    }

    // Actualizar aulas si vienen en el DTO y no es para todas
    if (updateDto.grades && !cursoPeriodo.forAllGrades) {
      cursoPeriodo.grades = await this.gradeRepository.findBy({
        id: In(updateDto.grades),
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
  /**es por GRADO */
  async findByActivityClassroom(id: number) {
    try {
      const ac = await this.activityClassroomRepository.findOne({
        where: { id: id },
      });

      if (!ac) {
        throw new NotFoundException('this classroom doesnt exists');
      }
      const yearId = ac.phase.year.id;
      // 1. Obtener todas las áreas activas
      const areas = await this.areaRepository.find({
        where: { status: true, level: { id: ac.grade.level.id } },
        relations: ['level'],
      });

      // 2. Obtener cursos del periodo para el aula específica
      const cursosPeriodo = await this.activityCourseRepository.find({
        where: [
          {
            campus: {
              year: { id: yearId },
              campusDetail: { id: ac.classroom.campusDetail.id },
            },
            grades: {
              id: ac.grade.id,
            },
          },
          {
            forAllGrades: true,
          },
        ],

        relations: ['course', 'course.area', 'competencies'],
      });
      // 3. Estructurar la respuesta
      return areas.map((area) => {
        const cursosFiltrados = cursosPeriodo
          .filter((cp) => cp.course.area.id === area.id)
          .map((cp) => ({
            id: cp.id,
            nombre: cp.course.name,
            // descripcion: cp.course.descripcion,
            competencias: cp.competencies.map((c) => ({
              id: c.id,
              nombre: c.name,
            })),
            forAllClassrooms: cp.forAllGrades,
          }));

        return {
          id: area.id,
          nombre: area.name,
          // nivel: {
          //   id: area.level.id,
          //   nombre: area.level.name,
          // },
          cursos: cursosFiltrados,
          cantidadCursos: cursosFiltrados.length,
        };
      });
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async getActivityCourseParams(
    searchActivityCourseDto: SearchActivityCourseDto,
  ) {
    try {
      const { levelId, campusId, gradeId, phaseId } = searchActivityCourseDto;

      // 1. Obtener áreas del nivel
      const areas = await this.areaRepository.find({
        where: {
          status: true,
          level: {
            id: levelId,
          },
        },
        relations: ['level', 'competency'],
        order: { order: 'ASC' },
      });

      // 2. Construir condiciones dinámicas para los cursos
      const whereConditions: any[] = [];

      if (gradeId) {
        whereConditions.push({
          campus: { id: campusId },
          grades: { id: In([gradeId]) },
        });
      }

      // Agregar cursos generales (forAllGrades)
      whereConditions.push({
        campus: { id: campusId },
        forAllGrades: true,
      });

      const courses = await this.activityCourseRepository.find({
        where: [
          {
            phase: { id: phaseId },
            campus: { id: campusId },
            grades: { id: In([gradeId]) },
          },
          {
            phase: { id: phaseId },
            campus: { id: campusId },
            forAllGrades: true,
          },
        ],
        relations: ['course', 'course.area', 'grades', 'competencies'],
        order: {
          competencies: { order: 'ASC' },
        },
      });

      // 3. Estructurar la respuesta agrupada por área
      return areas.map((area) => {
        const filteredCourses = courses
          .filter((cp) => cp.course.area.id === area.id)
          .map((cp) => ({
            id: cp.id,
            name: cp.course.name,
            forAllGrades: cp.forAllGrades,
            competencias: cp.competencies.map((c) => ({
              id: c.id,
              name: c.name,
              order: c.order,
            })),
            grades: cp.grades.map((g) => ({
              id: g.id,
              name: g.name,
            })),
          }));

        return {
          id: area.id,
          name: area.name,
          order: area.order,
          competencies: area.competency.length,
          coursesLength: filteredCourses.length,
          courses: filteredCourses,
        };
      });
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  private mapResponse(activityCourse: ActivityCourse) {
    return {
      id: activityCourse.id,
      forAllClassrooms: activityCourse.forAllGrades,
      active: activityCourse.active,
      courseName: activityCourse.course.name,
      competencies:
        activityCourse.competencies?.map((competencia) => ({
          id: competencia.id,
          name: competencia.name,
        })) || [],
      activityClassroom:
        activityCourse.grades?.map((aula) => ({
          id: aula.id,
          classroom: aula.name,
        })) || [],
    };
  }
  private mapToResponseDto(
    activityCourse: ActivityCourse,
  ): ActivityCourseResponseDto {
    return {
      id: activityCourse.id,
      forAllClassrooms: activityCourse.forAllGrades,
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
        activityCourse.grades?.map((aula) => ({
          id: aula.id,
          section: aula.name,
        })) || [],
      competencies:
        activityCourse.competencies?.map((competencia) => ({
          id: competencia.id,
          name: competencia.name,
        })) || [],
    };
  }
}
