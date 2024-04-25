import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateYearDto } from './dto/create-year.dto';
import { UpdateYearDto } from './dto/update-year.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Year } from './entities/year.entity';
import { handleDBExceptions } from '../common/helpers/handleDBException';

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
      return await this.yearRepository.save(year);
      // return year;
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
    });

    return years;
  }
  // TODO revisar utilidad
  async findAllByYear(id: number) {
    const years = await this.yearRepository.find({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
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
      .addOrderBy('year.id', 'DESC')
      .getOne();
    if (!year) throw new NotFoundException(`Year with term ${term} not found`);

    return [year];
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
    // if (!year) throw new NotFoundException(`Year by id: '${id}' not found`);
    try {
      const year = await this.yearRepository.findOneByOrFail({ id });
      await this.yearRepository.remove(year);
    } catch (error) {
      // handleDBExceptions(error, this.logger);
      // this.logger.error(error);
      throw new BadRequestException(error.message);
    }

    // return `This action removes a #${id} year`;
  }
  async exist(id: number) {
    const existCampus = await this.yearRepository.findOneBy({ id });
    return !!existCampus;
  }
}
