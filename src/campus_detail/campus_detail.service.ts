import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCampusDetailDto } from './dto/create-campus_detail.dto';
import { UpdateCampusDetailDto } from './dto/update-campus_detail.dto';
import { CampusDetail } from './entities/campus_detail.entity';

@Injectable()
export class CampusDetailService {
  private readonly logger = new Logger('campusDetailService');
  constructor(
    @InjectRepository(CampusDetail)
    private readonly campusDetailRepository: Repository<CampusDetail>,
  ) {}
  async create(createCampusDetailDto: CreateCampusDetailDto) {
    try {
      const campuss = this.campusDetailRepository.create(createCampusDetailDto);
      await this.campusDetailRepository.save(campuss);
      return campuss;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const campuss = await this.campusDetailRepository.find({
      order: {
        name: 'ASC',
      },
    });
    return campuss;
  }

  async findOne(term: string) {
    const queryBuilder =
      this.campusDetailRepository.createQueryBuilder('campus');
    const campus = await queryBuilder
      .where(`name=:name or campus.id=:id`, {
        id: term,
        name: term,
      })
      .orWhere(`campus.ugelLocalCode  = :ugelLocalCode `, {
        ugelLocalCode: term,
      })
      // .leftJoinAndSelect('campus.phase', 'campusPhase')
      .getOne();
    if (!campus)
      throw new NotFoundException(`Campus with term ${term} not found`);

    return campus;
  }

  async update(id: number, updateCampusDetailDto: UpdateCampusDetailDto) {
    const campus = await this.campusDetailRepository.preload({
      id: id,
      ...updateCampusDetailDto,
    });
    if (!campus) throw new NotFoundException(`Campus with id: ${id} not found`);
    try {
      await this.campusDetailRepository.save(campus);
      return campus;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const campusDetail = await this.campusDetailRepository.findOneBy({ id });
    if (!campusDetail)
      throw new NotFoundException(`CampusDetail by id: '${id}' not found`);
    try {
      await this.campusDetailRepository.remove(campusDetail);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async exist(id: number) {
    const existCampus = await this.campusDetailRepository.findOneBy({ id });
    return !!existCampus;
  }

  async findOneByCampusDetailandYear(idCampusDetail: number, idYear: number) {
    const campus = await this.campusDetailRepository.findOne({
      relations: {
        campus: true,
      },
      where: {
        campus: { campusDetail: { id: idCampusDetail }, year: { id: idYear } },
      },
    });

    if (!campus)
      throw new NotFoundException(
        `campusRepository with idCampusDetail ${idCampusDetail} or idYear ${idYear}  not found`,
      );
    return campus;
  }
}
