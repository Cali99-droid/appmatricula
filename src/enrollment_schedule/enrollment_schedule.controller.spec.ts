import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentScheduleController } from './enrollment_schedule.controller';
import { EnrollmentScheduleService } from './enrollment_schedule.service';

describe('EnrollmentScheduleController', () => {
  let controller: EnrollmentScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentScheduleController],
      providers: [EnrollmentScheduleService],
    }).compile();

    controller = module.get<EnrollmentScheduleController>(EnrollmentScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
