import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YearsModule } from './years/years.module';
import { PhaseModule } from './phase/phase.module';
import { LevelModule } from './level/level.module';
import { GradeModule } from './grade/grade.module';
import { CampusModule } from './campus/campus.module';
import { CampusDetailModule } from './campus_detail/campus_detail.module';
import { ClassroomModule } from './classroom/classroom.module';
import { SchoolShiftsModule } from './school_shifts/school_shifts.module';
import { ExistIdConstraint } from './common/validation/exist-id-constraint';

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
    ClassroomModule,
    SchoolShiftsModule,
  ],
  providers: [ExistIdConstraint],
})
export class AppModule {}
