import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnrollmentScheduleDto } from './dto/create-enrollment_schedule.dto';
import { UpdateEnrollmentScheduleDto } from './dto/update-enrollment_schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentSchedule } from './entities/enrollment_schedule.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Year } from 'src/years/entities/year.entity';

@Injectable()
export class EnrollmentScheduleService {
  private readonly logger = new Logger('EnrollmentScheduleService');
  constructor(
    @InjectRepository(EnrollmentSchedule)
    private readonly enrollmentScheduleRepository: Repository<EnrollmentSchedule>,
  ) {}
  async create(createEnrollmentScheduleDto: CreateEnrollmentScheduleDto) {
    try {
      const data = this.enrollmentScheduleRepository.create(
        createEnrollmentScheduleDto,
      );
      data.year = { id: createEnrollmentScheduleDto.yearId } as Year;
      return await this.enrollmentScheduleRepository.save(data);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(id: number) {
    if (isNaN(+id) || id == 0) {
      throw new BadRequestException(`The year id is not valid`);
    }
    const phases = await this.enrollmentScheduleRepository.find({
      where: {
        year: { id: id },
      },
      order: {
        startDate: 'ASC',
      },
    });
    return phases;
  }

  async findOne(id: number) {
    try {
      const role = await this.enrollmentScheduleRepository.findOne({
        where: { id },
      });
      return role;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async update(
    id: number,
    updateEnrollmentScheduleDto: UpdateEnrollmentScheduleDto,
  ) {
    const data = await this.enrollmentScheduleRepository.preload({
      id: id,
      ...updateEnrollmentScheduleDto,
    });
    if (!data)
      throw new NotFoundException(
        `Enrollment Shedule with id: ${id} not found`,
      );
    try {
      data.year = { id: updateEnrollmentScheduleDto.yearId } as Year;
      await this.enrollmentScheduleRepository.save(data);
      return data;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    try {
      const year = await this.enrollmentScheduleRepository.findOneByOrFail({
        id,
      });
      await this.enrollmentScheduleRepository.remove(year);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
