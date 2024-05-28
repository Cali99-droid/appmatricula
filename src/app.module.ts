import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { ActivityClassroomModule } from './activity_classroom/activity_classroom.module';
import { YearSubscriber } from './years/subscribers/year.subscriber';
import { PhaseSubscriber } from './phase/subscribers/phase.subscriber';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { PersonModule } from './person/person.module';
import { AttendanceModule } from './attendance/attendance.module';
import { HolidayModule } from './holiday/holiday.module';
import { DayOfWeekModule } from './day_of_week/day_of_week.module';
import { BimesterModule } from './bimester/bimester.module';
import { ScheduleModule } from './schedule/schedule.module';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { StudentModule } from './student/student.module';
import { DocsModule } from './docs/docs.module';
import { AppMiddleware } from './app.middleware';
import { AuthService } from './auth/auth.service';
import { FamilyModule } from './family/family.module';
import { RelationshipModule } from './relationship/relationship.module';
import { PermissionsModule } from './permissions/permissions.module';

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
      subscribers: [YearSubscriber, PhaseSubscriber],
    }),

    YearsModule,
    PhaseModule,
    LevelModule,
    GradeModule,
    CampusModule,
    CampusDetailModule,
    ClassroomModule,
    SchoolShiftsModule,
    ActivityClassroomModule,
    EnrollmentModule,
    PersonModule,
    AttendanceModule,
    AuthModule,
    UserModule,
    StudentModule,
    HolidayModule,
    DayOfWeekModule,
    BimesterModule,
    ScheduleModule,
    DocsModule,
    FamilyModule,
    RelationshipModule,
    PermissionsModule,
  ],
  providers: [ExistIdConstraint, AuthService],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AppMiddleware)
      .exclude(
        {
          path: '/auth/login',
          method: RequestMethod.POST,
        },
        {
          path: '/auth/register',
          method: RequestMethod.POST,
        },
        {
          path: '/person/crm',
          method: RequestMethod.POST,
        },
        {
          path: '/docs/download-carnets/:id',
          method: RequestMethod.GET,
        },

        {
          path: '/docs/download-carnet/student/:id',
          method: RequestMethod.GET,
        },
        {
          path: '/auth/refresh',
          method: RequestMethod.GET,
        },
        {
          path: '/auth/logout',
          method: RequestMethod.GET,
        },
      )
      .forRoutes('/*');
  }
}
