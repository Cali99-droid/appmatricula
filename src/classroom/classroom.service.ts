import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from './entities/classroom.entity';
import { Repository } from 'typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Grade } from 'src/grade/entities/grade.entity';
import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { SchoolShift } from 'src/school_shifts/entities/school_shift.entity';
import { PhaseToClassroom } from 'src/phase/entities/phaseToClassroom.entity';
import { SearchClassroomsDto } from 'src/common/dto/search-classrooms.dto';

// import { Phase } from 'src/phase/entities/phase.entity';

@Injectable()
export class ClassroomService {
  private readonly logger = new Logger('ClassroomService');
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(PhaseToClassroom)
    private readonly phaseToClassroomRepository: Repository<PhaseToClassroom>,
  ) {}
  async create(createClassroomDto: CreateClassroomDto) {
    const classroom = this.classroomRepository.create(createClassroomDto);
    classroom.grade = { id: createClassroomDto.gradeId } as Grade;
    classroom.schoolShift = {
      id: createClassroomDto.schoolShiftId,
    } as SchoolShift;
    classroom.campusDetail = {
      id: createClassroomDto.campusDetailId,
    } as CampusDetail;

    const existClassroom = await this.classroomRepository.findOne({
      where: classroom,
    });

    if (existClassroom) throw new BadRequestException('clasroom exists');
    try {
      const classroomCreate = await this.classroomRepository.save(classroom);

      return classroomCreate;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const classrooms = await this.classroomRepository.find({});
    return classrooms.map((classroom) => {
      return {
        id: classroom.id,
        capacity: classroom.capacity,
        code: classroom.code,
        section: classroom.section,
        modality: classroom.modality,
        status: classroom.status,
        campusDetailId: classroom.campusDetail.id, // Extraer solo el campusDetailId
        grade: classroom.grade,
        schoolShift: classroom.schoolShift,
        // phase: classroom.phase,
      };
    });
  }

  async findOne(id: number) {
    return await this.classroomRepository.findOneBy({ id });
  }

  async update(id: number, updateClassroomDto: UpdateClassroomDto) {
    const classroom = await this.classroomRepository.preload({
      id: id,
      ...updateClassroomDto,
    });
    if (!classroom)
      throw new NotFoundException(`Classroom with id: ${id} not found`);
    try {
      if (updateClassroomDto.gradeId)
        classroom.grade = { id: updateClassroomDto.gradeId } as Grade;
      if (updateClassroomDto.campusDetailId)
        classroom.campusDetail = {
          id: updateClassroomDto.campusDetailId,
        } as CampusDetail;

      if (updateClassroomDto.schoolShiftId)
        classroom.schoolShift = {
          id: updateClassroomDto.schoolShiftId,
        } as SchoolShift;

      await this.classroomRepository.save(classroom);

      return classroom;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    try {
      const classroom = await this.classroomRepository.findOneByOrFail({ id });
      await this.classroomRepository.remove(classroom);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async searchClassrooms(searchClassroomsDto: SearchClassroomsDto) {
    let classrooms: PhaseToClassroom[];
    const { yearId, phaseId, campusId } = searchClassroomsDto;

    classrooms = await this.phaseToClassroomRepository.find({
      where: {
        phase: {
          year: {
            id: +yearId,
          },
        },
      },
    });
    if (phaseId) {
      classrooms = classrooms.filter((r) => r.phaseId === +phaseId);
    }
    if (campusId) {
      classrooms = classrooms.filter(
        (r) => r.classroom.campusDetail.id === +campusId,
      );
    }

    const classromsFormat = classrooms.map(({ classroom, phase }) => {
      return {
        id: classroom.id,
        capacity: classroom.capacity,
        section: classroom.section,
        campus: classroom.campusDetail.name,
        grade: classroom.grade.name,
        level: classroom.grade.level.name,
        turn: classroom.schoolShift,
        year: phase.year.name,
        phase: phase.type,
        yearId: phase.year.id,
        phaseId: phase.id,
      };
    });
    return classromsFormat;
  }
}
