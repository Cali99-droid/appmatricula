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
import { FindCronogramasDto } from './dto/find-schedule.dto';

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

      return await this.enrollmentScheduleRepository.save(data);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(query: FindCronogramasDto) {
    try {
      const { startDate, endDate, type, currentDate, name } = query;
      let qb =
        this.enrollmentScheduleRepository.createQueryBuilder('cronograma');

      if (startDate && endDate) {
        qb = qb.where(
          'cronograma.startDate >= :startDate AND cronograma.endDate <= :endDate',
          { startDate, endDate },
        );
      }

      if (type) {
        qb = qb.andWhere('cronograma.type = :tipo', { type });
      }

      if (currentDate) {
        qb = qb.andWhere(
          'cronograma.startDate <= :currentDate AND cronograma.endDate >= :currentDate',
          { currentDate },
        );
      }

      if (name) {
        qb = qb.andWhere('LOWER(cronograma.name) LIKE :nombre', {
          nombre: `%${name.toLowerCase()}%`,
        });
      }

      return qb.getMany();
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
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
