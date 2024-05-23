import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateBimesterDto } from './dto/create-bimester.dto';
import { UpdateBimesterDto } from './dto/update-bimester.dto';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Bimester } from './entities/bimester.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Phase } from 'src/phase/entities/phase.entity';

@Injectable()
export class BimesterService {
  private readonly logger = new Logger('PhaseService');
  constructor(
    @InjectRepository(Bimester)
    private readonly bimesterRepository: Repository<Bimester>,
    @InjectRepository(Phase)
    private readonly phaseRepository: Repository<Phase>,
  ) {}
  async create(createBimesterDto: CreateBimesterDto) {
    await this.validateBimester(createBimesterDto);
    try {
      const phase = this.bimesterRepository.create({
        ...createBimesterDto,
      });
      phase.phase = { id: createBimesterDto.phaseId } as Phase;
      const bimesterCreated = await this.bimesterRepository.save(phase);
      return this.transformBimesterResponse(bimesterCreated);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(yearId: number) {
    const bimesters = await this.bimesterRepository.find({
      where: {
        phase: {
          year: { id: !isNaN(+yearId) ? +yearId : undefined },
        },
      },
    });

    return bimesters;
  }

  async findOne(id: number) {
    const bimester = await this.bimesterRepository.findOne({
      where: { id: id },
    });
    if (!bimester)
      throw new NotFoundException(`Bimester with id ${id} not found`);
    return bimester;
  }

  async update(id: number, updateBimesterDto: UpdateBimesterDto) {
    const { ...rest } = updateBimesterDto;
    await this.validateDateWithinPhaseRange(rest);
    await this.validateDateNotWithinOtherBimesterUpdate(rest, id);
    try {
      const phase = await this.bimesterRepository.preload({
        id: id,
        ...rest,
      });
      phase.phase = { id: rest.phaseId } as Phase;
      const bimesterCreated = await this.bimesterRepository.save(phase);
      return this.transformBimesterResponse(bimesterCreated);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    try {
      const bimester = await this.bimesterRepository.findOneByOrFail({ id });
      await this.bimesterRepository.remove(bimester);
    } catch (error) {
      throw new NotFoundException(error.message);
      // handleDBExceptions(error, this.logger);
      // console.log(error);
    }
  }
  async validateBimester(
    createBimesterDto: CreateBimesterDto | UpdateBimesterDto,
  ) {
    const validations = await Promise.all([
      this.validateDateWithinPhaseRange(createBimesterDto),
      this.validateDateNotWithinOtherBimester(createBimesterDto),
    ]);
    // Lanza excepción si alguna validación falla
    const validationErrors = validations.filter((result) => result !== true);
    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors.join(' and '));
    }
  }
  async validateDateWithinPhaseRange(
    createBimesterDto: CreateBimesterDto | UpdateBimesterDto,
  ): Promise<boolean | string> {
    const phase = await this.phaseRepository.findOneBy({
      id: createBimesterDto.phaseId,
    });

    return phase.startDate > createBimesterDto.startDate ||
      phase.endDate < createBimesterDto.endDate
      ? `Start or end date must be within the phase range`
      : true;
  }
  async validateDateNotWithinOtherBimester(
    createBimesterDto: CreateBimesterDto | UpdateBimesterDto,
  ): Promise<boolean | string> {
    const conflictingBimester = await this.validateBimesterDates(
      createBimesterDto.startDate,
      createBimesterDto.endDate,
    );
    return !conflictingBimester
      ? `The start date cannot be within the range of the other bimester`
      : true;
  }
  async validateDateNotWithinOtherBimesterUpdate(
    updateBimesterDto: UpdateBimesterDto,
    id: number,
  ): Promise<boolean | string> {
    const conflictingBimester = await this.validateBimesterDates(
      updateBimesterDto.startDate,
      updateBimesterDto.endDate,
      id,
    );
    return !conflictingBimester
      ? `The start date cannot be within the range of the other bimester`
      : true;
  }
  async validateBimesterDates(
    startDate: Date,
    endDate: Date,
    id?: number,
  ): Promise<boolean> {
    // Encuentra si existe alguna fase en el mismo año con fechas que se solapen

    if (id) {
      const conflictingBimester = await this.bimesterRepository
        .createQueryBuilder('bimester')
        .where('bimester.id != :id', { id })
        .andWhere(
          new Brackets((qb) => {
            qb.where('bimester.startDate BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            })
              .orWhere('bimester.endDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
              })
              // También considera casos donde el nuevo bimestre envuelve completamente a una existente
              .orWhere(
                'bimester.startDate <= :startDate AND bimester.endDate >= :endDate',
                { startDate, endDate },
              );
          }),
        )
        .getOne();

      // Si existe una fase conflictiva, retorna falso
      return !conflictingBimester;
    } else {
      const conflictingBimester = await this.bimesterRepository
        .createQueryBuilder('bimester')
        .where(
          new Brackets((qb) => {
            qb.where('bimester.startDate BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            })
              .orWhere('bimester.endDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
              })
              // También considera casos donde el nuevo bimestre envuelve completamente a una existente
              .orWhere(
                'bimester.startDate <= :startDate AND bimester.endDate >= :endDate',
                { startDate, endDate },
              );
          }),
        )
        .getOne();

      // Si existe una fase conflictiva, retorna falso
      return !conflictingBimester;
    }
  }
  transformBimesterResponse(bimester: any) {
    const { phase, ...values } = bimester;
    return { ...values, phaseId: phase.id };
  }
}
