import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { CourseDetail } from './entities/course_detail.entity';
import { Competency } from '../competency/entities/competency.entity';

@Injectable()
export class CourseService {
  private readonly logger = new Logger('courseService');
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseDetail)
    private readonly courseDetailRepository: Repository<CourseDetail>,
    @InjectRepository(Competency)
    private readonly competencyRepository: Repository<Competency>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    for (const competencyId of createCourseDto.competencyId) {
      const existCompetency = await this.courseDetailRepository.findOneBy({
        competency: { id: competencyId },
      });
      if (existCompetency) {
        throw new NotFoundException(
          `Competency with id ${competencyId} exists`,
        );
      }
    }
    try {
      const course = this.courseRepository.create({
        name: createCourseDto.name,
        area: { id: createCourseDto.areaId },
        status: true,
      });
      await this.courseRepository.save(course);
      const coursesDetail = createCourseDto.competencyId.map(
        async (element) => {
          const newEntry = this.courseDetailRepository.create({
            course: { id: course.id },
            competency: { id: element },
            status: true,
          });
          return await this.courseDetailRepository.save(newEntry);
        },
      );

      const savedCourses = await Promise.all(coursesDetail);

      return savedCourses;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(areaId?: number) {
    const courses = await this.courseRepository.find({
      where: { area: { id: isNaN(areaId) ? undefined : areaId } },
      relations: {
        area: true,
        courseDetail: { competency: true, course: false },
      },
      order: {
        courseDetail: { course: { name: 'ASC' }, competency: { order: 'ASC' } },
      },
    });
    return courses;
  }

  async findOne(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id: id },
      relations: {
        area: true,
        courseDetail: { competency: true, course: false },
      },
    });
    if (!course) throw new NotFoundException(`Course with id ${id} not found`);
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const { areaId, competencyId, ...rest } = updateCourseDto;
    const course = await this.courseRepository.find({
      where: { id: id },
    });

    if (!course) throw new NotFoundException(`Course with id: ${id} not found`);
    for (const element of competencyId) {
      console.log(element);
      const competency = await this.competencyRepository.findOne({
        where: { id: element },
      });
      console.log(competency);
      if (!competency)
        throw new NotFoundException(`Competency with id: ${element} not found`);
    }

    const courseDetails = await this.courseDetailRepository.find({
      where: { course: { id: id } },
    });
    await this.courseDetailRepository.remove(courseDetails);

    try {
      competencyId.map(async (element) => {
        const newEntry = this.courseDetailRepository.create({
          course: { id: id },
          competency: { id: element },
          status: true,
        });
        return await this.courseDetailRepository.save(newEntry);
      });
      const course = await this.courseRepository.preload({
        id: id,
        area: { id: areaId },
        ...rest,
      });
      await this.courseRepository.save(course);
      return course;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const course = await this.courseRepository.findOneBy({ id });
    const courseDetail = await this.courseDetailRepository.find({
      where: { course: { id: id } },
    });
    if (!course) throw new NotFoundException(`Course by id: '${id}' not found`);
    try {
      for (const element of courseDetail) {
        await this.courseDetailRepository.remove(element);
      }
      await this.courseRepository.remove(course);
      return { msg: `Course with id: ${id} was deleted` };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
