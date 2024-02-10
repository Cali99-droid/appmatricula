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

@Injectable()
export class CampusXLevelGradeService {
  private readonly logger = new Logger('CampusXLevelGradeService');
  constructor(
    @InjectRepository(CampusXLevelGrade)
    private readonly campusXLevelGradeRepository: Repository<CampusXLevelGrade>,
  ) {}

  async create(createCampusXLevelGradeDto: CreateCampusXLevelGradeDto) {
    try {
      const numbercampusXLevelGrades =
        await this.campusXLevelGradeRepository.exists({
          where: {
            campus: { id: createCampusXLevelGradeDto.campusId },
            level: { id: createCampusXLevelGradeDto.levelId },
            grade: { id: createCampusXLevelGradeDto.gradeId },
          },
        });

      if (numbercampusXLevelGrades)
        throw new BadRequestException(
          `There is already a location(campus) with the same level and grade`,
        );

      const newEntry = this.campusXLevelGradeRepository.create({
        campus: { id: createCampusXLevelGradeDto.campusId },
        level: { id: createCampusXLevelGradeDto.levelId },
        grade: { id: createCampusXLevelGradeDto.gradeId },
      });

      const createEntry = await this.campusXLevelGradeRepository.save(newEntry);

      return createEntry;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const campusXLevelGrades = await this.campusXLevelGradeRepository.find({
      relations: {
        campus: true,
        level: true,
        grade: true,
      },
    });
    return campusXLevelGrades;
  }

  async findOne(id: number) {
    const campusXLevelGrade = await this.campusXLevelGradeRepository.findOneBy({
      id,
    });
    if (!campusXLevelGrade)
      throw new NotFoundException(
        `CampusXLevelGradeRepository with id ${id} not found`,
      );
    return campusXLevelGrade;
  }

  async update(
    id: number,
    updateCampusXLevelGradeDto: UpdateCampusXLevelGradeDto,
  ) {
    const campusXLevelGrade = await this.campusXLevelGradeRepository.preload({
      id: id,
      ...updateCampusXLevelGradeDto,
    });
    if (!campusXLevelGrade)
      throw new NotFoundException(`CampusXLevelGrade with id: ${id} not found`);
    try {
      await this.campusXLevelGradeRepository.save(campusXLevelGrade);
      return campusXLevelGrade;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const campusXLevelGrade = await this.campusXLevelGradeRepository.findOneBy({
      id,
    });
    console.log(campusXLevelGrade);
    if (!campusXLevelGrade)
      throw new NotFoundException(`CampusXLevelGrade with id: ${id} not found`);
    try {
      await this.campusXLevelGradeRepository.remove(campusXLevelGrade);
    } catch (error) {
      handleDBExceptions(error, this.logger);
      // console.log(error);
    }
  }
}
