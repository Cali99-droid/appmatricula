import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Phase } from './entities/phase.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Year } from 'src/years/entities/year.entity';

import { PhaseToClassroom } from './entities/phaseToClassroom.entity';

@Injectable()
export class PhaseService {
  private readonly logger = new Logger('PhaseService');
  constructor(
    @InjectRepository(Phase)
    private readonly phaseRepository: Repository<Phase>,
    @InjectRepository(Year)
    private readonly yearRepository: Repository<Year>,
    @InjectRepository(PhaseToClassroom)
    private readonly phaseToClassroomRepository: Repository<PhaseToClassroom>,
    private readonly dataSource: DataSource,
  ) {}
  async create(createPhaseDto: CreatePhaseDto) {
    const numberPhases = await this.phaseRepository.count({
      where: { year: { id: createPhaseDto.yearId } },
    });

    if (numberPhases >= 2)
      throw new BadRequestException(
        `the year should only have two phases, you have exceeded the amount`,
      );

    //validar que solo exista un solo tipo por cada fase
    const phaseExist = await this.phaseRepository.findOne({
      where: { year: { id: createPhaseDto.yearId }, type: createPhaseDto.type },
    });

    if (phaseExist) {
      throw new BadRequestException('this type of phase exists');
    }

    // TODO validar fechas dentro de un rango
    const year = await this.yearRepository.findOneBy({
      id: createPhaseDto.yearId,
    });
    if (
      year.startDate > createPhaseDto.startDate ||
      year.endDate < createPhaseDto.endDate
    ) {
      throw new BadRequestException(
        'start or end date must be within the year range',
      );
    }

    const otherPhase = await this.phaseRepository.findOne({
      where: { year: { id: createPhaseDto.yearId } },
    });
    if (otherPhase) {
      console.log(otherPhase);
      if (
        otherPhase.startDate < createPhaseDto.startDate &&
        otherPhase.endDate > createPhaseDto.startDate
      ) {
        throw new BadRequestException(
          'The start date cannot be within the range of the other phase',
        );
      }
    }
    try {
      const { classrooms = [], ...phaseDetails } = createPhaseDto;

      // const phase = this.phaseRepository.create(createPhaseDto);
      const phase = this.phaseRepository.create({
        ...phaseDetails,
      });

      phase.year = { id: createPhaseDto.yearId } as Year;

      const phaseCreated = await this.phaseRepository.save(phase);

      const phaseToClassroomPromises = classrooms.map(async (classroomId) => {
        const phaseToClassroom = this.phaseToClassroomRepository.create({
          phaseId: phase.id,
          classroomId,
        });
        await this.phaseToClassroomRepository.save(phaseToClassroom);
      });

      // Esperamos a que todas las promesas de guardar en PhaseToClassroom se resuelvan.
      await Promise.all(phaseToClassroomPromises);
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
      relations: {
        phaseToClassroom: {
          classroom: {
            grade: {
              level: true,
            },
          },
        },
      },
    });
    if (!phase) throw new NotFoundException(`Phase with id ${id} not found`);
    const { phaseToClassroom = [], ...phaseDetails } = phase;
    const classrooms = phaseToClassroom.map(({ classroom }) => {
      return {
        id: classroom.id,
        capacity: classroom.capacity,
        section: classroom.section,
        campus: classroom.campusDetail.name,
        grade: classroom.grade.name,
        level: classroom.grade.level.name,
        turn: classroom.schoolShift,
      };
    });
    return { ...phaseDetails, classrooms };
  }

  async update(id: number, updatePhaseDto: UpdatePhaseDto) {
    const { classrooms, ...toUpdate } = updatePhaseDto;

    const phase = await this.phaseRepository.preload({
      id: id,
      ...toUpdate,
    });
    if (!phase) throw new NotFoundException(`Phase with id: ${id} not found`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (updatePhaseDto.yearId) {
        phase.year = { id: updatePhaseDto.yearId } as Year;
      }
      if (classrooms) {
        // Elimina las relaciones existentes para evitar duplicados
        await queryRunner.manager.delete(PhaseToClassroom, { phaseId: id });

        // Crea y guarda las nuevas relaciones
        const phaseToClassrooms = classrooms.map((classroomId) =>
          queryRunner.manager.create(PhaseToClassroom, {
            phaseId: id,
            classroomId,
          }),
        );
        await queryRunner.manager.save(phaseToClassrooms);
      }

      await queryRunner.manager.save(phase);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return phase;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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

  async findClassroomsByPhase(id: number) {
    const phaseToClassrooms = await this.phaseToClassroomRepository.findBy({
      phaseId: id,
    });
    const classrooms = phaseToClassrooms.map(({ classroom }) => {
      return {
        id: classroom.id,
        capacity: classroom.capacity,
        section: classroom.section,
        campus: classroom.campusDetail.name,
        grade: classroom.grade.name,
        level: classroom.grade.level.name,
        turn: classroom.schoolShift,
      };
    });
    return classrooms;
  }
}
