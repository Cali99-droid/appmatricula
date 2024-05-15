import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Repository } from 'typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { SearchSheduleDto } from './dto/search-schedule.dto';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger('ScheduleService');
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}
  async create(createScheduleDto: CreateScheduleDto) {
    try {
      const schedule = this.scheduleRepository.create(createScheduleDto);
      schedule.activityClassroom = {
        id: createScheduleDto.activityClassroomId,
      } as ActivityClassroom;

      await this.scheduleRepository.save(schedule);
      return schedule;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(searchScheduleDto: SearchSheduleDto) {
    const { yearId, campusId, levelId } = searchScheduleDto;
    // const schedules = await this.scheduleRepository.find({
    //   where: {
    //     dayOfWeek: {
    //       year: { id: !isNaN(+yearId) ? +yearId : undefined },
    //     },
    //     activityClassroom: {
    //       grade: {
    //         level: { id: !isNaN(+levelId) ? +levelId : undefined },
    //       },
    //       classroom: {
    //         campusDetail: { id: !isNaN(+campusId) ? +campusId : undefined },
    //       },
    //     },
    //   },
    // });
    // return schedules;
  }

  async findByActivityClassroom(activityClassroomId: number) {
    console.log(activityClassroomId);
    try {
      return await this.scheduleRepository.findOneByOrFail({
        activityClassroom: { id: activityClassroomId },
      });
    } catch (error) {
      throw new NotFoundException(error.message);
      // handleDBExceptions(error, this.logger);
    }
  }

  async findOne(id: number) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: id },
    });
    if (!schedule)
      throw new NotFoundException(`Schedule with id ${id} not found`);
    return schedule;
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.scheduleRepository.preload({
      id: id,
      ...updateScheduleDto,
    });
    if (!schedule)
      throw new NotFoundException(`Schedule with id: ${id} not found`);
    try {
      schedule.activityClassroom = {
        id: updateScheduleDto.activityClassroomId,
      } as ActivityClassroom;

      await this.scheduleRepository.save(schedule);
      return schedule;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const schedule = await this.scheduleRepository.findOneBy({ id });
    if (!schedule)
      throw new NotFoundException(`Schedule by id: '${id}' not found`);
    try {
      await this.scheduleRepository.remove(schedule);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
