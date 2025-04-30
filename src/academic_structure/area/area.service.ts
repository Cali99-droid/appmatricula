import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Area } from './entities/area.entity';

@Injectable()
export class AreaService {
  private readonly logger = new Logger('areaService');
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async create(createAreaDto: CreateAreaDto) {
    if (createAreaDto.order < 1)
      throw new NotFoundException(`Order must be greater than 0`);
    const areaExists = await this.areaRepository.findOneBy({
      name: createAreaDto.name,
      level: { id: createAreaDto.levelId },
    });
    if (areaExists) {
      throw new NotFoundException(
        `Area with name ${createAreaDto.name} already exists`,
      );
    }
    try {
      const newEntry = this.areaRepository.create({
        name: createAreaDto.name,
        level: { id: createAreaDto.levelId },
        order: createAreaDto.order,
        status: true,
      });
      const area = await this.areaRepository.save(newEntry);
      return area;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(levelId: number) {
    let areas;
    if (levelId) {
      areas = await this.areaRepository.find({
        where: {
          level: { id: levelId },
        },
        order: {
          order: 'ASC',
        },
        relations: {
          competency: true,
          course: true,
        },
      });
    } else {
      areas = await this.areaRepository.find({
        order: {
          order: 'ASC',
        },
        relations: {
          competency: true,
          course: true,
        },
      });
    }

    return areas;
  }

  async findOne(id: number) {
    const area = await this.areaRepository.findOne({
      where: { id: id },
      relations: {
        competency: true,
        course: true,
      },
    });
    if (!area) throw new NotFoundException(`Area with id ${id} not found`);
    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    const { levelId, ...rest } = updateAreaDto;
    const area = await this.areaRepository.preload({
      id: id,
      level: { id: levelId },
      ...rest,
    });
    if (!area) throw new NotFoundException(`Area with id: ${id} not found`);
    try {
      await this.areaRepository.save(area);
      return area;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const area = await this.areaRepository.findOneBy({ id });
    if (!area) throw new NotFoundException(`Area by id: '${id}' not found`);
    try {
      await this.areaRepository.remove(area);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
