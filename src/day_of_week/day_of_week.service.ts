import {
  // BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateDayOfWeekDto } from './dto/create-day_of_week.dto';
import { UpdateDayOfWeekDto } from './dto/update-day_of_week.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DayOfWeek } from './entities/day_of_week.entity';
import { Repository } from 'typeorm';
import { Year } from 'src/years/entities/year.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';

@Injectable()
export class DayOfWeekService {
  private readonly logger = new Logger('dayOfWeekService');
  constructor(
    @InjectRepository(DayOfWeek)
    private readonly dayOfWeekRepository: Repository<DayOfWeek>,
  ) {}
  async create(createDayOfWeekDto: CreateDayOfWeekDto) {
    try {
      // const validate = await this.dayOfWeekRepository.findOne({
      //   where: {
      //     name: createDayOfWeekDto.name,
      //     year: {
      //       id: createDayOfWeekDto.yearId,
      //     },
      //   },
      // });
      // if (validate) {
      //   throw new BadRequestException(`Already exists with the same name and year`);
      // }

      const dayOfWeek = this.dayOfWeekRepository.create(createDayOfWeekDto);
      dayOfWeek.year = { id: createDayOfWeekDto.yearId } as Year;
      await this.dayOfWeekRepository.save(dayOfWeek);
      return dayOfWeek;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(yearId: number) {
    const dayOfWeeks = await this.dayOfWeekRepository.find({
      where: {
        year: { id: !isNaN(+yearId) ? +yearId : undefined },
      },
    });

    return dayOfWeeks;
  }
  async findOne(id: number) {
    const dayOfWeek = await this.dayOfWeekRepository.findOne({
      where: { id: id },
    });
    if (!dayOfWeek)
      throw new NotFoundException(`DayOfWeek with id ${id} not found`);
    return dayOfWeek;
  }

  async update(id: number, updateDayOfWeekDto: UpdateDayOfWeekDto) {
    const dayOfWeek = await this.dayOfWeekRepository.preload({
      id: id,
      ...updateDayOfWeekDto,
    });
    if (!dayOfWeek)
      throw new NotFoundException(`DayOfWeek with id: ${id} not found`);
    try {
      await this.dayOfWeekRepository.save(dayOfWeek);
      return dayOfWeek;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const dayOfWeek = await this.dayOfWeekRepository.findOneBy({ id });
    if (!dayOfWeek)
      throw new NotFoundException(`DayOfWeek by id: '${id}' not found`);
    try {
      await this.dayOfWeekRepository.remove(dayOfWeek);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
