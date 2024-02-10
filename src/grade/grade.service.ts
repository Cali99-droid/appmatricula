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
      const grade = this.gradeRepository.create(createGradeDto);
      await this.gradeRepository.save(grade);
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
    });
    return grades;
  }

  async findOne(term: string) {
    const queryBuilder = this.gradeRepository.createQueryBuilder('grade');
    const grade = await queryBuilder
      .where(`name=:name or grade.id=:id`, {
        id: term,
        name: term,
      })
      // .leftJoinAndSelect('grade.phase', 'gradePhase')
      .getOne();
    if (!grade)
      throw new NotFoundException(`Grade with term ${term} not found`);

    return grade;
  }

  async update(id: number, updateGradeDto: UpdateGradeDto) {
    const grade = await this.gradeRepository.preload({
      id: id,
      ...updateGradeDto,
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
