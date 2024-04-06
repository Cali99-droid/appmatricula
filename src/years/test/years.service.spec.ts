import { Test, TestingModule } from '@nestjs/testing';
import { YearsService } from '../years.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Year } from '../entities/year.entity';

describe('YearsService', () => {
  let service: YearsService;

  const mockYearsRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest
      .fn()
      .mockImplementation((year) =>
        Promise.resolve({ id: Date.now(), ...year }),
      ),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YearsService,
        {
          provide: getRepositoryToken(Year),
          useValue: mockYearsRepository,
        },
      ],
    }).compile();

    service = module.get<YearsService>(YearsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new Year record and return that', async () => {
    expect(
      await service.create({
        name: '2023',
        endDate: '2023-01-01',
        startDate: '2023-12-12',
        status: true,
      }),
    ).toEqual({
      id: expect.any(Number),
      name: '2023',
      endDate: '2023-01-01',
      startDate: '2023-12-12',
      status: expect.any(Boolean),
    });
  });
});
