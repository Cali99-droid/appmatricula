import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
// import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from './entities/attendance.entity';
import { Between, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
// import { handleDBExceptions } from 'src/common/helpers/handleDBException';

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
import { StudentData } from './interfaces/studentData.interface';
import { SearchByClassroomDto } from './dto/search-by-classroom.dto';
import { TypeSchedule } from './enum/type-schedule.enum';
import { User } from 'src/user/entities/user.entity';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
    private readonly configService: ConfigService,
  ) {}
  async create(createAttendanceDto: CreateAttendanceDto, user: User) {
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

    /**capturar fecha y hora actual */
    const currentTime = new Date();
    const currentDate = new Date();

    /**declarar turno(Morning, Affternoon) y estado de asistencia (early, late) */
    let shift: Shift;

    let condition: ConditionAttendance;

    try {
      /**Verificar validez de matricula */
      const enrollment = await this.enrrollmentRepository.findOneByOrFail({
        code: createAttendanceDto.code,
      });
      /**verificar pertenencia a sede */

      const campusDetailIds = us.assignments.map(
        (item) => item.campusDetail.id,
      );
      if (campusDetailIds.length === 0) {
        throw new BadRequestException(
          `Inicie sesión con un usuario autorizado para esta sede`,
        );
      }

      const campusEnroll =
        enrollment.activityClassroom.classroom.campusDetail.id;

      const isInCampus = campusDetailIds.includes(campusEnroll);
      if (!isInCampus) {
        throw new BadRequestException(
          `Inicie sesión con un usuario autorizado para esta sede`,
        );
      }
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
          `No se puede marcar asistencia, este día fue definido como feriado ${currentDate}`,
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
          `No hay bimestre activo para la fecha ${currentDate}`,
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
      //**Si ya tiene asistencia */
      if (att) {
        const currentDay: Day = this.getDayEnumValue(currentDate.getDay());

        const indSchedule = await this.scheduleRepository.findOneBy({
          day: currentDay,
          activityClassroom: { id: enrollment.activityClassroom.id },
        });
        /**si tiene horario adicional */
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

          console.log(endHour);
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
            shift = Shift.Morning;

            //**Mantener esto*/
            condition =
              currentTime <= cutoffTime
                ? ConditionAttendance.Early
                : ConditionAttendance.Late;
          } else {
            shift = Shift.Afternoon;

            condition =
              currentTime <= cutoffTime
                ? ConditionAttendance.Early
                : ConditionAttendance.Late;
          }
        } else {
          throw new BadRequestException(
            `El estudiante ya marcó asistencia o no tiene clases en este momento ${currentDate}`,
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
            `Asistencia duplicada en este turno: ${shift}`,
          );
        }
        console.log('creando cuando existe');
        const attendance = this.attendanceRepository.create({
          shift: indSchedule.shift,

          arrivalTime: currentTime,
          student: { id: enrollment.student.id },
          arrivalDate: this.convertISODateToYYYYMMDD(currentDate),
          typeSchedule: TypeSchedule.Individual,
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
        cutoffTime.setHours(startHour, startMinute, startSecond, 0);
        if (currentTime.getHours() < 12) {
          shift = Shift.Morning;

          condition =
            currentTime <= cutoffTime
              ? ConditionAttendance.Early
              : ConditionAttendance.Late;
        } else {
          shift = Shift.Afternoon;

          condition =
            currentTime <= cutoffTime
              ? ConditionAttendance.Early
              : ConditionAttendance.Late;
        }
        shift = turn.shift;
      }

      const attendance = this.attendanceRepository.create({
        shift: shift,

        condition: condition,
        arrivalTime: currentTime,
        student: { id: enrollment.student.id },
        arrivalDate: this.convertISODateToYYYYMMDD(currentDate),
        typeSchedule: TypeSchedule.General,
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
          lastname: student.person.lastname,
          mLastname: student.person.mLastname,
          name: student.person.name,
          attendance: [],
        };
      }

      acc[student.id].attendance.push({ id, arrivalDate, condition });

      return acc;
    }, {});
    const arrayResult: StudentData[] = Object.values(result);
    const sortedResult = arrayResult
      .map((student) => ({
        id: student.id,
        lastname: student.lastname,
        mLastname: student.mLastname,
        name: student.name,
        attendance: student.attendance,
      }))
      .sort((a, b) => {
        const lastnameA = a.lastname.toUpperCase();
        const lastnameB = b.lastname.toUpperCase();

        if (lastnameA < lastnameB) {
          return -1;
        }
        if (lastnameA > lastnameB) {
          return 1;
        }
        return 0;
      });

    return sortedResult;
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
      relations: {
        student: {
          enrollment: {
            activityClassroom: {
              grade: {
                level: true,
              },
            },
          },
        },
      },
      // where: {
      //   student: {
      //     enrollment: {

      //     },
      //   },
      // },
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
      const classa = student.enrollment.reduce((max, obj) => {
        return obj.id > max.id ? obj : max;
      }, student.enrollment[0]);
      return {
        ...attendance,
        student: {
          ...data,
          photo: student.photo
            ? `${urlS3}${student.photo}`
            : `${urlS3}${defaultAvatar}`,
        },
        classroom:
          classa.activityClassroom.grade.name +
          ' ' +
          classa.activityClassroom.section +
          ' ' +
          classa.activityClassroom.grade.level.name,
      };
    });

    return formatAttendances;
  }

  findOne(id: number) {
    return `This action returns a #${id} attendance`;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    const timeZone = 'America/Lima';
    const currentDate = moment.utc();
    const zonedDate = currentDate
      .tz(timeZone)
      .subtract(2, 'd')
      .format('YYYY-MM-DD');

    try {
      const attendace = await this.attendanceRepository.findOneByOrFail({ id });

      if (!(new Date(attendace.arrivalDate) >= new Date(zonedDate))) {
        throw new BadRequestException(
          'No es posible editar esta assitencia, pasaron dos dias',
        );
      }
      attendace.condition = updateAttendanceDto.condition;
      return await this.attendanceRepository.save(attendace);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} attendance`;
  }

  async findByClassroom(searchByClassroomDto: SearchByClassroomDto) {
    try {
      const { activityClassroomId, typeSchedule, startDate, endDate } =
        searchByClassroomDto;
      const enrroll = await this.enrrollmentRepository.find({
        where: {
          activityClassroom: { id: activityClassroomId },
        },
      });

      const studentsIds = enrroll.map((item) => item.student.id);
      if (studentsIds.length > 0) {
        const students = await this.studentRepository
          .createQueryBuilder('student')
          .leftJoinAndSelect('student.attendance', 'attendance')
          .leftJoinAndSelect('student.person', 'person')
          .where('student.id IN (:...studentsIds)', { studentsIds })
          .andWhere('attendance.arrivalDate BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
          })
          .andWhere('attendance.typeSchedule = :typeSchedule', { typeSchedule })
          .getMany();

        const formatStudents = students.map((item) => {
          const { person, attendance } = item;
          return { student: person, attendance };
        });

        return formatStudents;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  } /**fs */

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
    /**Validar si es feriado */
    const yearId = phase.year.id;
    const queryBuilderHoliday =
      this.holidayRepository.createQueryBuilder('holiday');
    const isHoliday = await queryBuilderHoliday
      .where(`date=:dateNow and yearId =:yearId `, {
        dateNow: this.convertISODateToYYYYMMDD(currentDate),
        yearId,
      })
      .getOne();
    if (isHoliday) {
      this.logger.verbose(
        `Not absent, this day was defined as a holiday ${currentDate}`,
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
    // ***TODO cambiar shift por enumerador */
    if (studentCodes.length > 0) {
      const soloMorningActi = await this.activityClassroomRepository.findBy({
        schoolShift: {
          name: 'Mañana',
        },
      });
      const idAct = soloMorningActi.map((item) => item.id);
      const studentsMorning = await this.enrrollmentRepository
        .createQueryBuilder('enrroll')
        .leftJoinAndSelect('enrroll.student', 'student')
        .where('activityClassroomId IN (:...idAct)', {
          idAct,
        })
        .getMany();

      const idsStudents = studentsMorning.map((item) => item.student);
      // console.log(idsStudents);

      studentsToAbsent = idsStudents.filter(
        (student) => !studentCodes.includes(student.id),
      );
      // studentsToAbsent = await this.studentRepository
      //   .createQueryBuilder('student')

      //   .where('id NOT IN (:...studentCodes)', {
      //     studentCodes,
      //   })
      //   .andWhere('student.status = :status', { status: true })
      //   .getMany();
    } else {
      const soloMorningActi = await this.activityClassroomRepository.findBy({
        schoolShift: {
          name: 'mañana',
        },
      });

      const idAct = soloMorningActi.map((item) => item.id);

      const studentsMorning = await this.enrrollmentRepository
        .createQueryBuilder('enrroll')
        .leftJoinAndSelect('enrroll.student', 'student')
        .where('activityClassroomId IN (:idAct)', {
          idAct,
        })
        .getMany();

      const idsStudents = studentsMorning.map((item) => item.student);
      // console.log(idsStudents);
      studentsToAbsent = idsStudents.filter(
        (student) => !studentCodes.includes(student.id),
      );
      // console.log('ausentes de mañana hoy', toAbsent);
      // studentsToAbsent = await this.studentRepository
      //   .createQueryBuilder('student')
      //   .where('student.status = :status', { status: true })
      //   .getMany();
    }

    if (shift === Shift.Afternoon) {
      const indSchedule = await this.scheduleRepository.findOneBy({
        day: currentDay,
        activityClassroom: { phase: phase },
      });
      const soloAfterActi = await this.activityClassroomRepository.findBy({
        schoolShift: {
          name: 'Tarde',
        },
      });

      if (!indSchedule && soloAfterActi.length === 0) {
        this.logger.verbose(
          `There are no afternoon shifts for today ${currentDate}, the cron jobs were not completed`,
        );
        return;
      }
      /**turno tarde */
      const idAct = soloAfterActi.map((item) => item.id);

      const studentsMorning = await this.enrrollmentRepository
        .createQueryBuilder('enrroll')
        .leftJoinAndSelect('enrroll.student', 'student')
        .where('activityClassroomId IN (:idAct)', {
          idAct,
        })
        .getMany();

      const idsStudents = studentsMorning.map((item) => item.student);
      // console.log(idsStudents);
      const studentsToAbsentGeneral = idsStudents.filter(
        (student) => !studentCodes.includes(student.id),
      );
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

      const studentsToAbsentInd = studentsToAbsent.filter((student) =>
        idsForAfternoon.includes(student.id),
      );
      studentsToAbsent = studentsToAbsentGeneral.concat(studentsToAbsentInd);
      this.logger.log(
        `Number of students absent for today (${currentDate}) in the shift ${shift}: ${studentsToAbsent.length}`,
      );
      this.logger.log(
        `Number of students absent scheduleGeneral: $${studentsToAbsentGeneral.length}`,
      );
      this.logger.log(
        `Number of students absent scheduleInd: $${studentsToAbsentInd.length}`,
      );
      for (const student of studentsToAbsentGeneral) {
        await this.attendanceRepository.save({
          arrivalDate: this.convertISODateToYYYYMMDD(currentDate),
          arrivalTime: currentDate,
          shift: shift,

          condition: ConditionAttendance.Absent,
          student: { id: student.id },
          typeSchedule: TypeSchedule.General,
        });
      }
      for (const student of studentsToAbsentInd) {
        await this.attendanceRepository.save({
          arrivalDate: this.convertISODateToYYYYMMDD(currentDate),
          arrivalTime: currentDate,
          shift: shift,

          condition: ConditionAttendance.Absent,
          student: { id: student.id },
          typeSchedule: TypeSchedule.Individual,
        });
      }
      this.logger.log(`Cron jobs completed succesfully`);
      return;
    }

    this.logger.log(
      `Number of students absent for today (${currentDate}) in the shift ${shift}: ${studentsToAbsent.length}`,
    );
    for (const student of studentsToAbsent) {
      await this.attendanceRepository.save({
        arrivalDate: this.convertISODateToYYYYMMDD(currentDate),
        arrivalTime: currentDate,
        shift: shift,
        typeSchedule: TypeSchedule.General,
        condition: ConditionAttendance.Absent,
        student: { id: student.id },
      });
    }

    this.logger.log(`Cron jobs completed succesfully`);
  }
}
