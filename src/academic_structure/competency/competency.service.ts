import { Not, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { Competency } from './entities/competency.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CompetencyService {
  private readonly logger = new Logger('competencyService');
  constructor(
    @InjectRepository(Competency)
    private readonly competencyRepository: Repository<Competency>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCompetencyDto: CreateCompetencyDto) {
    if (createCompetencyDto.order < 1)
      throw new NotFoundException(`Order must be greater than 0`);
    const existCompetency = await this.competencyRepository.findOneBy({
      order: createCompetencyDto.order,
      area: { id: createCompetencyDto.areaId },
    });
    if (existCompetency) {
      throw new BadRequestException(
        `Competency with order ${createCompetencyDto.order} already exists`,
      );
    }
    try {
      const newEntry = this.competencyRepository.create({
        name: createCompetencyDto.name,
        area: { id: createCompetencyDto.areaId },
        order: createCompetencyDto.order,
        status: true,
      });
      const competency = await this.competencyRepository.save(newEntry);
      return competency;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(courseId?: number, areaId?: number) {
    const where: any = {};

    if (!isNaN(areaId)) {
      where.area = { id: areaId };
    }

    if (!isNaN(courseId)) {
      where.curso = { id: courseId };
    }

    const competencys = await this.competencyRepository.find({
      where,
      // relations: {
      //   course: true,
      // },
      order: {
        order: 'ASC',
      },
    });

    return competencys;
  }

  async findOne(id: number) {
    const competency = await this.competencyRepository.findOne({
      where: { id: id },
      // relations: {
      //   course: true,
      // },
    });
    if (!competency)
      throw new NotFoundException(`Competency with id ${id} not found`);
    return competency;
  }

  async update(id: number, updateCompetencyDto: UpdateCompetencyDto) {
    const { areaId, ...rest } = updateCompetencyDto;
    const existCompetency = await this.competencyRepository.findOne({
      where: {
        id: Not(id),
        order: updateCompetencyDto.order,
        area: { id: updateCompetencyDto.areaId },
      },
    });

    if (existCompetency) {
      throw new BadRequestException(
        `Competency with order ${updateCompetencyDto.order} already exists in the specified area.`,
      );
    }
    const competency = await this.competencyRepository.preload({
      id: id,
      area: { id: areaId },
      ...rest,
    });
    if (!competency)
      throw new NotFoundException(`Competency with id: ${id} not found`);
    try {
      await this.competencyRepository.save(competency);
      return competency;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const competency = await this.competencyRepository.findOneBy({ id });
    if (!competency)
      throw new NotFoundException(`Competency by id: '${id}' not found`);
    try {
      await this.competencyRepository.remove(competency);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

}
