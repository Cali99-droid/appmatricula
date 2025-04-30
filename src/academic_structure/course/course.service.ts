import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CourseService {
  private readonly logger = new Logger('courseService');
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    if (createCourseDto.order < 1)
      throw new NotFoundException(`Order must be greater than 0`);
    try {
      const newEntry = this.courseRepository.create({
        name: createCourseDto.name,
        area: { id: createCourseDto.areaId },
        order: createCourseDto.order,
        status: true,
      });
      const course = await this.courseRepository.save(newEntry);
      return course;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(areaId?: number) {
    const courses = await this.courseRepository.find({
      where: { area: { id: isNaN(areaId) ? undefined : areaId } },
      relations: { area: true },
      order: {
        name: 'ASC',
      },
    });
    return courses;
  }

  async findOne(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id: id },
    });
    if (!course) throw new NotFoundException(`Course with id ${id} not found`);
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const { areaId, ...rest } = updateCourseDto;
    const course = await this.courseRepository.preload({
      id: id,
      area: { id: areaId },
      ...rest,
    });
    if (!course) throw new NotFoundException(`Course with id: ${id} not found`);
    try {
      await this.courseRepository.save(course);
      return course;
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
