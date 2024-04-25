import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { Level } from './entities/level.entity';
@Injectable()
export class LevelService {
  private readonly logger = new Logger('levelService');
  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  async create(createLevelDto: CreateLevelDto) {
    try {
      console.log(createLevelDto);
      const level = this.levelRepository.create(createLevelDto);
      console.log(level);
      const data = await this.levelRepository.save(level);
      console.log(data);

      return level;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }
  async findAll() {
    const levels = await this.levelRepository.find({
      select: {
        id: true,
        modularCode: true,
        name: true,
      },
      order: {
        name: 'ASC',
      },
    });
    return levels;
  }

  async findOne(term: string) {
    const queryBuilder = this.levelRepository.createQueryBuilder('level');
    const level = await queryBuilder
      .where(`name=:name OR level.id=:id`, {
        id: term,
        name: term,
      })
      .orWhere(`level.modularCode  = :modularCode `, { modularCode: term })
      // .leftJoinAndSelect('level.phase', 'levelPhase')
      .getOne();
    if (!level)
      throw new NotFoundException(`Level with term ${term} not found`);

    return level;
  }

  async update(id: number, updateLevelDto: UpdateLevelDto) {
    const level = await this.levelRepository.preload({
      id: id,
      ...updateLevelDto,
    });
    if (!level) throw new NotFoundException(`Level with id: ${id} not found`);
    try {
      await this.levelRepository.save(level);
      return level;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const level = await this.levelRepository.findOneBy({ id });
    if (!level) throw new NotFoundException(`Level by id: '${id}' not found`);
    try {
      await this.levelRepository.remove(level);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async exist(id: number) {
    const existCampus = await this.levelRepository.findOneBy({ id });
    return !!existCampus;
  }
}
