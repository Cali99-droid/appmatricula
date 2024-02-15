import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { Campus } from './entities/campus.entity';
import { Year } from 'src/years/entities/year.entity';
import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';

@Injectable()
export class CampusService {
  private readonly logger = new Logger('campussService');
  constructor(
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
    // private readonly campusDetailRepository: CampusService,
  ) {}
  async validateCampusExists(idCampus: number, idyear: number) {
    const existCampus = await this.campusRepository.findOne({
      where: {
        campusDetail: { id: idCampus },
        year: { id: idyear },
      },
    });
    return existCampus;
  }
  async create(createCampussDto: CreateCampusDto) {
    try {
      const campus = this.campusRepository.create({
        campusDetail: { id: createCampussDto.campusDetailId },
        year: { id: createCampussDto.yearId },
      });
      const campusCreated = await this.campusRepository.save(campus);
      return {
        id: campusCreated.id,
        campusDetailId: campusCreated.campusDetail,
        yearId: campusCreated.year,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const campus = await this.campusRepository.find({
      relations: {
        campusDetail: true,
        year: true,
        campusXlevel: true,
      },
    });
    return campus;
  }
  async findOne(id: number) {
    const campus = await this.campusRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        campusDetail: true,
        year: true,
        campusXlevel: true,
      },
    });
    if (!campus) throw new NotFoundException(`campus with id ${id} not found`);
    return campus;
  }
  async update(id: number, updateCampussDto: UpdateCampusDto) {
    const campus = await this.campusRepository.preload({
      id: id,
      campusDetail: { id: updateCampussDto.campusDetailId },
      year: { id: updateCampussDto.yearId },
    });
    console.log(campus);
    if (!campus) throw new NotFoundException(`campus with id: ${id} not found`);
    try {
      campus.year = { id: updateCampussDto.yearId } as Year;
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
  async findOneByCampusandYear(idCampusDetail: number, idYear: number) {
    const campus = await this.campusRepository.find({
      where: {
        campusDetail: { id: idCampusDetail },
        year: { id: idYear },
      },
    });
    if (!campus)
      throw new NotFoundException(
        `campusRepository with idCampusDetail ${idCampusDetail} or idYear ${idYear}  not found`,
      );
    return campus.length > 0 ? campus[0].year : null;
  }
}
