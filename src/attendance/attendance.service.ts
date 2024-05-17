import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
// import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from './entities/attendance.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
// import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { StatusAttendance } from './enum/status-attendance.enum';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Day } from 'src/common/enum/day.enum';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Shift } from './enum/shift.enum';

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
  ) {}
  async create(createAttendanceDto: CreateAttendanceDto) {
    /**capturar fecha y hora actual */
    const currentTime = new Date();
    const currentDate = new Date();

    /**declarar turno(Morning, Affternoon) y estado de asistencia (early, late) */
    let shift: Shift;
    let status: StatusAttendance;

    try {
      /**Verificar validez de matricula */
      const enrollment = await this.enrrollmentRepository.findOneByOrFail({
        code: createAttendanceDto.code,
      });
      /**bimestres, buscar un bimestre y ver si la fecha de hoy esta o no dentro de ella */
      console.log(enrollment.activityClassroom.phase.bimester);
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
        console.log('ya tiene asistencia');
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
            startMinute,
            startSecond,
            0,
          );
          finishAttendanceTime.setHours(endHour - 2, endMinute, endSecond, 0);
          cutoffTime.setHours(startHour, startMinute, startSecond, 0);
          if (
            !(
              currentTime >= initAttendanceTime &&
              currentTime <= finishAttendanceTime
            )
          ) {
            throw new BadRequestException(
              `You cannot check attendance at this time, please wait until: ${initAttendanceTime}`,
            );
          }
          if (currentTime.getHours() < 12) {
            shift = Shift.M;
            status =
              currentTime <= cutoffTime
                ? StatusAttendance.E
                : StatusAttendance.L;
          } else {
            shift = Shift.A;
            status =
              currentTime <= cutoffTime
                ? StatusAttendance.E
                : StatusAttendance.L;
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

        cutoffTime.setHours(startHour, startMinute, startSecond, 0);
        initAttendanceTime.setHours(startHour - 1, startMinute, startSecond, 0);
        finishAttendanceTime.setHours(endHour - 2, endMinute, endSecond, 0);
        if (
          !(
            currentTime >= initAttendanceTime &&
            currentTime <= finishAttendanceTime
          )
        ) {
          throw new BadRequestException(
            `You cannot check attendance at this time, please wait until: ${initAttendanceTime}`,
          );
        }

        if (currentTime.getHours() < 12) {
          shift = Shift.M;
          status =
            currentTime <= cutoffTime ? StatusAttendance.E : StatusAttendance.L;
        } else {
          shift = Shift.A;
          status =
            currentTime <= cutoffTime ? StatusAttendance.E : StatusAttendance.L;
        }
      }

      const attendance = this.attendanceRepository.create({
        shift: shift,
        status: status,
        arrivalTime: currentTime,
        student: { id: enrollment.student.id },
        arrivalDate: this.convertISODateToYYYYMMDD(currentDate),
      });

      return this.attendanceRepository.save(attendance);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return `This action returns all attendance`;
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
}
