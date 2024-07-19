import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentScheduleService } from './enrollment_schedule.service';

describe('EnrollmentScheduleService', () => {
  let service: EnrollmentScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnrollmentScheduleService],
    }).compile();

    service = module.get<EnrollmentScheduleService>(EnrollmentScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
