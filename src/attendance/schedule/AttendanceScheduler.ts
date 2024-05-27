import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AttendanceService } from '../attendance.service';
import { Shift } from '../enum/shift.enum';

@Injectable()
export class AttendanceScheduler {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Ejecutar a las 08:01 AM todos los días para cerrar el turno de la mañana
  @Cron('0 10 * * 1-6')
  async handleMorningShift() {
    await this.attendanceService.markAbsentStudents(Shift.M);
  }

  // Ejecutar a las 14:01 PM todos los días para cerrar el turno de la tarde
  @Cron('0 18 * * 1-6')
  async handleAfternoonShift() {
    await this.attendanceService.markAbsentStudents(Shift.A);
  }
}
