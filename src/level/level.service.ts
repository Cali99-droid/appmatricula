import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { Level } from './entities/level.entity';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}
  create(module: CreateLevelDto): Promise<Level> {
    return this.levelRepository.save(module);
  }
  update(id: number, module: UpdateLevelDto): Promise<UpdateResult> {
    return this.levelRepository.update(id, module);
  }
  findAll(where: FindOptionsWhere<Level> = {}): Promise<Level[]> {
    return this.levelRepository.find({ where });
  }
  findOne(where: FindOptionsWhere<Level> = {}): Promise<Level | null> {
    return this.levelRepository.findOne({ where });
  }
  exists(where: FindOptionsWhere<Level> = {}): Promise<boolean> {
    return this.levelRepository.exist({ where });
  }
  delete(id: number) {
    return this.levelRepository.delete(id);
  }
}
