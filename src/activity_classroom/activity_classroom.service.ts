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

import { SearchClassroomsDto } from 'src/common/dto/search-classrooms.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class ActivityClassroomService {
  private readonly logger = new Logger('ActivityClassroomService');
  constructor(
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
    private readonly configService: ConfigService,
  ) {}
  async create(createActivityClassroomDto: CreateActivityClassroomDto) {
    // Combinando las condiciones en un único objeto de consulta
    const exists = await this.activityClassroomRepository.findOne({
      where: [
        {
          classroom: { id: createActivityClassroomDto.classroomId },
          grade: { id: createActivityClassroomDto.gradeId },
          schoolShift: { id: createActivityClassroomDto.schoolShiftId },
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
      order: {
        grade: { name: 'ASC' },
        section: 'ASC',
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
            classroom: { id: updateActivityClassroomDto.classroomId },
            grade: { id: updateActivityClassroomDto.gradeId },
            schoolShift: { id: updateActivityClassroomDto.schoolShiftId },
            phase: { id: updateActivityClassroomDto.phaseId },
          },
        ],
      });
    if (existingActivityClassroom != undefined) {
      if (id != existingActivityClassroom.id) {
        throw new BadRequestException(
          `An ActivityClassroom with already exists.`,
        );
      }
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
      order: {
        grade: { name: 'ASC' },
        section: 'ASC',
      },
    });
    return classrooms;
  }

  async findStudents(id: number) {
    try {
      const urlS3 = this.configService.getOrThrow('AWS_URL_BUCKET');
      const folderName = this.configService.getOrThrow('FOLDER_IMG_NAME');
      const defaultAvatar = this.configService.getOrThrow(
        'AVATAR_NAME_DEFAULT',
      );
      const urlPhoto = `${urlS3}${folderName}`;
      const activityClassroom = await this.activityClassroomRepository.findOne({
        relations: {
          enrollment: {
            student: {
              person: true,
            },
          },
        },
        where: {
          id,
        },
      });
      const formatData = activityClassroom.enrollment.map((e) => ({
        id: e.student.id,
        name: e.student.person.name,
        lastname: e.student.person.lastname,
        mLastname: e.student.person.mLastname,
        docNumber: e.student.person.docNumber,
        studentCode:
          e.student.studentCode === null
            ? e.student.person.studentCode
            : e.student.studentCode,
        photo: e.student.photo
          ? `${urlPhoto}/${e.student.photo}`
          : `${urlPhoto}/${defaultAvatar}`,
        enrollmentId: e.id,
      }));
      return formatData;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
