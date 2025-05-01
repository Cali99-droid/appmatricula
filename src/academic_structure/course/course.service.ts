import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { CourseDetail } from './entities/course_detail.entity';

@Injectable()
export class CourseService {
  private readonly logger = new Logger('courseService');
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseDetail)
    private readonly courseDetailRepository: Repository<CourseDetail>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
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
        name: 'ASC',
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
    const course = await this.courseDetailRepository.find({
      where: { course: { id: id } },
    });
    if (!course) throw new NotFoundException(`Course with id: ${id} not found`);
    await this.courseDetailRepository.remove(course);

    try {
      const coursesDetail = updateCourseDto.competencyId.map(
        async (element) => {
          const newEntry = this.courseDetailRepository.create({
            course: { id: id },
            competency: { id: element },
            status: true,
          });
          return await this.courseDetailRepository.save(newEntry);
        },
      );
      return await Promise.all(coursesDetail);
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
}
