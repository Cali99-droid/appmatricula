import { DataSource, In, Repository } from 'typeorm';
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
import { Year } from 'src/years/entities/year.entity';
import { CampusToLevel } from './entities/campusToLevel.entity';
import { User } from 'src/user/entities/user.entity';
import { Assignment } from 'src/user/entities/assignments.entity';

@Injectable()
export class CampusService {
  private readonly logger = new Logger('campussService');
  constructor(
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
    @InjectRepository(CampusToLevel)
    private readonly campusToLevelRepository: Repository<CampusToLevel>,
    private readonly dataSource: DataSource,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      const { levels = [], ...restCampus } = createCampussDto;
      const campus = this.campusRepository.create({
        campusDetail: { id: restCampus.campusDetailId },
        year: { id: restCampus.yearId },
      });

      const campusCreated = await this.campusRepository.save(campus);

      const campusToLevelroomPromises = levels.map(async (levelId) => {
        const campusToLevel = this.campusToLevelRepository.create({
          campusId: campus.id,
          levelId,
        });
        await this.campusToLevelRepository.save(campusToLevel);
      });

      // Esperamos a que todas las promesas de guardar en campusToLevel se resuelvan.
      await Promise.all(campusToLevelroomPromises);
      const { year, ...values } = campusCreated;

      return { ...values, yearId: year.id };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const campus = await this.campusRepository.find({
      relations: {
        campusDetail: true,
        year: true,
        campusToLevel: true,
      },
      order: {
        campusDetail: { name: 'ASC' },
        campusToLevel: {
          level: { name: 'ASC' },
        },
      },
    });
    return campus;
  }
  async findAllByYear(idYear: number, user: User) {
    // Obtener el usuario con las relaciones necesarias
    const us = await this.userRepository.findOne({
      where: {
        email: user.email,
      },
      relations: {
        assignments: {
          campusDetail: true,
        },
        roles: {
          permissions: true,
        },
      },
    });

    // Recopilar permisos del usuario
    const permissions = new Set(
      us.roles.flatMap((role) => role.permissions.map((perm) => perm.name)),
    );

    // Determinar si el usuario es admin
    const isAdmin = permissions.has('admin');

    // Condición where para la consulta de campus
    const whereCondition: any = { year: { id: idYear } };

    if (!isAdmin) {
      const campusDetailIds = us.assignments.map(
        (item) => item.campusDetail.id,
      );
      whereCondition.campusDetail = { id: In(campusDetailIds) };
    }

    // Obtener campus según la condición
    const campus = await this.campusRepository.find({
      relations: {
        campusDetail: true,
        year: true,
        campusToLevel: true,
      },
      order: {
        campusDetail: { name: 'ASC' },
        campusToLevel: { level: { name: 'ASC' } },
      },
      where: whereCondition,
    });

    return campus;
  }
  async findOne(id: string) {
    try {
      const campus = await this.campusRepository.findOne({
        where: { id: +id },
        order: {
          campusToLevel: {
            level: {
              name: 'ASC',
            },
          },
        },
      });

      return {
        id: campus.id,
        campusDetailId: campus.campusDetail.id,
        campusName: campus.campusDetail.name,
        yearId: campus.year.id,
        campusToLevel: campus.campusToLevel,
      };
    } catch (error) {
      throw new NotFoundException(`Cannot GET /api/v1/campus/${id}`);
    }
  }

  async update(id: number, updateCampussDto: UpdateCampusDto) {
    const { levels, ...toUpdate } = updateCampussDto;

    const campus = await this.campusRepository.preload({
      id: id,
      ...toUpdate,
    });
    if (!campus) throw new NotFoundException(`campus with id: ${id} not found`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (updateCampussDto.yearId) {
        campus.year = { id: updateCampussDto.yearId } as Year;
      }
      if (levels) {
        // Elimina las relaciones existentes para evitar duplicados
        await queryRunner.manager.delete(CampusToLevel, { campusId: id });

        // Crea y guarda las nuevas relaciones
        const campusToLevels = levels.map((levelId) =>
          queryRunner.manager.create(CampusToLevel, {
            campusId: id,
            levelId,
          }),
        );
        await queryRunner.manager.save(campusToLevels);
      }

      await queryRunner.manager.save(campus);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return campus;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    try {
      const campus = await this.campusRepository.findOneByOrFail({ id });
      await this.campusRepository.remove(campus);
    } catch (error) {
      throw new BadRequestException(error.message);
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
