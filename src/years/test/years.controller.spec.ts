import { Test, TestingModule } from '@nestjs/testing';
import { YearsController } from '../years.controller';
import { YearsService } from '../years.service';

describe('YearsController', () => {
  let controller: YearsController;

  const mockYearsService = {
    create: jest.fn((dto) => {
      return {
        id: Date.now(),
        ...dto,
        // status: true,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YearsController],
      providers: [YearsService],
    })
      .overrideProvider(YearsService)
      .useValue(mockYearsService)
      .compile();

    controller = module.get<YearsController>(YearsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should create new Year', () => {
    const createYearDto = {
      name: '2023',
      endDate: '2023-01-01',
      startDate: '2023-12-12',
      status: true,
    };
    expect(controller.create(createYearDto)).toEqual({
      id: expect.any(Number),
      name: createYearDto.name,
      endDate: createYearDto.endDate,
      startDate: createYearDto.startDate,
      status: expect.any(Boolean),
    });
    // .toBeDefined();
    expect(mockYearsService.create).toHaveBeenCalledWith(createYearDto);
  });
});
