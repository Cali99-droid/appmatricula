import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { CreateActivityClassroomDto } from './dto/create-activity_classroom.dto';
import { UpdateActivityClassroomDto } from './dto/update-activity_classroom.dto';
import { ActivityClassroom } from './entities/activity_classroom.entity';

import { SearchClassroomsDto } from 'src/common/dto/search-classrooms.dto';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { Ascent } from 'src/enrollment/entities/ascent.entity';
import { Status } from 'src/enrollment/enum/status.enum';
@Injectable()
export class ActivityClassroomService {
  private readonly logger = new Logger('ActivityClassroomService');
  constructor(
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ascent)
    private readonly ascentRepository: Repository<Ascent>,
  ) {}
  async create(createActivityClassroomDto: CreateActivityClassroomDto) {
    // Combinando las condiciones en un único objeto de consulta
    const exists = await this.activityClassroomRepository.findOne({
      where: [
        {
          classroom: { id: createActivityClassroomDto.classroomId },
          grade: { id: createActivityClassroomDto.gradeId },
          schoolShift: { id: createActivityClassroomDto.schoolShiftId },
          phase: { id: createActivityClassroomDto.phaseId },
        },
      ],
    });

    if (exists) {
      throw new BadRequestException(
        'ActivityClassroom not available, existing section or shift',
      );
    }

    try {
      // Creación directa y guardado de la entidad con relaciones en un paso
      const activityClassroom = this.activityClassroomRepository.create({
        ...createActivityClassroomDto,
        classroom: { id: createActivityClassroomDto.classroomId },
        phase: { id: createActivityClassroomDto.phaseId },
        grade: { id: createActivityClassroomDto.gradeId },
        schoolShift: { id: createActivityClassroomDto.schoolShiftId },
      });

      await this.activityClassroomRepository.save(activityClassroom);
      return activityClassroom;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const activityClassrooms = await this.activityClassroomRepository.find({
      relations: {
        classroom: true,
        phase: true,
        grade: true,
        schoolShift: true,
      },
      order: {
        grade: { name: 'ASC' },
        section: 'ASC',
      },
    });
    return activityClassrooms;
  }

  async findOne(id: number) {
    try {
      const activityClassroom =
        await this.activityClassroomRepository.findOneByOrFail({ id });
      return activityClassroom;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async update(
    id: number,
    updateActivityClassroomDto: UpdateActivityClassroomDto,
  ) {
    const classroom = await this.activityClassroomRepository.preload({
      id: id,
      section: updateActivityClassroomDto.section,
      classroom: { id: updateActivityClassroomDto.classroomId },
      grade: { id: updateActivityClassroomDto.gradeId },
      phase: { id: updateActivityClassroomDto.phaseId },
      schoolShift: { id: updateActivityClassroomDto.schoolShiftId },
    });
    if (!classroom)
      throw new NotFoundException(`ActivityClassroom with id: ${id} not found`);
    //**Validate exist section or turn */
    const existingActivityClassroom =
      await this.activityClassroomRepository.findOne({
        where: [
          {
            classroom: { id: updateActivityClassroomDto.classroomId },
            grade: { id: updateActivityClassroomDto.gradeId },
            schoolShift: { id: updateActivityClassroomDto.schoolShiftId },
            phase: { id: updateActivityClassroomDto.phaseId },
          },
        ],
      });
    if (existingActivityClassroom != undefined) {
      if (id != existingActivityClassroom.id) {
        throw new BadRequestException(
          `An ActivityClassroom with already exists.`,
        );
      }
    }
    try {
      await this.activityClassroomRepository.save(classroom);

      return classroom;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    try {
      const classroom = await this.activityClassroomRepository.findOneByOrFail({
        id,
      });
      await this.activityClassroomRepository.remove(classroom);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  async searchParams(searchClassroomsDto: SearchClassroomsDto, user: any) {
    try {
      const { yearId, phaseId, campusId, levelId } = searchClassroomsDto;
      const roles = user.resource_access['appcolegioae'].roles;
      // Obtener el usuario con las relaciones necesarias
      const us = await this.userRepository.findOne({
        where: {
          email: user.email,
        },
        relations: {
          assignmentsClassroom: {
            activityClassroom: true,
          },
        },
      });
      // Recopilar permisos del usuario
      // const permissions = new Set(
      //   us.roles.flatMap((role) => role.permissions.map((perm) => perm.name)),
      // );
      // const per = us.roles.flatMap((role) =>
      //   role.permissions.map((perm) => perm.name),
      // ); kk
      //
      const whereCondition: any = {
        phase: {
          id: !isNaN(+phaseId) ? +phaseId : undefined,
          year: { id: !isNaN(+yearId) ? +yearId : undefined },
        },
        classroom: {
          campusDetail: !isNaN(+campusId) ? { id: +campusId } : {},
        },
        grade: {
          level: !isNaN(+levelId) ? { id: +levelId } : {},
        },
      };
      const autPerm = [
        'administrador-colegio',
        'cordinador-academico',
        'secretaria',
        'administrador-sede',
        'generador-carnet',
        'cordinador-academico',
      ];

      const isAdmin = roles.some((e) => autPerm.includes(e));
      if (!isAdmin) {
        const acIds = us.assignmentsClassroom.map(
          (item) => item.activityClassroom.id,
        );
        whereCondition.assignmentClassroom = {
          activityClassroom: { id: In(acIds) },
        };
      }

      // const autPerm = [
      //   'admin',
      //   'card-generator',
      //   // 'report',
      //   'students',
      //   'families',
      // ];

      // const isAdmin = per.some((e) => autPerm.includes(e));
      // if (!isAdmin && !per.includes('report')) {
      //   const acIds = us.assignmentsClassroom.map(
      //     (item) => item.activityClassroom.id,
      //   );
      //   whereCondition.assignmentClassroom = {
      //     activityClassroom: { id: In(acIds) },
      //   };
      // }
      // let classrooms: ActivityClassroom[];d

      const classrooms = await this.activityClassroomRepository.find({
        where: whereCondition,
        // relations: {
        //   classroom: true,
        //   phase: true,
        //   grade: true,
        //   // schoolShift: true,
        //   assignmentClassroom: true,
        // },
        order: {
          grade: { name: 'ASC' },
          section: 'ASC',
        },
      });
      return classrooms;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async searchClassrooms(searchClassroomsDto: SearchClassroomsDto) {
    try {
      const { yearId, phaseId, campusId, levelId } = searchClassroomsDto;
      // Obtener el usuario con las relaciones necesarias
      // const us = await this.userRepository.findOne({
      //   where: {
      //     email: user.email,
      //   },
      //   relations: {
      //     assignmentsClassroom: {
      //       activityClassroom: true,
      //     },
      //     roles: {
      //       permissions: true,
      //     },
      //   },
      // });
      // Recopilar permisos del usuario
      // const permissions = new Set(
      //   us.roles.flatMap((role) => role.permissions.map((perm) => perm.name)),
      // );
      // const per = us.roles.flatMap((role) =>
      //   role.permissions.map((perm) => perm.name),
      // );

      const whereCondition: any = {
        phase: {
          id: !isNaN(+phaseId) ? +phaseId : undefined,
          year: { id: !isNaN(+yearId) ? +yearId : undefined },
        },
        classroom: {
          campusDetail: !isNaN(+campusId) ? { id: +campusId } : {},
        },
        grade: {
          level: !isNaN(+levelId) ? { id: +levelId } : {},
        },
      };
      // const autPerm = [
      //   'admin',
      //   'card-generator',
      //   // 'report',
      //   'students',
      //   'families',
      // ];

      // const isAdmin = per.some((e) => autPerm.includes(e));
      // if (!isAdmin && !per.includes('report')) {
      //   const acIds = us.assignmentsClassroom.map(
      //     (item) => item.activityClassroom.id,
      //   );
      //   whereCondition.assignmentClassroom = {
      //     activityClassroom: { id: In(acIds) },
      //   };
      // }
      // let classrooms: ActivityClassroom[];d

      const classrooms = await this.activityClassroomRepository.find({
        where: whereCondition,
        // relations: {
        //   classroom: true,
        //   phase: true,
        //   grade: true,
        //   // schoolShift: true,
        //   assignmentClassroom: true,
        // },
        order: {
          // grade: { name: 'ASC' },
          // section: 'ASC',
        },
      });
      const formattedData = classrooms.map((c) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { level, ...grade } = c.grade;
        const { campusDetail } = c.classroom;
        return {
          id: c.id,
          grade: grade,
          section: c.section,
          phase: c.phase.type,
          year: c.phase.year.name,
          yearId: c.phase.year.id,
          classroom: c.classroom.code,
          campusId: campusDetail.id,
          capacity: c.classroom.capacity,
          level: c.grade.level.name,
          modality: c.classroom.modality,
        };
      });
      const data = await Promise.all(
        formattedData.map(async (ac) => {
          const configAscent = await this.ascentRepository.find({
            where: { originId: { id: ac.id }, year: { id: ac.yearId } },
          });

          if (configAscent.length > 0) {
            const data = configAscent.map((c) => {
              return {
                id: c.destinationId.id,
                section: c.destinationId.section,
                grade: c.destinationId.grade.name,
                campus: c.destinationId.classroom.campusDetail.name,
              };
            });
            return {
              ...ac,
              ascent: data,
            };
          } else {
            // let nextYearClassroom;
            // nextYearClassroom = await this.activityClassroomRepository.findOne({
            //   where: {
            //     grade: { position: ac.grade.position + 1 },
            //     section: ac.section,
            //     phase: { year: { name: (parseInt(ac.year) + 1).toString() } },
            //   },
            // });

            // const campusNext = nextYearClassroom
            //   ? nextYearClassroom.classroom.campusDetail.id
            //   : 0;
            // const campusAct = ac.campusId;

            // if (campusNext !== campusAct) {
            //   console.log('son diferentes', ac.id);
            //   nextYearClassroom =
            //     await this.activityClassroomRepository.findOne({
            //       where: {
            //         grade: { position: ac.grade.position + 1 },
            //         classroom: { campusDetail: { id: campusAct } },
            //         phase: {
            //           year: { name: (parseInt(ac.year) + 1).toString() },
            //         },
            //       },
            //     });
            // }

            const nextYearClassroom =
              await this.activityClassroomRepository.findOne({
                where: {
                  grade: { position: ac.grade.position + 1 },
                  section: ac.section,
                  phase: { year: { name: (parseInt(ac.year) + 1).toString() } },
                },
              });

            return {
              ...ac,
              ascent: nextYearClassroom
                ? [
                    {
                      id: nextYearClassroom.id,
                      section: nextYearClassroom.section,
                      grade: nextYearClassroom.grade.name,
                      campus: nextYearClassroom.classroom.campusDetail.name,
                    },
                  ]
                : null,
            };
          }
        }),
      );

      return data;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findStudents(id: number) {
    try {
      const urlS3 = this.configService.getOrThrow('AWS_URL_BUCKET');
      const folderName = this.configService.getOrThrow('FOLDER_IMG_NAME');
      const defaultAvatar = this.configService.getOrThrow(
        'AVATAR_NAME_DEFAULT',
      );
      const urlPhoto = `${urlS3}${folderName}`;
      const activityClassroom = await this.activityClassroomRepository.findOne({
        relations: {
          enrollment: {
            student: {
              person: true,
            },
          },
        },
        where: {
          id,
          enrollment: {
            status: In([Status.MATRICULADO, Status.FINALIZADO]),
          },
        },
        order: {
          enrollment: {
            student: {
              person: {
                lastname: 'ASC',
                mLastname: 'ASC',
              },
            },
          },
        },
      });
      const formatData = activityClassroom.enrollment.map((e) => ({
        id: e.student.id,
        name: e.student.person.name,
        lastname: e.student.person.lastname,
        mLastname: e.student.person.mLastname,
        docNumber: e.student.person.docNumber,
        studentCode:
          e.student.studentCode === null ? 'none' : e.student.studentCode,
        photo: e.student.photo
          ? `${urlPhoto}/${e.student.photo}`
          : `${urlPhoto}/${defaultAvatar}`,
        enrollmentId: e.id,
      }));
      return formatData;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**config ascent */

  async findAscent(id: number) {
    try {
      const ac = await this.activityClassroomRepository.findOneBy({ id });
      const position = ac.grade.position;
      const year = ac.phase.year.name;
      //TODO la validación por año debe ser dinamica
      const listAscent = await this.activityClassroomRepository.find({
        where: {
          grade: {
            position: position + 1,
          },
          phase: {
            year: {
              name: (parseInt(year) + 1).toString(),
            },
          },
        },
      });
      const format = listAscent.map((ac) => {
        return {
          id: ac.id,
          section: ac.section,
          grade: ac.grade.name,
        };
      });
      return format;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async getIdsByCampuCode(codes: string[]) {
    try {
      const ac = await this.activityClassroomRepository.find({
        where: {
          classroom: {
            campusDetail: {
              code: In(codes),
            },
          },
        },
      });

      return ac.map((a) => a.id);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async getIdsByCampusIdAndCodes(campusId: number, codes: string[]) {
    try {
      const ac = await this.activityClassroomRepository.find({
        where: {
          classroom: {
            campusDetail: {
              id: campusId,
              code: In(codes),
            },
          },
        },
      });

      return ac.map((a) => a.id);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async getIdsByLevelIdCampusIdAndCodes(
    campusId: number,
    levelId: number,
    codes: string[],
  ) {
    try {
      const ac = await this.activityClassroomRepository.find({
        where: {
          classroom: {
            campusDetail: {
              id: campusId,
              code: In(codes),
            },
          },
          grade: {
            level: {
              id: levelId,
            },
          },
        },
      });

      return ac.map((a) => a.id);
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
