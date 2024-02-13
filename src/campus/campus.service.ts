import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { Campus } from './entities/campus.entity';
import { Year } from 'src/years/entities/year.entity';
import { Level } from 'src/level/entities/level.entity';
import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';

@Injectable()
export class CampusService {
  private readonly logger = new Logger('campussService');
  constructor(
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
    private readonly campusDetailRepository: Repository<CampusDetail>,
  ) {}
  async validateCampusExists(
    idCampus: number,
    idLevel: number,
    idyear: number,
  ) {
    const existCampus = await this.campusRepository.exists({
      where: {
        campusDetail: { id: idCampus },
        level: { id: idLevel },
        year: { id: idyear },
      },
    });
    return !!existCampus;
  }
  async create(createCampussDto: CreateCampusDto) {
    try {
      const { levelId, ...rest } = createCampussDto;
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

  async findOne(idCampusDetail: number, idYear: number) {
    const campus = await this.campusDetailRepository.findOne({
      relations: {
        campus: true,
      },
      where: {
        campus: { id: idCampusDetail, year: { id: idYear } },
      },
    });
    if (!campus)
      throw new NotFoundException(
        `campusRepository with idCampusDetail ${idCampusDetail} or idYear ${idYear}  not found`,
      );
    return campus;
  }

  async update(id: number, updateCampussDto: UpdateCampusDto) {
    const campus = await this.campusRepository.preload({
      id: id,
      ...updateCampussDto,
    });
    if (!campus) throw new NotFoundException(`campus with id: ${id} not found`);
    try {
      campus.year = { id: updateCampussDto.yearId } as Year;
      campus.level = { id: updateCampussDto.levelId } as Level;
      campus.campusDetail = {
        id: updateCampussDto.campusDetailId,
      } as CampusDetail;
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
  async exist(id: number) {
    const existCampus = await this.campusRepository.findOneBy({ id });
    return !!existCampus;
  }
}
