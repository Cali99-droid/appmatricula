import { Repository } from 'typeorm';
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

@Injectable()
export class CompetencyService {
  private readonly logger = new Logger('competencyService');
  constructor(
    @InjectRepository(Competency)
    private readonly competencyRepository: Repository<Competency>,
    @InjectRepository(TeacherAssignment)
    private readonly teacherAssignmentRepository: Repository<TeacherAssignment>,
  ) {}

  async create(createCompetencyDto: CreateCompetencyDto) {
    try {
      const newEntry = this.competencyRepository.create({
        name: createCompetencyDto.name,
        course: { id: createCompetencyDto.courseId },
        status: true,
      });
      const competency = await this.competencyRepository.save(newEntry);
      return competency;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(courseId?: number) {
    const competencys = await this.competencyRepository.find({
      where: { course: { id: isNaN(courseId) ? undefined : courseId } },
      relations: { course: true },
      order: {
        name: 'ASC',
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
    const { courseId, ...rest } = updateCompetencyDto;
    const competency = await this.competencyRepository.preload({
      id: id,
      course: { id: courseId },
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

  // ** COMPETENCIAS POR DOCENTE */
  async assignToTeacher(
    createTeacherCompetencyDto: CreateTeacherCompetencyDto,
  ) {
    const { activityClassroomId, competencyId, userId } =
      createTeacherCompetencyDto;
    try {
      const teacherAssignmentCreated = this.teacherAssignmentRepository.create({
        activityClassroom: { id: activityClassroomId },
        competency: { id: competencyId },
        user: { id: userId },
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
      competency: { id: updateTeacherCompetencyDto.competencyId },
      // phase: { id: updateTeacherCompetencyDto.phaseId },
      user: { id: updateTeacherCompetencyDto.userId },
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

  async getAssignToTeacher(queryTeacherCompetencyDto: GetTeacherAssignmentDto) {
    const { activityClassroomId, userId } = queryTeacherCompetencyDto;
    const whereCondition: any = {};

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
    try {
      const assignments = await this.teacherAssignmentRepository.find({
        where: whereCondition,
        relations: {
          user: { person: true },
        },
        order: {
          competency: 'DESC',
        },
      });
      const formatAssignments = assignments.map((assignment) => {
        const person = assignment.user?.person;
        const grade = assignment.activityClassroom?.grade;
        const level = grade?.level;
        const course = assignment.competency?.course;
        const area = assignment.competency?.area?.name || course?.area?.name;

        return {
          id: assignment.id,
          classroom: `${level?.name} - ${grade?.name} ${assignment.activityClassroom?.section}`,
          area: area || 'Sin área',
          course: course?.name || 'Sin curso',
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
