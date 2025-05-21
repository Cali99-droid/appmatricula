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
      } = createDto;

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
      const { levelId, campusId } = searchActivityCourseDto;
      // let areas;
      // let courses;
      // const grade = await this.gradeRepository.findOne({
      //   where: { id: gradeId },
      // });
      // if (!grade) {
      //   throw new NotFoundException(`Grado con ID ${gradeId} no encontrado`);
      // }

      const areas = await this.areaRepository.find({
        where: { status: true, level: { id: levelId } },
        relations: ['level', 'competency'],
      });
      const courses = await this.activityCourseRepository.find({
        where: {
          campus: {
            id: campusId,
          },
          // periodo: { id: periodoId },
          grades: {
            level: {
              id: levelId,
            },
          }, // Relación ManyToMany con aulas
        },
        relations: ['course', 'course.area', 'grades', 'competencies'],
      });

      // // 1. Obtener todas las áreas activas
      // if (!areaId) {
      //   areas = await this.areaRepository.find({
      //     where: { status: true, level: { id: grade.level.id } },
      //     relations: ['level', 'competency'],
      //   });
      //   courses = await this.activityCourseRepository.find({
      //     where: {
      //       // periodo: { id: periodoId },
      //       grades: { id: gradeId }, // Relación ManyToMany con aulas
      //     },
      //     relations: ['course', 'course.area', 'grades', 'competencies'],
      //   });
      // } else {
      //   areas = await this.areaRepository.find({
      //     where: { status: true, id: +areaId },
      //     relations: ['level', 'competency'],
      //   });

      //   courses = await this.activityCourseRepository.find({
      //     where: {
      //       // periodo: { id: periodoId },
      //       course: {
      //         area: {
      //           id: +areaId,
      //         },
      //       }, // Relación ManyToMany con aulas
      //     },
      //     relations: ['course', 'course.area', 'grades', 'competencies'],
      //   });
      // }

      // 3. Estructurar la respuesta
      return areas.map((area) => {
        const cursosFiltrados = courses
          .filter((cp) => cp.course.area.id === area.id)
          .map((cp) => ({
            id: cp.id,
            name: cp.course.name,
            // descripcion: cp.course.descripcion,
            forAllGrades: cp.forAllGrades,
            competencias: cp.competencies.map((c) => ({
              id: c.id,
              name: c.name,
            })),

            grades: cp.grades.map((g) => ({
              id: g.id,
              name: g.name,
            })),
          }));

        return {
          id: area.id,
          name: area.name,
          competencies: area.competency.length,
          coursesLength: cursosFiltrados.length,
          courses: cursosFiltrados,
        };
      });
      // // 3. Estructurar la respuesta
      // const resultado: any = {
      //   // nivel: {
      //   //   id: nivel.id,
      //   //   nombre: nivel.nombre,
      //   // },
      //   areas: level.area.map((area) => ({
      //     id: area.id,
      //     name: area.name,
      //     coursesLength: courses
      //       .filter((cp) => cp.course.area.id === area.id)
      //       .map(this.mapToResponseDto).length,
      //     competenciesLength: area.competency.length,
      //     courses: courses
      //       .filter((cp) => cp.course.area.id === area.id)
      //       .map(this.mapResponse),
      //   })),
      // };

      // return resultado;
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
