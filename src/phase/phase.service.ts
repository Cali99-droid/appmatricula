import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Phase } from './entities/phase.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Year } from 'src/years/entities/year.entity';

@Injectable()
export class PhaseService {
  private readonly logger = new Logger('PhaseService');
  constructor(
    @InjectRepository(Phase)
    private readonly phaseRepository: Repository<Phase>,
  ) {}
  async create(createPhaseDto: CreatePhaseDto) {
    const numberPhases = await this.phaseRepository.count({
      where: { year: { id: createPhaseDto.yearId } },
    });

    if (numberPhases >= 2)
      throw new BadRequestException(
        `the year should only have two phases, you have exceeded the amount`,
      );
    try {
      const phase = this.phaseRepository.create(createPhaseDto);

      phase.year = { id: createPhaseDto.yearId } as Year;
      const phaseCreated = await this.phaseRepository.save(phase);
      const { year, ...values } = phaseCreated;

      return { ...values, yearId: year.id };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  findAll() {
    return `This action returns all phase`;
  }

  findOne(id: number) {
    return `This action returns a #${id} phase`;
  }

  update(id: number, updatePhaseDto: UpdatePhaseDto) {
    return `This action updates a #${updatePhaseDto} phase`;
  }

  remove(id: number) {
    return `This action removes a #${id} phase`;
  }
}
