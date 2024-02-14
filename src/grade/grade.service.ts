import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grade } from './entities/grade.entity';

@Injectable()
export class GradeService {
  private readonly logger = new Logger('gradeService');
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  async create(createGradeDto: CreateGradeDto) {
    try {
      const newEntry = this.gradeRepository.create({
        name: createGradeDto.name,
        level: { id: createGradeDto.levelId },
      });
      const grade = await this.gradeRepository.save(newEntry);
      return grade;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const grades = await this.gradeRepository.find({
      select: {
        id: true,
        name: true,
      },
      relations: {
        level: true,
      },
    });
    return grades;
  }

  async findOne(id: number) {
    const grade = await this.gradeRepository.findOne({
      where: { id: id },
      relations: { level: true },
    });
    if (!grade) throw new NotFoundException(`Grade with id ${id} not found`);
    return grade;
  }

  async update(id: number, updateGradeDto: UpdateGradeDto) {
    const { levelId, ...rest } = updateGradeDto;
    const grade = await this.gradeRepository.preload({
      id: id,
      level: { id: levelId },
      ...rest,
    });
    if (!grade) throw new NotFoundException(`Grade with id: ${id} not found`);
    try {
      await this.gradeRepository.save(grade);
      return grade;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const grade = await this.gradeRepository.findOneBy({ id });
    if (!grade) throw new NotFoundException(`Grade by id: '${id}' not found`);
    try {
      await this.gradeRepository.remove(grade);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
