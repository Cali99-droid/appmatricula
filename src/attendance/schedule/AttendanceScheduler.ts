import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AttendanceService } from '../attendance.service';
import { Shift } from '../enum/shift.enum';

@Injectable()
export class AttendanceScheduler {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Ejecutar a las 09:01 AM todos los días para cerrar el turno de la mañana
  @Cron('0 9 * * 1-6')
  async handleMorningShift() {
    await this.attendanceService.markAbsentStudentsCronGeneral(Shift.Morning);
  }

  // @Cron('0 12 * * 1-6')
  // async handleMorningShiftAux() {
  //   await this.attendanceService.markAbsentStudentsCronGeneral(Shift.Morning);
  // }

  // Ejecutar a las 14:01 PM todos los días para cerrar el turno de la tarde
  @Cron('0 14 * * 1-6')
  async handleAfternoonShift() {
    await this.attendanceService.markAbsentStudentsCronGeneral(Shift.Afternoon);
  }

  @Cron('0 17 * * 1-6')
  async handleIndividualSchedule() {
    await this.attendanceService.markAbsentStudentsCronIndividual();
  }
}
