import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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
    private readonly yearRepository: Repository<Year>,
  ) {}
  async create(createPhaseDto: CreatePhaseDto) {
    await this.validatePhase(createPhaseDto);
    try {
      const phase = this.phaseRepository.create({
        ...createPhaseDto,
      });

      phase.year = { id: createPhaseDto.yearId } as Year;

      const phaseCreated = await this.phaseRepository.save(phase);

      return this.transformPhaseResponse(phaseCreated);
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
  async findAllByYear(id: number) {
    const phases = await this.phaseRepository.find({
      where: {
        year: { id: id },
      },
      order: {
        type: 'ASC',
      },
    });
    return phases;
  }
  async findOne(id: number) {
    const phase = await this.phaseRepository.findOne({
      where: {
        id,
      },
    });
    if (!phase) throw new NotFoundException(`Phase with id ${id} not found`);
    return phase;
  }

  async update(id: number, updatePhaseDto: UpdatePhaseDto) {
    const { ...toUpdate } = updatePhaseDto;
    if (updatePhaseDto.yearId) {
      const numberPhases = await this.phaseRepository.count({
        where: { year: { id: updatePhaseDto.yearId } },
      });
      if (numberPhases > 2)
        throw new BadRequestException(
          `The year should only have two phases, you have exceeded the amount.`,
        );
    }

    const year = await this.yearRepository.findOneBy({
      id: updatePhaseDto.yearId,
    });

    if (
      year.startDate >= updatePhaseDto.startDate ||
      year.endDate <= updatePhaseDto.endDate
    )
      throw new BadRequestException(
        `start or end date must be within the year range`,
      );

    const conflictingPhase = await this.validatePhaseDates(
      updatePhaseDto.startDate,
      updatePhaseDto.endDate,
      id,
    );

    if (!conflictingPhase) {
      throw new BadRequestException(
        `The start date cannot be within the range of the other phase`,
      );
    }
    const phase = await this.phaseRepository.preload({
      id: id,
      ...toUpdate,
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
    // if (!phase) throw new NotFoundException(`Phase with id: ${id} not found`);
    try {
      const phase = await this.phaseRepository.findOneByOrFail({ id });
      await this.phaseRepository.remove(phase);
    } catch (error) {
      throw new BadRequestException(error.message);
      // handleDBExceptions(error, this.logger);
      // console.log(error);
    }
  }

  // async findClassroomsByPhase(id: number) {
  //   const phaseToClassrooms = await this.phaseToClassroomRepository.findBy({
  //     phaseId: id,
  //   });
  //   const classrooms = phaseToClassrooms.map(({ classroom }) => {
  //     return {
  //       id: classroom.id,
  //       capacity: classroom.capacity,
  //       section: classroom.section,
  //       campus: classroom.campusDetail.name,
  //       grade: classroom.grade.name,
  //       level: classroom.grade.level.name,
  //       turn: classroom.schoolShift,
  //     };
  //   });
  //   return classrooms;
  // }

  /**Funciones auxiliares validaciones */
  async validatePhase(createPhaseDto: CreatePhaseDto) {
    const validations = await Promise.all([
      this.validateNumberPhases(createPhaseDto),
      this.validatePhaseTypeExists(createPhaseDto),
      this.validateDateWithinYearRange(createPhaseDto),
      this.validateDateNotWithinOtherPhases(createPhaseDto),
    ]);
    // Lanza excepción si alguna validación falla
    const validationErrors = validations.filter((result) => result !== true);
    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors.join(' '));
    }
  }

  async validateNumberPhases(
    createPhaseDto: CreatePhaseDto | UpdatePhaseDto,
  ): Promise<boolean | string> {
    const numberPhases = await this.phaseRepository.count({
      where: { year: { id: createPhaseDto.yearId } },
    });
    return numberPhases >= 2
      ? `The year should only have two phases, you have exceeded the amount.`
      : true;
  }
  async validatePhaseTypeExists(
    createPhaseDto: CreatePhaseDto | UpdatePhaseDto,
  ): Promise<boolean | string> {
    const phaseExist = await this.phaseRepository.findOne({
      where: { year: { id: createPhaseDto.yearId }, type: createPhaseDto.type },
    });

    return phaseExist ? `this type of phase exists` : true;
  }
  async validateDateWithinYearRange(
    createPhaseDto: CreatePhaseDto | UpdatePhaseDto,
  ): Promise<boolean | string> {
    const year = await this.yearRepository.findOneBy({
      id: createPhaseDto.yearId,
    });

    return year.startDate >= createPhaseDto.startDate ||
      year.endDate <= createPhaseDto.endDate
      ? `start or end date must be within the year range`
      : true;
  }
  async validateDateNotWithinOtherPhases(
    createPhaseDto: CreatePhaseDto,
  ): Promise<boolean | string> {
    const conflictingPhase = await this.validatePhaseDates(
      createPhaseDto.startDate,
      createPhaseDto.endDate,
    );
    // console.log(conflictingPhase);
    return !conflictingPhase
      ? `The start date cannot be within the range of the other phase`
      : true;
  }

  transformPhaseResponse(phase: any) {
    const { year, ...values } = phase;
    return { ...values, yearId: year.id };
  }

  async validatePhaseDates(
    startDate: Date,
    endDate: Date,
    id?: number,
  ): Promise<boolean> {
    // Encuentra si existe alguna fase en el mismo año con fechas que se solapen
    if (id) {
      const conflictingPhase = await this.phaseRepository
        .createQueryBuilder('phase')
        .where('phase.id != :id', { id })
        .andWhere(
          new Brackets((qb) => {
            qb.where('phase.startDate BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            })
              .orWhere('phase.endDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
              })
              // También considera casos donde la nueva fase envuelve completamente a una existente
              .orWhere(
                'phase.startDate <= :startDate AND phase.endDate >= :endDate',
                { startDate, endDate },
              );
          }),
        )
        .getOne();

      // Si existe una fase conflictiva, retorna falso
      return !conflictingPhase;
    } else {
      const conflictingPhase = await this.phaseRepository
        .createQueryBuilder('phase')
        .where(
          new Brackets((qb) => {
            qb.where('phase.startDate BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            })
              .orWhere('phase.endDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
              })
              // También considera casos donde la nueva fase envuelve completamente a una existente
              .orWhere(
                'phase.startDate <= :startDate AND phase.endDate >= :endDate',
                { startDate, endDate },
              );
          }),
        )
        .getOne();

      // Si existe una fase conflictiva, retorna falso
      return !conflictingPhase;
    }
  }
}
