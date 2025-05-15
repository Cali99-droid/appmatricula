import { Repository } from 'typeorm';
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

@Injectable()
export class CourseService {
  private readonly logger = new Logger('courseService');
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    console.log('createCourseDto', createCourseDto);
    const existCompetency = await this.courseRepository.findOneBy({
      area: { id: createCourseDto.areaId },
      competency: { id: createCourseDto.competencyId },
    });
    if (existCompetency) {
      throw new NotFoundException(
        `Competency with id ${createCourseDto.competencyId} exists`,
      );
    }
    try {
      const course = this.courseRepository.create({
        name: createCourseDto.name,
        area: { id: createCourseDto.areaId },
        competency: { id: createCourseDto.competencyId },
        activityClassroom: {
          id: isNaN(createCourseDto.activityClassRoomId)
            ? undefined
            : createCourseDto.activityClassRoomId,
        },
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
        activityClassroom: { id: isNaN(areaId) ? undefined : areaId },
      },
      relations: {
        area: true,
        competency: true,
        activityClassroom: true,
      },
    });
    return courses;
  }

  async findOne(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id: id },
      relations: {
        area: true,
        competency: true,
        activityClassroom: true,
      },
    });
    if (!course) throw new NotFoundException(`Course with id ${id} not found`);
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const existingCourse = await this.courseRepository.findOne({
      where: [
        {
          area: { id: updateCourseDto.areaId },
          competency: { id: updateCourseDto.competencyId },
          activityClassroom: {
            id: isNaN(updateCourseDto.activityClassRoomId)
              ? undefined
              : updateCourseDto.activityClassRoomId,
          },
        },
      ],
    });
    if (existingCourse != undefined) {
      if (id != existingCourse.id) {
        throw new BadRequestException(`An Course with already exists.`);
      }
    }
    try {
      const course = await this.courseRepository.preload({
        id: id,
        name: updateCourseDto.name,
        area: { id: updateCourseDto.areaId },
        competency: { id: updateCourseDto.competencyId },
        activityClassroom: {
          id: isNaN(updateCourseDto.activityClassRoomId)
            ? undefined
            : updateCourseDto.activityClassRoomId,
        },
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
}
