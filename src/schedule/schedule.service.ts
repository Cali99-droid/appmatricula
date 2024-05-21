import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Repository } from 'typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';

import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { SchoolShift } from '../school_shifts/entities/school_shift.entity';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger('ScheduleService');
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    // private readonly schoolShiftRepository: Repository<SchoolShift>,
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
  ) {}
  async create(createScheduleDto: CreateScheduleDto) {
    const exists = await this.scheduleRepository.findOne({
      where: [
        {
          day: createScheduleDto.day,
          activityClassroom: { id: createScheduleDto.activityClassroomId },
        },
      ],
    });
    if (exists) {
      throw new BadRequestException(
        'Schedule not available, this turn already exists',
      );
    }
    const { schoolShift } = await this.activityClassroomRepository.findOne({
      where: [
        {
          id: createScheduleDto.activityClassroomId,
        },
      ],
    });
    if (!this.shoolShiftValid(createScheduleDto, schoolShift)) {
      throw new BadRequestException(
        'Schedule not available, this shift intersects with school shift',
      );
    }
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

  // async findAll(searchScheduleDto: SearchSheduleDto) {
  //   // const { yearId, campusId, levelId } = searchScheduleDto;
  //   // const schedules = await this.scheduleRepository.find({
  //   //   where: {
  //   //     dayOfWeek: {
  //   //       year: { id: !isNaN(+yearId) ? +yearId : undefined },
  //   //     },
  //   //     activityClassroom: {
  //   //       grade: {
  //   //         level: { id: !isNaN(+levelId) ? +levelId : undefined },
  //   //       },
  //   //       classroom: {
  //   //         campusDetail: { id: !isNaN(+campusId) ? +campusId : undefined },
  //   //       },
  //   //     },
  //   //   },
  //   // });
  //   // return schedules;
  // }

  async findByActivityClassroom(activityClassroomId: number) {
    try {
      const scheduleData = await this.scheduleRepository.findBy({
        activityClassroom: { id: activityClassroomId },
      });
      const classroomData =
        await this.activityClassroomRepository.findOneByOrFail({
          id: activityClassroomId,
        });
      const { campus, level, ...generalShift } = classroomData.schoolShift;

      const formatScheduleData = scheduleData.map((item) => {
        const { activityClassroom, ...res } = item;

        return res;
      });
      return {
        generalShift,
        individualShift: formatScheduleData,
      };
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
    const { schoolShift } = await this.activityClassroomRepository.findOne({
      where: [
        {
          id: updateScheduleDto.activityClassroomId,
        },
      ],
    });
    if (!this.shoolShiftValid(updateScheduleDto, schoolShift)) {
      throw new BadRequestException(
        'Schedule not available, this shift intersects with school shift',
      );
    }
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
  private shoolShiftValid(
    newSchedule: CreateScheduleDto | UpdateScheduleDto,
    schoolShift: SchoolShift,
  ): boolean {
    if (
      (newSchedule.startTime >= schoolShift.startTime &&
        newSchedule.startTime < schoolShift.endTime) ||
      (newSchedule.endTime > schoolShift.startTime &&
        newSchedule.endTime <= schoolShift.endTime) ||
      (newSchedule.startTime <= schoolShift.startTime &&
        newSchedule.endTime >= schoolShift.endTime)
    ) {
      return false;
    }
    return true;
  }
}
