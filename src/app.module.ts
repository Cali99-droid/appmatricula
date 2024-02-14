import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YearsModule } from './years/years.module';
import { PhaseModule } from './phase/phase.module';
import { LevelModule } from './level/level.module';
import { GradeModule } from './grade/grade.module';
import { CampusModule } from './campus/campus.module';
import { CampusDetailModule } from './campus_detail/campus_detail.module';
import { SchoolShiftsModule } from './school_shifts/school_shifts.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    YearsModule,
    PhaseModule,
    LevelModule,
    GradeModule,
    CampusModule,
    CampusDetailModule,
    SchoolShiftsModule,
  ],
})
export class AppModule {}
