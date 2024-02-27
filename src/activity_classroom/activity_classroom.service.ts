import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateActivityClassroomDto } from './dto/create-activity_classroom.dto';
import { UpdateActivityClassroomDto } from './dto/update-activity_classroom.dto';
import { ActivityClassroom } from './entities/activity_classroom.entity';
import { Classroom } from 'src/classroom/entities/classroom.entity';
import { Phase } from 'src/phase/entities/phase.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import { SchoolShift } from 'src/school_shifts/entities/school_shift.entity';
import { SearchClassroomsDto } from 'src/common/dto/search-classrooms.dto';
@Injectable()
export class ActivityClassroomService {
  private readonly logger = new Logger('ActivityClassroomService');
  constructor(
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
  ) {}
  async create(createActivityClassroomDto: CreateActivityClassroomDto) {
    const activityClassroom = this.activityClassroomRepository.create(
      createActivityClassroomDto,
    );
    activityClassroom.classroom = {
      id: createActivityClassroomDto.classroomId,
    } as Classroom;
    activityClassroom.phase = {
      id: createActivityClassroomDto.phaseId,
    } as Phase;
    activityClassroom.grade = {
      id: createActivityClassroomDto.gradeId,
    } as Grade;
    activityClassroom.schoolShift = {
      id: createActivityClassroomDto.schoolShiftId,
    } as SchoolShift;

    const existClassroom = await this.activityClassroomRepository.findOne({
      where: activityClassroom,
    });

    if (existClassroom)
      throw new BadRequestException('activityClassroom exists');
    try {
      return this.activityClassroomRepository.save(activityClassroom);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const activityClassrooms = await this.activityClassroomRepository.find({
      relations: {
        classroom: true,
        phase: true,
        grade: true,
        schoolShift: true,
      },
    });
    return activityClassrooms;
  }

  async findOne(id: number) {
    return await this.activityClassroomRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateActivityClassroomDto: UpdateActivityClassroomDto,
  ) {
    const classroom = await this.activityClassroomRepository.preload({
      id: id,
      section: updateActivityClassroomDto.section,
      classroom: { id: updateActivityClassroomDto.classroomId },
      grade: { id: updateActivityClassroomDto.gradeId },
      phase: { id: updateActivityClassroomDto.phaseId },
      schoolShift: { id: updateActivityClassroomDto.schoolShiftId },
    });
    if (!classroom)
      throw new NotFoundException(`ActivityClassroom with id: ${id} not found`);
    try {
      await this.activityClassroomRepository.save(classroom);

      return classroom;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    try {
      const classroom = await this.activityClassroomRepository.findOneByOrFail({
        id,
      });
      await this.activityClassroomRepository.remove(classroom);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async searchClassrooms(searchClassroomsDto: SearchClassroomsDto) {
    // let classrooms: ActivityClassroom[];
    const { yearId, phaseId, campusId } = searchClassroomsDto;
    const classrooms = await this.activityClassroomRepository.find({
      where: {
        phase: {
          id: !isNaN(+phaseId) ? +phaseId : undefined,
          year: { id: +yearId },
        },
        classroom: {
          campusDetail: !isNaN(+campusId) ? { id: +campusId } : {},
        },
      },
      relations: {
        classroom: true,
        phase: true,
        grade: true,
        schoolShift: true,
      },
    });
    return classrooms;
  }
}
