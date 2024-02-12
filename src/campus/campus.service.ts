import { Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { Campus } from './entities/campus.entity';
import { CampusDetailService } from 'src/campus_detail/campus_detail.service';

@Injectable()
export class CampusService {
  private readonly logger = new Logger('campussService');
  constructor(
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
    private readonly campusDetailService: CampusDetailService,
  ) {}
  async create(createCampussDto: CreateCampusDto) {
    console.log(createCampussDto);
    try {
      const { levelId, ...rest } = createCampussDto;
      const existcampus = await this.campusDetailService.exist(
        rest.campusDetailId,
      );

      if (!existcampus) {
        throw new NotFoundException(
          `No level found with ID ${rest.campusDetailId}`,
        );
      }
      levelId.forEach(async (levelId) => {
        const numbercampus = await this.campusRepository.exists({
          where: {
            campusDetail: { id: rest.campusDetailId },
            level: { id: levelId },
            year: { id: rest.yearId },
          },
        });
        if (numbercampus)
          throw new BadRequestException(
            `There is already a campus with the same level(${levelId}) and year`,
          );
      });
      levelId.forEach(async (levelId) => {
        const newEntry = this.campusRepository.create({
          campusDetail: { id: rest.campusDetailId },
          level: { id: levelId },
          year: { id: rest.yearId },
        });
        await this.campusRepository.save(newEntry);
      });
      const campus = await this.campusRepository.find({
        where: {
          campusDetail: { id: rest.campusDetailId },
          year: { id: rest.yearId },
        },
        relations: {
          campusDetail: true,
          level: true,
          year: true,
        },
      });
      return campus;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const campus = await this.campusRepository.find({
      relations: {
        campusDetail: true,
        level: true,
        year: true,
      },
    });
    return campus;
  }

  async findOne(id: number) {
    const campus = await this.campusRepository.findOneBy({
      id,
    });
    if (!campus)
      throw new NotFoundException(`campusRepository with id ${id} not found`);
    return campus;
  }

  async update(id: number, updateCampussDto: UpdateCampusDto) {
    const campus = await this.campusRepository.preload({
      id: id,
      ...updateCampussDto,
    });
    if (!campus) throw new NotFoundException(`campus with id: ${id} not found`);
    try {
      await this.campusRepository.save(campus);
      return campus;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const campus = await this.campusRepository.findOneBy({ id });
    if (!campus) throw new NotFoundException(`campus with id: ${id} not found`);
    try {
      await this.campusRepository.remove(campus);
    } catch (error) {
      handleDBExceptions(error, this.logger);
      // console.log(error);
    }
  }
}
