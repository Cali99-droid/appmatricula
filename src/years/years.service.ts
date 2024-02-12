import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateYearDto } from './dto/create-year.dto';
import { UpdateYearDto } from './dto/update-year.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Year } from './entities/year.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';

@Injectable()
export class YearsService {
  private readonly logger = new Logger('YearsService');
  constructor(
    @InjectRepository(Year)
    private readonly yearRepository: Repository<Year>,
  ) {}

  async create(createYearDto: CreateYearDto) {
    try {
      const year = this.yearRepository.create(createYearDto);
      await this.yearRepository.save(year);
      return year;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const years = await this.yearRepository.find({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
      // relations: {
      //   phase: true,
      // },
    });

    return years;
  }

  async findOne(term: string) {
    // const year = await this.yearRepository.findOneBy({
    //   name: term,
    // });
    // let year: Year;
    const queryBuilder = this.yearRepository.createQueryBuilder('year');
    const year = await queryBuilder
      .where(`name=:name or year.id=:id`, {
        id: term,
        name: term,
      })
      .leftJoinAndSelect('year.phase', 'yearPhase')
      .getOne();
    if (!year) throw new NotFoundException(`Year with term ${term} not found`);

    return year;
  }

  async update(id: number, updateYearDto: UpdateYearDto) {
    const year = await this.yearRepository.preload({
      id: id,
      ...updateYearDto,
    });
    if (!year) throw new NotFoundException(`Year with id: ${id} not found`);
    try {
      await this.yearRepository.save(year);
      return year;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const year = await this.yearRepository.findOneBy({ id });
    if (!year) throw new NotFoundException(`Year by id: '${id}' not found`);
    try {
      await this.yearRepository.remove(year);
    } catch (error) {
      handleDBExceptions(error, this.logger);
      // console.log(error);
    }

    // return `This action removes a #${id} year`;
  }
  async exist(id: number) {
    const existCampus = await this.yearRepository.findOneBy({ id });
    return !!existCampus;
  }
}
