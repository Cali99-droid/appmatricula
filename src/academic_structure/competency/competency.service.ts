import { Not, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { Competency } from './entities/competency.entity';

import { CreateTeacherCompetencyDto } from './dto/create-teacher-assignment.dto';
import { TeacherAssignment } from './entities/teacher_assignment.entity';
import { UpdateTeacherCompetencyDto } from './dto/update-teacher-assignment.dto';
import { GetTeacherAssignmentDto } from './dto/get-teacher-assignment.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CompetencyService {
  private readonly logger = new Logger('competencyService');
  constructor(
    @InjectRepository(Competency)
    private readonly competencyRepository: Repository<Competency>,
    @InjectRepository(TeacherAssignment)
    private readonly teacherAssignmentRepository: Repository<TeacherAssignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCompetencyDto: CreateCompetencyDto) {
    if (createCompetencyDto.order < 1)
      throw new NotFoundException(`Order must be greater than 0`);
    const existCompetency = await this.competencyRepository.findOneBy({
      order: createCompetencyDto.order,
      area: { id: createCompetencyDto.areaId },
    });
    if (existCompetency) {
      throw new BadRequestException(
        `Competency with order ${createCompetencyDto.order} already exists`,
      );
    }
    try {
      const newEntry = this.competencyRepository.create({
        name: createCompetencyDto.name,
        area: { id: createCompetencyDto.areaId },
        order: createCompetencyDto.order,
        status: true,
      });
      const competency = await this.competencyRepository.save(newEntry);
      return competency;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(courseId?: number, areaId?: number) {
    const competencys = await this.competencyRepository.find({
      where: {
        area: { id: isNaN(areaId) ? undefined : areaId },
      },
      order: {
        order: 'ASC',
      },
    });
    return competencys;
  }

  async findOne(id: number) {
    const competency = await this.competencyRepository.findOne({
      where: { id: id },
    });
    if (!competency)
      throw new NotFoundException(`Competency with id ${id} not found`);
    return competency;
  }

  async update(id: number, updateCompetencyDto: UpdateCompetencyDto) {
    const { areaId, ...rest } = updateCompetencyDto;
    const existCompetency = await this.competencyRepository.findOne({
      where: {
        id: Not(id),
        order: updateCompetencyDto.order,
        area: { id: updateCompetencyDto.areaId },
      },
    });

    if (existCompetency) {
      throw new BadRequestException(
        `Competency with order ${updateCompetencyDto.order} already exists in the specified area.`,
      );
    }
    const competency = await this.competencyRepository.preload({
      id: id,
      area: { id: areaId },
      ...rest,
    });
    if (!competency)
      throw new NotFoundException(`Competency with id: ${id} not found`);
    try {
      await this.competencyRepository.save(competency);
      return competency;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    const competency = await this.competencyRepository.findOneBy({ id });
    if (!competency)
      throw new NotFoundException(`Competency by id: '${id}' not found`);
    try {
      await this.competencyRepository.remove(competency);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  // ** CURSOS POR DOCENTE */
  async assignToTeacher(
    createTeacherCompetencyDto: CreateTeacherCompetencyDto,
  ) {
    const { activityClassroomId, areaId, userId, courseId, isTutor } =
      createTeacherCompetencyDto;

    if (areaId && courseId) {
      throw new BadRequestException(
        'You cannot send areaId and courseId in the same request, only one of them.',
      );
    }
    try {
      const teacherAssignmentCreated = this.teacherAssignmentRepository.create({
        activityClassroom: { id: activityClassroomId },
        area: { id: areaId },
        course: { id: courseId },
        user: { id: userId },
        isTutor: isTutor,
        // phase: { id: phaseId },
      });

      return await this.teacherAssignmentRepository.save(
        teacherAssignmentCreated,
      );
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async updateAssignToTeacher(
    id: number,
    updateTeacherCompetencyDto: UpdateTeacherCompetencyDto,
  ) {
    const teacherCompetency = await this.teacherAssignmentRepository.preload({
      id: id,
      activityClassroom: { id: updateTeacherCompetencyDto.activityClassroomId },
      area: { id: updateTeacherCompetencyDto.areaId },
      course: { id: updateTeacherCompetencyDto.courseId },
      user: { id: updateTeacherCompetencyDto.userId },
      isTutor: updateTeacherCompetencyDto.isTutor,
    });

    if (!teacherCompetency)
      throw new NotFoundException(
        `teacher Competency with id: ${id} not found`,
      );
    try {
      await this.teacherAssignmentRepository.save(teacherCompetency);
      return teacherCompetency;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async getAssignToTeacher(
    queryTeacherCompetencyDto: GetTeacherAssignmentDto,
    user: any,
  ) {
    const { activityClassroomId, userId } = queryTeacherCompetencyDto;
    const whereCondition: any = {};
    const roles = user.resource_access['client-test-appae'].roles as any[];

    const autPerm = [
      'administrador-colegio',
      // 'secretaria',
      // 'administrador-sede',
      // 'generador-carnet',
    ];

    const isAdmin = roles.some((e) => autPerm.includes(e));
    if (isAdmin) {
      if (userId) {
        whereCondition.user = {
          id: +userId,
        };
      }

      if (activityClassroomId) {
        whereCondition.activityClassroom = {
          id: +activityClassroomId,
        };
      }
    } else {
      const us = await this.userRepository.findOne({
        where: {
          email: user.email,
        },
      });

      whereCondition.user = {
        id: us.id,
      };
    }

    try {
      const assignments = await this.teacherAssignmentRepository.find({
        where: whereCondition,
        relations: {
          user: { person: true },
          course: {
            area: true,
          },
        },
        order: {
          area: { order: 'DESC' },
        },
      });
      const formatAssignments = assignments.map((assignment) => {
        const person = assignment.user?.person;
        const grade = assignment.activityClassroom?.grade;
        const level = grade?.level;
        // const course = assignment.competency?.course;
        const course = assignment.course;
        // const area = assignment.competency?.area?.name || course?.area?.name;
        const area = assignment.area?.name;

        return {
          id: assignment.id,
          activityClassroomId: assignment.activityClassroom.id,
          classroom: `${level?.name} - ${grade?.name} ${assignment.activityClassroom?.section}`,
          areaId: assignment.area?.id || course?.area.id,
          area: area || course?.area.name.toLocaleUpperCase(),
          isTutor: assignment.isTutor,
          // course: course?.name || 'Sin curso',
          courseId: assignment.course?.id || null,
          course: course?.name.toLocaleUpperCase() || null,
          teacherId: assignment.user.id,
          teacher:
            `${person?.lastname ?? ''} ${person?.mLastname ?? ''} ${person?.name ?? ''}`.trim(),
        };
      });
      return formatAssignments;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async deleteAssignToTeacher(id: number) {
    try {
      const teacherAssignment =
        await this.teacherAssignmentRepository.findOneByOrFail({ id });
      await this.teacherAssignmentRepository.remove(teacherAssignment);
    } catch (error) {
      // handleDBExceptions(error, this.logger);
      // this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }
}
