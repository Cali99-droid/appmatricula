import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { YearsModule } from './../src/years/years.module';
import { Year } from './../src/years/entities/year.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Campus } from './../src/campus/entities/campus.entity';

describe('YearController (e2e)', () => {
  let app: INestApplication;

  const mockYearRepository = {
    find: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest
      .fn()
      .mockImplementation((year) =>
        Promise.resolve({ id: Date.now(), ...year }),
      ),
  };

  const mockCampusRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [YearsModule],
    })
      .overrideProvider(getRepositoryToken(Year))
      .useValue(mockYearRepository)
      .overrideProvider(getRepositoryToken(Campus))
      .useValue(mockCampusRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        // transform: true,
        // whitelist: true,
        // forbidNonWhitelisted: true,
        // transformOptions: {
        //   enableImplicitConversion: true,
        // },
      }),
    );
    await app.init();
  });

  it('/years (GET)', () => {
    return (
      request(app.getHttpServer())
        .get('/years')
        // .expect('Content-Type', /json/)
        .expect(200)
    );
  });

  it('/years (POST)', async () => {
    return request(app.getHttpServer())
      .post('/years')
      .send({
        name: '2023',
        startDate: '2023-01-01',
        endDate: '2023-12-12',
        status: true,
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual({
          id: expect.any(Number),
          name: '2023',
          startDate: '2023-01-01',
          endDate: '2023-12-12',
          status: true,
        });
      });
  });
  it('/years (POST) ----> VALIDATE 400', async () => {
    return request(app.getHttpServer())
      .post('/years')
      .send({
        name: '2023',
        endDate: '2023-01-01',
        startDate: '2023-12-12',
        status: true,
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .expect({
        message: ['endDate must be after startDate'],
        error: 'Bad Request',
        statusCode: 400,
      });
  });
});
