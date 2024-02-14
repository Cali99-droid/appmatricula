import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from './entities/classroom.entity';
import { Repository } from 'typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Grade } from 'src/grade/entities/grade.entity';
import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';

@Injectable()
export class ClassroomService {
  private readonly logger = new Logger('ClassroomService');
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
  ) {}
  async create(createClassroomDto: CreateClassroomDto) {
    const classroom = this.classroomRepository.create(createClassroomDto);
    classroom.grade = { id: createClassroomDto.gradeId } as Grade;
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

  findAll() {
    return this.classroomRepository.find({});
  }

  findOne(id: number) {
    return this.classroomRepository.findBy({ id });
  }

  update(id: number, updateClassroomDto: UpdateClassroomDto) {
    return `This action updates a #${updateClassroomDto} classroom`;
  }

  remove(id: number) {
    return `This action removes a #${id} classroom`;
  }
}
