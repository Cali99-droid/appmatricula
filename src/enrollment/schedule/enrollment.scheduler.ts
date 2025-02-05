import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EnrollmentService } from '../enrollment.service';

@Injectable()
export class EnrollmentScheduler {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  // Ejecutar a las 09:01 AM todos los días para cerrar el turno de la mañana
  @Cron('0 1 * * 1-7')
  async handleUpdateReservations() {
    await this.enrollmentService.updateReservations();
  }
}
