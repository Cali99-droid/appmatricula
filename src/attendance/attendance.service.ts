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
import { DayOfWeek } from 'src/day_of_week/entities/day_of_week.entity';

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
    @InjectRepository(DayOfWeek)
    private readonly daysRepository: Repository<DayOfWeek>,
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
    const currentDay: Day = this.getDayEnumValue(currentDate.getDay());
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
          `Inicie sesión con un usuario autorizado para esta sede o use un carnet válido`,
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
      /**Validar si esta dentro de los dias configurados */
      const daysObject = await this.daysRepository.find({
        select: {
          name: true,
        },
        where: {
          status: true,
          year: { id: yearId },
        },
      });

      const days = daysObject.map((item) => item.name);

      if (!days.includes(currentDay)) {
        throw new BadRequestException(
          `No se puede marcar asistencia, este día no fue configurado como parte de las clases ${currentDate}`,
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
          if (
            !(
              currentTime >= initAttendanceTime &&
              currentTime <= finishAttendanceTime
            )
          ) {
            console.log(endHour);
            throw new BadRequestException(
              `No puede verificar la asistencia en este momento, espere hasta: ${initAttendanceTime}`,
            );
          }
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

        const attendance = this.attendanceRepository.create({
          shift: Shift.Extra,

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
        if (
          !(
            currentTime >= initAttendanceTime &&
            currentTime <= finishAttendanceTime
          )
        ) {
          throw new BadRequestException(
            `No puede verificar la asistencia en este momento, espere hasta: ${initAttendanceTime}`,
          );
        }
        cutoffTime.setHours(startHour, startMinute, startSecond, 0);
        if (currentTime.getHours() < 12) {
          condition =
            currentTime <= cutoffTime
              ? ConditionAttendance.Early
              : ConditionAttendance.Late;
        } else {
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
  async findLastFiveRecords(user: User) {
    // Obtener usuario con asignaciones y roles
    const userWithRelations = await this.userRepository.findOne({
      where: { email: user.email },
      relations: ['assignments.campusDetail', 'roles.permissions'],
    });

    if (!userWithRelations) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener permisos y determinar si es admin
    const permissions = new Set(
      userWithRelations.roles.flatMap((role) =>
        role.permissions.map((perm) => perm.name),
      ),
    );
    const isAdmin = permissions.has('admin');
    const campusDetailIds = userWithRelations.assignments.map(
      (assignment) => assignment.campusDetail.id,
    );

    // Construir opciones de consulta para asistencias
    const attendanceOptions: any = {
      order: { arrivalTime: 'DESC' },
      take: 5,
      relations: [
        'student.enrollment.activityClassroom.grade.level',
        'student.enrollment.activityClassroom.classroom',
      ],
    };

    if (!isAdmin) {
      attendanceOptions.where = {
        student: {
          enrollment: {
            activityClassroom: {
              classroom: { campusDetail: { id: In(campusDetailIds) } },
            },
          },
        },
      };
    }

    // Realizar consulta para obtener las últimas cinco asistencias
    const attendances = await this.attendanceRepository.find(attendanceOptions);

    // Convertir horas de llegada a zona horaria específica
    const timeZone = 'America/Lima';
    const utcAttendance = attendances.map((attendance) => ({
      ...attendance,
      arrivalTime: moment
        .utc(attendance.arrivalTime)
        .tz(timeZone)
        .format('YYYY-MM-DD HH:mm:ss'),
    }));

    // Obtener configuración de URLs y avatar predeterminado
    const urlS3 = this.configService.getOrThrow('FULL_URL_S3');
    const defaultAvatar = this.configService.getOrThrow('AVATAR_NAME_DEFAULT');

    // Formatear datos finales de asistencias
    const formatAttendances = utcAttendance.map((attendance) => {
      const { student, ...restAttendance } = attendance;
      const personData = student.person;
      const latestEnrollment = student.enrollment.reduce(
        (latest, current) => (current.id > latest.id ? current : latest),
        student.enrollment[0],
      );
      const classroomInfo = `${latestEnrollment.activityClassroom.grade.name} ${latestEnrollment.activityClassroom.section} ${latestEnrollment.activityClassroom.grade.level.name}`;

      return {
        ...restAttendance,
        student: {
          ...personData,
          photo: student.photo
            ? `${urlS3}${student.photo}`
            : `${urlS3}${defaultAvatar}`,
        },
        classroom: classroomInfo,
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
  /**FOR CRON JOBS, OBS TOFDO coloca a todos como ausentes en la madrugada
   *
   */

  async markAbsentStudentsCronGeneral(shift: Shift): Promise<void> {
    this.logger.log(`Running cron jobs for the shift:${shift}`);
    const currentDate = new Date();
    const currentDay: Day = this.getDayEnumValue(currentDate.getDay());

    //**Validar Fase  */
    const qbphase = this.phaseRepository.createQueryBuilder('phase');
    const phase = await qbphase
      .leftJoinAndSelect('phase.year', 'year')
      .leftJoinAndSelect('phase.bimester', 'bimester')
      .where('phase.startDate <=:currentDate', {
        currentDate: this.convertISODateToYYYYMMDD(currentDate),
      })
      .andWhere('phase.endDate>=:currentDate', {
        currentDate: this.convertISODateToYYYYMMDD(currentDate),
      })
      .getOne();
    if (!phase) {
      this.logger.warn(
        `There is no active phase for this date: ${currentDate}, the cron jobs were not completed`,
      );
      return;
    }
    //** verificar que la fecha se encuentre en un bimestre*/
    const bimesters = phase.bimester;
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
      this.logger.warn(
        `There is no active bimester for this date: ${currentDate}, the cron jobs were not completed`,
      );
      return;
    }
    //**Validar si es feriado */
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
    //**Validar si esta dentro de los dias configurados */
    const daysObject = await this.daysRepository.find({
      select: {
        name: true,
      },
      where: {
        status: true,
        year: { id: yearId },
      },
    });

    const days = daysObject.map((item) => item.name);

    if (!days.includes(currentDay)) {
      this.logger.verbose(`This day was not set for classes. ${currentDay}`);
      return;
    }

    const queryBuilder =
      this.attendanceRepository.createQueryBuilder('attendance');
    const attendances = await queryBuilder
      .leftJoinAndSelect('attendance.student', 'student')
      .where(`arrivalDate=:dateNow and shift =:shift`, {
        dateNow: this.convertISODateToYYYYMMDD(currentDate),
        shift: shift,
      })
      .andWhere(`attendance.typeSchedule=:type`, {
        type: TypeSchedule.General,
      })
      .getMany();

    const studentPresentCodes = attendances.map(
      (attendance) => attendance.student.id,
    );

    const activityClassroomsShift =
      await this.activityClassroomRepository.findBy({
        schoolShift: {
          shift: shift,
        },
      });
    if (activityClassroomsShift.length === 0) {
      this.logger.verbose(`No Classroom for this shift. ${shift}`);
      return;
    }
    const idsActivityClassroomsShift = activityClassroomsShift.map(
      (item) => item.id,
    );
    const shiftEnrrollments = await this.enrrollmentRepository
      .createQueryBuilder('enrroll')
      .leftJoinAndSelect('enrroll.student', 'student')
      .where('activityClassroomId IN (:...idsActivityClassroomsShift)', {
        idsActivityClassroomsShift,
      })
      .getMany();

    const shiftStudents = shiftEnrrollments.map((item) => item.student);

    const absentStudents = shiftStudents.filter(
      (student) => !studentPresentCodes.includes(student.id),
    );

    this.logger.log(
      `Number of students absent for today (${currentDate}) in the shift ${shift}: ${absentStudents.length}`,
    );
    for (const student of absentStudents) {
      await this.attendanceRepository.save({
        arrivalDate: this.convertISODateToYYYYMMDD(currentDate),
        arrivalTime: currentDate,
        shift: shift,
        typeSchedule: TypeSchedule.General,
        condition: ConditionAttendance.Absent,
        student: { id: student.id },
      });
    }

    this.logger.log(
      `Cron jobs for ${shift} general shift completed succesfully`,
    );
    return;
  }

  async markAbsentStudentsCronIndividual(): Promise<void> {
    this.logger.log(`Running cron jobs for the Individual schedule`);
    const currentDate = new Date();
    const currentDay: Day = this.getDayEnumValue(currentDate.getDay());
    //**Validar Fase  */
    const qbphase = this.phaseRepository.createQueryBuilder('phase');
    const phase = await qbphase
      .leftJoinAndSelect('phase.year', 'year')
      .leftJoinAndSelect('phase.bimester', 'bimester')
      .where('phase.startDate <=:currentDate', {
        currentDate: this.convertISODateToYYYYMMDD(currentDate),
      })
      .andWhere('phase.endDate>=:currentDate', {
        currentDate: this.convertISODateToYYYYMMDD(currentDate),
      })
      .getOne();
    if (!phase) {
      this.logger.warn(
        `There is no active phase for this date: ${currentDate}, the cron jobs were not completed`,
      );
      return;
    }
    //** verificar que la fecha se encuentre en un bimestre*/
    const bimesters = phase.bimester;
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
      this.logger.warn(
        `There is no active bimester for this date: ${currentDate}, the cron jobs were not completed`,
      );
      return;
    }
    //**Validar si es feriado */
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
    //**Validar si esta dentro de los dias configurados */
    const daysObject = await this.daysRepository.find({
      select: {
        name: true,
      },
      where: {
        status: true,
        year: { id: yearId },
      },
    });

    const days = daysObject.map((item) => item.name);

    if (!days.includes(currentDay)) {
      this.logger.verbose(`This day was not set for classes. ${currentDay}`);
      return;
    }
    const queryBuilder =
      this.attendanceRepository.createQueryBuilder('attendance');
    const attendances = await queryBuilder
      .leftJoinAndSelect('attendance.student', 'student')
      .where(`arrivalDate=:dateNow `, {
        //and shift =:shift
        dateNow: this.convertISODateToYYYYMMDD(currentDate),
        // shift: shift,
      })
      .andWhere(`attendance.typeSchedule=:type`, {
        type: TypeSchedule.Individual,
      })
      .getMany();
    const studentPresentCodes = attendances.map(
      (attendance) => attendance.student.id,
    );
    const activityClassroomsWhitSchedule =
      await this.activityClassroomRepository.findBy({
        phase: {
          id: phase.id,
        },
        schedule: {
          day: currentDay,
        },
      });

    /** obtener Matriculados en las aulas que tienen horario individual */
    const classroomsIds = activityClassroomsWhitSchedule.map((item) => item.id);
    const enrollsSchedule = await this.enrrollmentRepository.find({
      where: {
        activityClassroom: { id: In(classroomsIds) },
      },
    });

    const shiftStudents = enrollsSchedule.map((item) => item.student);
    const absentStudents = shiftStudents.filter(
      (student) => !studentPresentCodes.includes(student.id),
    );

    this.logger.log(
      `Number of students absent for today (${currentDate}) in the individual schedule: ${absentStudents.length}`,
    );
    for (const student of absentStudents) {
      await this.attendanceRepository.save({
        arrivalDate: this.convertISODateToYYYYMMDD(currentDate),
        arrivalTime: currentDate,
        shift: Shift.Extra,
        typeSchedule: TypeSchedule.Individual,
        condition: ConditionAttendance.Absent,
        student: { id: student.id },
      });
    }

    this.logger.log(
      `Cron jobs for the individual schedule  completed succesfully`,
    );
    return;
  }
}
