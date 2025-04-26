import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateRatingsDto } from './dto/create-ratings.dto';
import { UpdateRatingsDto } from './dto/update-ratings.dto';
import { Ratings } from './entities/ratings.entity';
import { User } from 'src/user/entities/user.entity';
@Injectable()
export class RatingsService {
  private readonly logger = new Logger('ratingsService');
  constructor(
    @InjectRepository(Ratings)
    private readonly ratingsRepository: Repository<Ratings>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createRatingsDto: CreateRatingsDto, user: any) {
    const us = await this.userRepository.findOne({
      where: {
        email: user.email,
      },
    });
    try {
      const newEntry = this.ratingsRepository.create({
        student: { id: createRatingsDto.studentId },
        bimester: { id: createRatingsDto.bimesterId },
        competency: { id: createRatingsDto.studentId },
        teacher: { id: us.id },
        qualification: createRatingsDto.qualification,
        status: true,
      });
      const ratings = await this.ratingsRepository.save(newEntry);
      return ratings;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(activityClassroomId: number) {
    const ratingss = await this.ratingsRepository.find({
      where: {
        bimester: {
          phase: {
            activityClassroom: {
              id: isNaN(activityClassroomId) ? undefined : activityClassroomId,
            },
          },
        },
      },
      relations: {
        student: { person: true },
        bimester: { phase: { activityClassroom: true } },
        competency: true,
      },
      order: {
        student: { person: { lastname: 'ASC' } },
      },
    });
    return ratingss;
  }

  async findOne(id: number) {
    const ratings = await this.ratingsRepository.findOne({
      where: { id: id },
      relations: {
        student: { person: true },
        bimester: true,
        competency: true,
      },
    });
    if (!ratings)
      throw new NotFoundException(`Ratings with id ${id} not found`);
    return ratings;
  }

  async update(id: number, updateRatingsDto: UpdateRatingsDto, user: any) {
    const { studentId, bimesterId, competencyId, ...rest } = updateRatingsDto;
    const us = await this.userRepository.findOne({
      where: {
        email: user.email,
      },
    });
    const ratings = await this.ratingsRepository.preload({
      id: id,
      student: { id: studentId },
      bimester: { id: bimesterId },
      competency: { id: competencyId },
      teacher: { id: us.id },
      ...rest,
    });
    if (!ratings)
      throw new NotFoundException(`Ratings with id: ${id} not found`);
    try {
      await this.ratingsRepository.save(ratings);
      return ratings;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const ratings = await this.ratingsRepository.findOneBy({ id });
    if (!ratings)
      throw new NotFoundException(`Ratings by id: '${id}' not found`);
    try {
      await this.ratingsRepository.remove(ratings);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
