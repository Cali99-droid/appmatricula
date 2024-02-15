import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCampusXLevelDto } from './dto/create-campus_x_level.dto';
import { UpdateCampusXLevelDto } from './dto/update-campus_x_level.dto';
import { CampusXLevel } from './entities/campus_x_level.entity';
import { Campus } from 'src/campus/entities/campus.entity';
import { Level } from 'src/level/entities/level.entity';

@Injectable()
export class CampusXLevelService {
  private readonly logger = new Logger('campusXlevelService');
  constructor(
    @InjectRepository(CampusXLevel)
    private readonly campusXlevelRepository: Repository<CampusXLevel>,
  ) {}
  async create(createCampusXLevelDto: CreateCampusXLevelDto) {
    try {
      const campusXlevel = this.campusXlevelRepository.create({
        campus: { id: createCampusXLevelDto.campusId },
        level: { id: createCampusXLevelDto.levelId },
      });
      const campusCreated =
        await this.campusXlevelRepository.save(campusXlevel);
      return {
        id: campusCreated.id,
        campusId: campusCreated.campus,
        levelId: campusCreated.level,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  findAll() {
    return `This action returns all campusXLevel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} campusXLevel`;
  }

  async update(id: number, updateCampusXLevelDto: UpdateCampusXLevelDto) {
    const campus = await this.campusXlevelRepository.preload({
      id: id,
      campus: { id: updateCampusXLevelDto.campusId },
      level: { id: updateCampusXLevelDto.levelId },
    });
    if (!campus) throw new NotFoundException(`campus with id: ${id} not found`);
    try {
      campus.level = { id: updateCampusXLevelDto.levelId } as Level;
      campus.campus = {
        id: updateCampusXLevelDto.campusId,
      } as Campus;
      await this.campusXlevelRepository.save(campus);
      return campus;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async validateCampusXlevelExists(idCampus: number, idLevel: number) {
    const existCampus = await this.campusXlevelRepository.findOne({
      where: {
        campus: { id: idCampus },
        level: { id: idLevel },
      },
    });
    return existCampus;
  }
  remove(id: number) {
    return `This action removes a #${id} campusXLevel`;
  }
}
