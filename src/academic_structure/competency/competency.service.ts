import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { Competency } from './entities/competency.entity';

@Injectable()
export class CompetencyService {
  private readonly logger = new Logger('competencyService');
  constructor(
    @InjectRepository(Competency)
    private readonly competencyRepository: Repository<Competency>,
  ) {}

  async create(createCompetencyDto: CreateCompetencyDto) {
    try {
      const newEntry = this.competencyRepository.create({
        name: createCompetencyDto.name,
        course: { id: createCompetencyDto.courseId },
        status: true,
      });
      const competency = await this.competencyRepository.save(newEntry);
      return competency;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(courseId?: number) {
    const competencys = await this.competencyRepository.find({
      where: { course: { id: isNaN(courseId) ? undefined : courseId } },
      relations: { course: true },
      order: {
        name: 'ASC',
      },
    });
    return competencys;
  }

  async findOne(id: number) {
    const competency = await this.competencyRepository.findOne({
      where: { id: id },
    });
    if (!competency)
      throw new NotFoundException(`Competency with id ${id} not found`);
    return competency;
  }

  async update(id: number, updateCompetencyDto: UpdateCompetencyDto) {
    const { courseId, ...rest } = updateCompetencyDto;
    const competency = await this.competencyRepository.preload({
      id: id,
      course: { id: courseId },
      ...rest,
    });
    if (!competency)
      throw new NotFoundException(`Competency with id: ${id} not found`);
    try {
      await this.competencyRepository.save(competency);
      return competency;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const competency = await this.competencyRepository.findOneBy({ id });
    if (!competency)
      throw new NotFoundException(`Competency by id: '${id}' not found`);
    try {
      await this.competencyRepository.remove(competency);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
