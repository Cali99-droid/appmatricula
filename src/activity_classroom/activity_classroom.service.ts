import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Equal, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateActivityClassroomDto } from './dto/create-activity_classroom.dto';
import { UpdateActivityClassroomDto } from './dto/update-activity_classroom.dto';
import { ActivityClassroom } from './entities/activity_classroom.entity';

import { SearchClassroomsDto } from 'src/common/dto/search-classrooms.dto';
@Injectable()
export class ActivityClassroomService {
  private readonly logger = new Logger('ActivityClassroomService');
  constructor(
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
  ) {}
  async create(createActivityClassroomDto: CreateActivityClassroomDto) {
    // Combinando las condiciones en un único objeto de consulta
    const exists = await this.activityClassroomRepository.findOne({
      where: [
        {
          section: createActivityClassroomDto.section,
          classroom: { id: createActivityClassroomDto.classroomId },
          phase: { id: createActivityClassroomDto.phaseId },
        },
        {
          schoolShift: { id: createActivityClassroomDto.schoolShiftId },
          classroom: { id: createActivityClassroomDto.classroomId },
          phase: { id: createActivityClassroomDto.phaseId },
        },
      ],
    });

    if (exists) {
      throw new BadRequestException(
        'ActivityClassroom not available, existing section or shift',
      );
    }

    try {
      // Creación directa y guardado de la entidad con relaciones en un paso
      const activityClassroom = this.activityClassroomRepository.create({
        ...createActivityClassroomDto,
        classroom: { id: createActivityClassroomDto.classroomId },
        phase: { id: createActivityClassroomDto.phaseId },
        grade: { id: createActivityClassroomDto.gradeId },
        schoolShift: { id: createActivityClassroomDto.schoolShiftId },
      });

      await this.activityClassroomRepository.save(activityClassroom);
      return activityClassroom;
    } catch (error) {
      // Asumiendo que handleDBExceptions es una función adecuadamente definida
      // para manejar y re-lanzar excepciones específicas de la DB.
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
    try {
      const activityClassroom =
        await this.activityClassroomRepository.findOneByOrFail({ id });
      return activityClassroom;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
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
    //**Validate exist section or turn */
    const existingActivityClassroom =
      await this.activityClassroomRepository.findOne({
        where: [
          {
            section: updateActivityClassroomDto.section,
            classroom: { id: updateActivityClassroomDto.classroomId },
            grade: { id: updateActivityClassroomDto.gradeId },
            id: Not(Equal(id)),
          },
          {
            schoolShift: { id: updateActivityClassroomDto.schoolShiftId },
            classroom: { id: updateActivityClassroomDto.classroomId },
            grade: { id: updateActivityClassroomDto.gradeId },
            id: Not(Equal(id)),
          },
        ],
      });

    if (existingActivityClassroom) {
      console.log(existingActivityClassroom.id);
      throw new BadRequestException(
        `An ActivityClassroom with the section "${updateActivityClassroomDto.section}" and schoolShiftId "${updateActivityClassroomDto.schoolShiftId}" for the gradeId "${updateActivityClassroomDto.gradeId}" already exists.`,
      );
    }
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
      throw new NotFoundException(error.message);
    }
  }
  async searchClassrooms(searchClassroomsDto: SearchClassroomsDto) {
    // let classrooms: ActivityClassroom[];
    const { yearId, phaseId, campusId, levelId } = searchClassroomsDto;
    const classrooms = await this.activityClassroomRepository.find({
      where: {
        phase: {
          id: !isNaN(+phaseId) ? +phaseId : undefined,
          year: { id: !isNaN(+yearId) ? +yearId : undefined },
        },
        classroom: {
          campusDetail: !isNaN(+campusId) ? { id: +campusId } : {},
        },
        grade: {
          level: !isNaN(+levelId) ? { id: +levelId } : {},
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
