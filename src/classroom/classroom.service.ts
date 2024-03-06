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
import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { SearchClassroomsDto } from './dto/search-classrooms.dto';

// import { Phase } from 'src/phase/entities/phase.entity';

@Injectable()
export class ClassroomService {
  private readonly logger = new Logger('ClassroomService');
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
  ) {}
  async create(createClassroomDto: CreateClassroomDto) {
    const classroom = this.classroomRepository.create(createClassroomDto);
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
        modality: classroom.modality,
        status: classroom.status,
        campusDetailId: classroom.campusDetail.id, // Extraer solo el campusDetailId
        // phase: classroom.phase,
      };
    });
  }

  async findOne(id: number) {
    try {
      const classroom = await this.classroomRepository.findOneByOrFail({ id });
      return classroom;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async update(id: number, updateClassroomDto: UpdateClassroomDto) {
    const classroom = await this.classroomRepository.preload({
      id: id,
      ...updateClassroomDto,
    });
    if (!classroom)
      throw new NotFoundException(`Classroom with id: ${id} not found`);
    try {
      if (updateClassroomDto.campusDetailId)
        classroom.campusDetail = {
          id: updateClassroomDto.campusDetailId,
        } as CampusDetail;
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
    // let classrooms: ActivityClassroom[];
    const { campusId } = searchClassroomsDto;
    const classrooms = await this.classroomRepository.find({
      where: {
        campusDetail: !isNaN(+campusId) ? { id: +campusId } : {},
      },
    });
    return classrooms;
  }
}
