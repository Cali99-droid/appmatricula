import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { Campus } from './entities/campus.entity';

@Injectable()
export class CampusService {
  private readonly logger = new Logger('campussService');
  constructor(
    @InjectRepository(Campus)
    private readonly campussRepository: Repository<Campus>,
  ) {}
  async create(createCampussDto: CreateCampusDto) {
    try {
      const campuss = this.campussRepository.create(createCampussDto);
      await this.campussRepository.save(campuss);
      return campuss;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const campuss = await this.campussRepository.find();
    return campuss;
  }

  async findOne(term: string) {
    const queryBuilder = this.campussRepository.createQueryBuilder('campus');
    const campus = await queryBuilder
      .where(`name=:name or campus.id=:id`, {
        id: term,
        name: term,
      })
      .orWhere(`campus.ugelLocalCode  = :ugelLocalCode `, {
        ugelLocalCode: term,
      })
      // .leftJoinAndSelect('campus.phase', 'campusPhase')
      .getOne();
    if (!campus)
      throw new NotFoundException(`Campus with term ${term} not found`);

    return campus;
  }

  async update(id: number, updateCampussDto: UpdateCampusDto) {
    const campus = await this.campussRepository.preload({
      id: id,
      ...updateCampussDto,
    });
    if (!campus) throw new NotFoundException(`Campus with id: ${id} not found`);
    try {
      await this.campussRepository.save(campus);
      return campus;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} campus`;
  }
}
