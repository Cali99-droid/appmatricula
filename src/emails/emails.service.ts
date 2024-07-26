import { Injectable, Logger } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Email } from './entities/email.entity';
import { FindActivityClassroomDto } from './dto/find-activity_classroom.dto';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger('EmailsService');
  constructor(
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
    private readonly configService: ConfigService,
    @InjectRepository(Email)
    private readonly userRepository: Repository<Email>,
  ) {}
  async create(
    createEmailDto: CreateEmailDto,
    findActivity: FindActivityClassroomDto,
  ) {
    const dataActivityClassroom =
      await this.activityClassroomRepository.findOne({
        where: [
          {
            grade: { id: findActivity.gradeId },
            phase: { id: findActivity.phaseId },
          },
        ],
      });
  }

  findAll() {
    return `This action returns all emails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} email`;
  }

  update(id: number, updateEmailDto: UpdateEmailDto) {
    return `This action updates a #${id} email`;
  }

  remove(id: number) {
    return `This action removes a #${id} email`;
  }
}
