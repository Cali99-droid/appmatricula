import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';
import { Repository } from 'typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Year } from 'src/years/entities/year.entity';

@Injectable()
export class HolidayService {
  private readonly logger = new Logger('holidayService');
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
    @InjectRepository(Year)
    private readonly yearRepository: Repository<Year>,
  ) {}
  async create(createHolidayDto: CreateHolidayDto) {
    const holiday = this.holidayRepository.create(createHolidayDto);

    holiday.year = { id: createHolidayDto.yearId } as Year;
    const year = await this.yearRepository.findOne({
      where: { id: createHolidayDto.yearId },
    });

    if (
      createHolidayDto.date < year.startDate ||
      createHolidayDto.date > year.endDate
    ) {
      throw new BadRequestException(`date must be within the year range`);
    }
    try {
      await this.holidayRepository.save(holiday);
      return holiday;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async findAll(yearId: number) {
    const holidays = await this.holidayRepository.find({
      where: {
        year: { id: !isNaN(+yearId) ? +yearId : undefined },
      },
    });

    return holidays;
  }

  async findOne(id: number) {
    const holiday = await this.holidayRepository.findOne({
      where: { id: id },
    });
    if (!holiday)
      throw new NotFoundException(`Holiday with id ${id} not found`);
    return holiday;
  }

  async update(id: number, updateHolidayDto: UpdateHolidayDto) {
    const holiday = await this.holidayRepository.preload({
      id: id,
      ...updateHolidayDto,
    });
    if (!holiday)
      throw new NotFoundException(`Holiday with id: ${id} not found`);
    try {
      await this.holidayRepository.save(holiday);
      return holiday;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const holiday = await this.holidayRepository.findOneBy({ id });
    if (!holiday)
      throw new NotFoundException(`Holiday by id: '${id}' not found`);
    try {
      await this.holidayRepository.remove(holiday);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
