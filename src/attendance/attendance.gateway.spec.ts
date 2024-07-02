import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceGateway } from './attendance.gateway';

describe('AttendanceGateway', () => {
  let gateway: AttendanceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendanceGateway],
    }).compile();

    gateway = module.get<AttendanceGateway>(AttendanceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
