import { Repository, Not } from 'typeorm';
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    const areaExistsOrder = await this.areaRepository.findOneBy({
      name: createAreaDto.name,
      order: createAreaDto.order,
      level: { id: createAreaDto.levelId },
    });
    if (areaExistsOrder) {
      throw new NotFoundException(
        `Order with name ${createAreaDto.levelId} already exists`,
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

  async findAll(levelId: number, activityClassRoomId?: number) {
    const areas = await this.areaRepository.find({
      where: {
        level: { id: levelId },
        course: {
          activityClassroom: {
            id: isNaN(activityClassRoomId) ? undefined : activityClassRoomId,
          },
        },
        status: true,
      },
      relations: {
        competency: true,
        course: true,
      },
      order: {
        order: 'ASC',
      },
    });

    // Agrupa y transforma las áreas
    const grouped = areas.map((area) => {
      // Ordena las competencias por orden y luego por nombre
      const sortedCompetencies = area.competency.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
      });

      return {
        id: area.id,
        name: area.name,
        order: area.order,
        level: area.level,
        totalCompetencies: sortedCompetencies.length,
        totalCourses: area.course.length,
        competencies: sortedCompetencies,
        courses: area.course,
      };
    });

    return grouped;
  }

  async findOne(id: number) {
    const area = await this.areaRepository.findOne({
      where: { id: id },
      relations: {
        competency: true,
        course: true,
      },
      order: {
        competency: {
          order: 'ASC',
        },
      },
    });
    if (!area) throw new NotFoundException(`Area with id ${id} not found`);
    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    const { levelId, ...rest } = updateAreaDto;
    const existCompetency = await this.areaRepository.findOne({
      where: {
        id: Not(id),
        order: updateAreaDto.order,
        level: { id: updateAreaDto.levelId },
      },
    });

    if (existCompetency) {
      throw new BadRequestException(
        `Level with order ${updateAreaDto.order} already exists in the specified area.`,
      );
    }
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
