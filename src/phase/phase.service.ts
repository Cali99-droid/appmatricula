import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
    @InjectRepository(Year)
    private readonly yearRespository: Repository<Year>,
  ) {}
  async create(createPhaseDto: CreatePhaseDto) {
    const numberPhases = await this.phaseRepository.count({
      where: { year: { id: createPhaseDto.yearId } },
    });

    if (numberPhases >= 2)
      throw new BadRequestException(
        `the year should only have two phases, you have exceeded the amount`,
      );

    // const year = await this.yearRespository.findOneBy({
    //   id: createPhaseDto.yearId,
    // });
    // if (
    //   year.startDate < createPhaseDto.startDate ||
    //   year.endDate > createPhaseDto.endDate
    // ) {
    //   throw new BadRequestException(
    //     'La fecha debe estar dentro del rango permitido.',
    //   );
    // }
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
  /**En caso se requiera el año descomentar */
  async findAll() {
    const phases = await this.phaseRepository.find({
      // relations: {
      //   year: true,
      // },
    });
    return phases;
  }

  async findOne(id: number) {
    const phase = await this.phaseRepository.findOneBy({ id });
    if (!phase) throw new NotFoundException(`Phase with id ${id} not found`);
    return phase;
  }

  async update(id: number, updatePhaseDto: UpdatePhaseDto) {
    const phase = await this.phaseRepository.preload({
      id: id,
      ...updatePhaseDto,
    });
    if (!phase) throw new NotFoundException(`Phase with id: ${id} not found`);
    try {
      if (updatePhaseDto.yearId) {
        phase.year = { id: updatePhaseDto.yearId } as Year;
      }

      await this.phaseRepository.save(phase);
      return phase;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const phase = await this.phaseRepository.findOneBy({ id });
    if (!phase) throw new NotFoundException(`Phase with id: ${id} not found`);
    try {
      await this.phaseRepository.remove(phase);
    } catch (error) {
      handleDBExceptions(error, this.logger);
      // console.log(error);
    }
  }
}
