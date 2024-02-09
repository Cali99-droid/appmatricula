import { Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCampusXLevelGradeDto } from './dto/create-campus_x_level_grade.dto';
import { UpdateCampusXLevelGradeDto } from './dto/update-campus_x_level_grade.dto';
import { CampusXLevelGrade } from './entities/campus_x_level_grade.entity';
import { Campus } from 'src/campus/entities/campus.entity';
import { Level } from 'src/level/entities/level.entity';
import { Grade } from 'src/grade/entities/grade.entity';

@Injectable()
export class CampusXLevelGradeService {
  private readonly logger = new Logger('CampusXLevelGradeService');
  constructor(
    @InjectRepository(CampusXLevelGrade)
    private readonly campusXLevelGradeRepository: Repository<CampusXLevelGrade>,
  ) {}
  async create(createCampusXLevelGradeDto: CreateCampusXLevelGradeDto) {
    const numberPhases = await this.campusXLevelGradeRepository.exists({
      where: {
        campus: { id: createCampusXLevelGradeDto.campusId },
        level: { id: createCampusXLevelGradeDto.levelId },
        grade: { id: createCampusXLevelGradeDto.gradeId },
      },
    });

    if (numberPhases)
      throw new BadRequestException(
        `There is already a location(campus) with the same level and grade`,
      );
    try {
      const data = this.campusXLevelGradeRepository.create(
        createCampusXLevelGradeDto
      );

      data.campus = { id: createCampusXLevelGradeDto.campusId } as Campus;
      data.level = { id: createCampusXLevelGradeDto.levelId } as Level;
      data.grade = { id: createCampusXLevelGradeDto.gradeId } as Grade;
      const dataCreated = await this.campusXLevelGradeRepository.save(data);
      const { ...values } = dataCreated;

      return { ...values };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  findAll() {
    return `This action returns all campusXLevelGrade`;
  }

  findOne(id: number) {
    return `This action returns a #${id} campusXLevelGrade`;
  }

  update(id: number, updateCampusXLevelGradeDto: UpdateCampusXLevelGradeDto) {
    return `This action updates a #${id} campusXLevelGrade`;
  }

  remove(id: number) {
    return `This action removes a #${id} campusXLevelGrade`;
  }
}
