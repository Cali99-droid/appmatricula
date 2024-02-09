import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grade } from './entities/grade.entity';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}
  create(module: CreateGradeDto): Promise<Grade> {
    return this.gradeRepository.save(module);
  }
  update(id: number, module: UpdateGradeDto): Promise<UpdateResult> {
    return this.gradeRepository.update(id, module);
  }
  findAll(where: FindOptionsWhere<Grade> = {}): Promise<Grade[]> {
    return this.gradeRepository.find({ where });
  }
  findOne(where: FindOptionsWhere<Grade> = {}): Promise<Grade | null> {
    return this.gradeRepository.findOne({ where });
  }
  exists(where: FindOptionsWhere<Grade> = {}): Promise<boolean> {
    return this.gradeRepository.exist({ where });
  }
  delete(id: number) {
    return this.gradeRepository.delete(id);
  }
}
