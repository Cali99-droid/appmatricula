import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateSchoolShiftDto } from './dto/create-school_shift.dto';
import { UpdateSchoolShiftDto } from './dto/update-school_shift.dto';
import { SchoolShift } from './entities/school_shift.entity';
import { SearchSchoolShiftsDto } from './dto/search-school_shift.dto';

@Injectable()
export class SchoolShiftsService {
  private readonly logger = new Logger('SchoolShiftsService');
  constructor(
    @InjectRepository(SchoolShift)
    private readonly schoolShiftRepository: Repository<SchoolShift>,
  ) {}
  async create(createSchoolShiftDto: CreateSchoolShiftDto) {
    try {
      const schoolShift =
        this.schoolShiftRepository.create(createSchoolShiftDto);
      await this.schoolShiftRepository.save(schoolShift);
      return schoolShift;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }
  async findAll(searchSchoolShiftDto: SearchSchoolShiftsDto) {
    const { yearId, campusId, levelId } = searchSchoolShiftDto;
    const schoolShifts = await this.schoolShiftRepository.find({
      where: {
        campus: {
          campusDetail: { id: !isNaN(+campusId) ? +campusId : undefined },
          year: { id: !isNaN(+yearId) ? +yearId : undefined },
        },
        level: { id: !isNaN(+levelId) ? +levelId : undefined },
      },
      order: {
        name: 'ASC',
      },
    });
    return schoolShifts;
  }

  async findOne(id: number) {
    const schoolShift = await this.schoolShiftRepository.findOne({
      where: { id: id },
    });
    if (!schoolShift)
      throw new NotFoundException(`SchoolShift with id ${id} not found`);
    return schoolShift;
  }

  async update(id: number, updateSchoolShiftDto: UpdateSchoolShiftDto) {
    const schoolShift = await this.schoolShiftRepository.preload({
      id: id,
      ...updateSchoolShiftDto,
    });
    if (!schoolShift)
      throw new NotFoundException(`SchoolShift with id: ${id} not found`);
    try {
      await this.schoolShiftRepository.save(schoolShift);
      return schoolShift;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const schoolShift = await this.schoolShiftRepository.findOneBy({ id });
    if (!schoolShift)
      throw new NotFoundException(`SchoolShift by id: '${id}' not found`);
    try {
      await this.schoolShiftRepository.remove(schoolShift);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
