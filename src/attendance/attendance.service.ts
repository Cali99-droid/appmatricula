import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
// import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from './entities/attendance.entity';
import { Between, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
// import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { StatusAttendance } from './enum/status-attendance.enum';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Day } from 'src/common/enum/day.enum';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Shift } from './enum/shift.enum';
import { Holiday } from 'src/holiday/entities/holiday.entity';
import { Student } from 'src/student/entities/student.entity';

import { Phase } from 'src/phase/entities/phase.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import * as moment from 'moment-timezone';
import { ConditionAttendance } from './enum/condition.enum';
import { ConfigService } from '@nestjs/config';
import { SearchAttendanceDto } from './dto/search-attendace.dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger('attendanceService');
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Enrollment)
    private readonly enrrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Phase)
    private readonly phaseRepository: Repository<Phase>,
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
    private readonly configService: ConfigService,
  ) {}
  async create(createAttendanceDto: CreateAttendanceDto) {
    /**capturar fecha y hora actual */
    const currentTime = new Date();
    const currentDate = new Date();

    /**declarar turno(Morning, Affternoon) y estado de asistencia (early, late) */
    let shift: Shift;
    let status: StatusAttendance;
    let condition: ConditionAttendance;

    try {
      /**Verificar validez de matricula */
      const enrollment = await this.enrrollmentRepository.findOneByOrFail({
        code: createAttendanceDto.code,
      });
      /**verificar dia feriado */
      const yearId = enrollment.activityClassroom.phase.year.id;
      const queryBuilderHoliday =
        this.holidayRepository.createQueryBuilder('holiday');
      const isHoliday = await queryBuilderHoliday
        .where(`date=:dateNow and yearId =:yearId `, {
          dateNow: this.convertISODateToYYYYMMDD(currentDate),
          yearId,
        })
        .getOne();
      if (isHoliday) {
        throw new BadRequestException(
          `You cannot mark attendance, this day was defined as a holiday ${currentDate}`,
        );
      }
      /** verificar que la fecha se encuentre en un bimestre*/
      const bimesters = enrollment.activityClassroom.phase.bimester;

      let currentBimester;
      for (const bimestre of bimesters) {
        if (
          currentDate >= new Date(bimestre.startDate) &&
          currentDate <= new Date(bimestre.endDate)
        ) {
          currentBimester = bimestre;
        }
      }
      if (!currentBimester) {
        throw new BadRequestException(
          `No active two-month period (bimester) for the date ${currentDate}`,
        );
      }

      /**Validate existing */
      const queryBuilder =
        this.attendanceRepository.createQueryBuilder('attendance');
      const att = await queryBuilder
        .where(`arrivalDate=:dateNow and studentId =:studentId`, {
          dateNow: this.convertISODateToYYYYMMDD(currentDate),
          studentId: enrollment.student.id,
        })
        .getOne();

      if (att) {
        const currentDay: Day = this.getDayEnumValue(currentDate.getDay());

        const indSchedule = await this.scheduleRepository.findOneBy({
          day: currentDay,
          activityClassroom: { id: enrollment.activityClassroom.id },
        });
        if (indSchedule) {
          const cutoffTime = new Date();
          const initAttendanceTime = new Date();
          const finishAttendanceTime = new Date();
          const [startHour, startMinute, startSecond] = indSchedule.startTime
            .split(':')
            .map(Number);
          const [endHour, endMinute, endSecond] = indSchedule.endTime
            .split(':')
            .map(Number);
          initAttendanceTime.setHours(
            startHour - 1,
            startMinute - 20,
            startSecond,
            0,
          );
          finishAttendanceTime.setHours(startHour + 2, endMinute, endSecond, 0);
          cutoffTime.setHours(startHour, startMinute, startSecond, 0);
          // if (
          //   !(
          //     currentTime >= initAttendanceTime &&
          //     currentTime <= finishAttendanceTime
          //   )
          // ) {
          //   console.log(endHour);
          //   throw new BadRequestException(
          //     `You cannot check attendance at this time, please wait until: ${initAttendanceTime}`,
          //   );
          // }
          if (currentTime.getHours() < 12) {
            shift = Shift.M;
            status =
              currentTime <= cutoffTime
                ? StatusAttendance.E
                : StatusAttendance.L;
            //**Mantener esto*/
            condition =
              currentTime <= cutoffTime
                ? ConditionAttendance.Early
                : ConditionAttendance.Late;
          } else {
            shift = Shift.A;
            status =
              currentTime <= cutoffTime
                ? StatusAttendance.E
                : StatusAttendance.L;
            condition =
              currentTime <= cutoffTime
                ? ConditionAttendance.Early
                : ConditionAttendance.Late;
          }
        } else {
          throw new BadRequestException(
            `the student already marked assistance or does not have classes at this time ${currentDate}`,
          );
        }
        /**validar asistencia y turno */
        const queryBuilder =
          this.attendanceRepository.createQueryBuilder('attendance');
        const existAttendance = await queryBuilder
          .where(
            `arrivalDate=:dateNow and studentId =:studentId and shift=:shift`,
            {
              dateNow: this.convertISODateToYYYYMMDD(currentDate),
              studentId: enrollment.student.id,
              shift: shift,
            },
          )
          .getOne();

        if (existAttendance) {
          throw new BadRequestException(
            `Duplicate Attendance on this turn: ${shift}`,
          );
        }

        /**ya tiene asistencia, verificar si tiene otro turno */
        const attendance = this.attendanceRepository.create({
          shift: shift,
          status: status,
          arrivalTime: currentTime,
          student: { id: enrollment.student.id },
          arrivalDate: this.convertISODateToYYYYMMDD(currentDate),
        });

        return this.attendanceRepository.save(attendance);
      } else {
        //*** crear asistencia */
        const turn = enrollment.activityClassroom.schoolShift;
        const cutoffTime = new Date();
        const initAttendanceTime = new Date();
        const finishAttendanceTime = new Date();
        const [startHour, startMinute, startSecond] = turn.startTime
          .split(':')
          .map(Number);
        const [endHour, endMinute, endSecond] = turn.endTime
          .split(':')
          .map(Number);

        initAttendanceTime.setHours(startHour - 1, startMinute, startSecond, 0);
        finishAttendanceTime.setHours(endHour - 2, endMinute, endSecond, 0);
        // if (
        //   !(
        //     currentTime >= initAttendanceTime &&
        //     currentTime <= finishAttendanceTime
        //   )
        // ) {
        //   throw new BadRequestException(
        //     `You cannot check attendance at this time, please wait until: ${initAttendanceTime}`,
        //   );
        // }

        if (currentTime.getHours() < 12) {
          shift = Shift.M;
          status =
            currentTime <= cutoffTime ? StatusAttendance.E : StatusAttendance.L;
          condition =
            currentTime <= cutoffTime
              ? ConditionAttendance.Early
              : ConditionAttendance.Late;
        } else {
          shift = Shift.A;
          status =
            currentTime <= cutoffTime ? StatusAttendance.E : StatusAttendance.L;
          condition =
            currentTime <= cutoffTime
              ? ConditionAttendance.Early
              : ConditionAttendance.Late;
        }
      }

      const attendance = this.attendanceRepository.create({
        shift: shift,
        status: status,
        condition: condition,
        arrivalTime: currentTime,
        student: { id: enrollment.student.id },
        arrivalDate: this.convertISODateToYYYYMMDD(currentDate),
      });

      return this.attendanceRepository.save(attendance);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async findByParams(params: SearchAttendanceDto) {
    const { yearId, campusId, levelId } = params;
    let condition = undefined;
    switch (params.condition) {
      case 'PUNTUAL':
        condition = 'P';
        break;
      case 'TARDANZA':
        condition = 'T';
        break;
      case 'FALTA':
        condition = 'F';
        break;
    }
    const attendance = await this.attendanceRepository.find({
      where: {
        student: {
          enrollment: {
            activityClassroom: {
              phase: { year: { id: !isNaN(+yearId) ? +yearId : undefined } },
              classroom: {
                campusDetail: { id: !isNaN(+campusId) ? +campusId : undefined },
              },
              section: params.section ? params.section : undefined,
              grade: {
                id: !isNaN(+params.gradeId) ? +params.gradeId : undefined,
                level: { id: !isNaN(+levelId) ? +levelId : undefined },
              },
            },
          },
        },
        arrivalDate: Between(
          new Date(params.startDate),
          new Date(params.endDate),
        ),
        condition: condition,
      },
    });
    const result = attendance.reduce((acc, item) => {
      const { id, student, arrivalDate, condition } = item;

      if (!acc[student.id]) {
        acc[student.id] = {
          id: student.id,
          nombre: `${student.person.lastname} ${student.person.mLastname} ${student.person.name} `,
          attendance: [],
        };
      }

      acc[student.id].attendance.push({ id, arrivalDate, condition });

      return acc;
    }, {});
    return result;
  }
  async findAll() {
    const attendance = await this.studentRepository.find({
      relations: {
        attendance: true,
      },
    });
    return attendance;
  }
  async findLastFiveRecords() {
    const attendances = await this.attendanceRepository.find({
      order: {
        arrivalTime: 'DESC',
      },
      take: 5,
    });

    const timeZone = 'America/Lima';
    const utcAttendance = attendances.map((attendance) => {
      const utcDate = moment.utc(attendance.arrivalTime); // Aseguramos que la fecha sea UTC
      const zonedDate = utcDate.tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
      return {
        ...attendance,
        arrivalTime: zonedDate,
      };
    });
    const urlS3 = this.configService.getOrThrow('FULL_URL_S3');

    const defaultAvatar = this.configService.getOrThrow('AVATAR_NAME_DEFAULT');

    const formatAttendances = utcAttendance.map((item) => {
      const { student, ...attendance } = item;

      const data = student.person;

      return {
        ...attendance,
        student: {
          ...data,
          photo: student.photo
            ? `${urlS3}${student.photo}`
            : `${urlS3}${defaultAvatar}`,
        },
      };
    });

    return formatAttendances;
  }

  findOne(id: number) {
    return `This action returns a #${id} attendance`;
  }

  update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    return `This action updates a #${updateAttendanceDto} attendance`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendance`;
  }

  private parseDate(dateString) {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // los meses en JS van de 0 a 11
  }

  private convertISODateToYYYYMMDD(isoDateString) {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() devuelve un índice de mes basado en cero
    const day = date.getDate();

    // Añadir un cero a la izquierda para los meses y días menores de 10
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;

    return `${year}-${formattedMonth}-${formattedDay}`;
  }

  private getDayEnumValue(dayIndex: number): Day {
    // Crear un mapa del índice devuelto por getDay() a los valores de la enumeración
    const indexToDay: { [key: number]: Day } = {
      0: Day.SU, // Domingo
      1: Day.MO, // Lunes
      2: Day.TU, // Martes
      3: Day.WE, // Miércoles
      4: Day.TH, // Jueves
      5: Day.FR, // Viernes
      6: Day.SA, // Sábado
    };

    return indexToDay[dayIndex];
  }
  /**FOR CRON JOBS, coloca a todos como ausentes en la madrugada
   *
   */
  async markAbsentStudents(shift: Shift): Promise<void> {
    this.logger.log(`Running cron jobs for the shift: ${shift}`);
    const currentDate = new Date();
    const currentDay: Day = this.getDayEnumValue(currentDate.getDay());
    /**obtener fase */
    const qbphase = this.phaseRepository.createQueryBuilder('phase');
    const phase = await qbphase
      .where('startDate <=:currentDate', {
        currentDate: this.convertISODateToYYYYMMDD(currentDate),
      })
      .andWhere('endDate>=:currentDate', {
        currentDate: this.convertISODateToYYYYMMDD(currentDate),
      })
      .getOne();
    if (!phase) {
      this.logger.warn(
        `There is no active phase for this date: ${currentDate}, the cron jobs were not completed`,
      );
      return;
    }

    // Encuentra todas las asistencias del día actual y turno especificado
    const queryBuilder =
      this.attendanceRepository.createQueryBuilder('attendance');
    const attendances = await queryBuilder
      .leftJoinAndSelect('attendance.student', 'student')
      .where(`arrivalDate=:dateNow and shift =:shift`, {
        dateNow: this.convertISODateToYYYYMMDD(currentDate),
        shift,
      })
      .getMany();

    //**TODO agregar que tengan una matricula valida para considerar como ausente (OBS esta con status)*/

    const studentCodes = attendances.map((attendance) => attendance.student.id);
    let studentsToAbsent: Student[] = [];

    if (studentCodes.length > 0) {
      studentsToAbsent = await this.studentRepository
        .createQueryBuilder('student')

        .where('id NOT IN (:...studentCodes)', {
          studentCodes,
        })
        .andWhere('student.status = :status', { status: true })
        .getMany();
    } else {
      studentsToAbsent = await this.studentRepository
        .createQueryBuilder('student')
        .where('student.status = :status', { status: true })
        .getMany();
    }

    if (shift === Shift.A) {
      const indSchedule = await this.scheduleRepository.findOneBy({
        day: currentDay,
        activityClassroom: { phase: phase },
      });

      if (!indSchedule) {
        this.logger.verbose(
          `There are no afternoon shifts for today ${currentDate}, the cron jobs were not completed`,
        );
        return;
      }

      const activityClassrooms = await this.activityClassroomRepository.findBy({
        phase: {
          id: phase.id,
        },
        schedule: {
          day: currentDay,
        },
      });
      const classroomsIds = activityClassrooms.map((item) => item.id);
      const enrolls = await this.enrrollmentRepository.find({
        where: {
          activityClassroom: { id: In(classroomsIds) },
        },
      });
      const idsForAfternoon = enrolls.map((item) => item.student.id);

      studentsToAbsent = studentsToAbsent.filter((student) =>
        idsForAfternoon.includes(student.id),
      );
    }

    this.logger.log(
      `Number of students absent for today (${currentDate}) in the shift ${shift}: ${studentsToAbsent.length}`,
    );
    for (const student of studentsToAbsent) {
      await this.attendanceRepository.save({
        arrivalDate: this.convertISODateToYYYYMMDD(currentDate),
        arrivalTime: currentDate,
        shift: shift,
        status: StatusAttendance.A,
        condition: ConditionAttendance.Absent,
        student: { id: student.id },
      });
    }

    this.logger.log(`Cron jobs completed succesfully`);
  }
}
