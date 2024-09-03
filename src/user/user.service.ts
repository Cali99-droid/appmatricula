import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import { AddRoleDto } from './dto/add-role.dto';
import * as bcrypt from 'bcrypt';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Assignment } from './entities/assignments.entity';

import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { AssignmentClassroom } from './entities/assignments-classroom.entity';
@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(CampusDetail)
    private readonly campusDetailRepository: Repository<CampusDetail>,
    @InjectRepository(AssignmentClassroom)
    private readonly assignmentClassroomRepository: Repository<AssignmentClassroom>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const {
        password,
        email,
        campusDetailsIds,
        rolesIds,
        activityClassroomIds,
      } = createUserDto;
      const user = this.userRepository.create({
        email,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      const userToUpdate = await this.userRepository.findOne({
        where: {
          email: email,
        },
        relations: {
          roles: true,
          assignments: true,
        },
      });

      for (const roleId of rolesIds) {
        const role = await this.roleRepository.findOneBy({ id: roleId });
        userToUpdate.roles.push(role);
      }

      const userCreated = await this.userRepository.save(userToUpdate);
      if (campusDetailsIds) {
        for (const campusId of campusDetailsIds) {
          await this.assignmentRepository.save({
            user: userCreated,
            campusDetail: { id: campusId },
          });
        }
      }
      if (activityClassroomIds) {
        for (const acId of activityClassroomIds) {
          await this.assignmentClassroomRepository.save({
            user: userCreated,
            activityClassroom: { id: acId },
          });
        }
      }
      return userCreated;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    // const users = await this.userRepository.find({
    //   relations: {
    //     roles: true,
    //     assignments: {
    //       campusDetail: true,
    //     },
    //   },
    // });
    const users = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'role') // Realizamos una unión interna con la tabla de roles
      .leftJoinAndSelect('user.assignments', 'assignment') // Unión izquierda con assignments
      .leftJoinAndSelect('assignment.campusDetail', 'campusDetail') // Unión izquierda con campusDetail
      .getMany();
    return users.map((user) => {
      if (user.roles.length > 0) {
        return {
          id: user.id,
          email: user.email,
          isActive: user.isActive,
          roles: user.roles,
          assignments: user.assignments.map((ass) => {
            return { id: ass.campusDetail.id, name: ass.campusDetail.name };
          }),
        };
      }
    });
  }
  async findAssig(email: string) {
    // Obtener el usuario con las relaciones necesarias
    const user = await this.userRepository.findOneOrFail({
      where: { email },
      relations: {
        assignments: {
          campusDetail: true, // Cargar la relación del campusDetail
        },
      },
    });

    // Extraer solo los IDs de campusDetail de las asignaciones del usuario
    const campusDetailIds = user.assignments.map(
      (assignment) => assignment.campusDetail.id,
    );

    return campusDetailIds;
  }
  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { id },
        relations: {
          roles: true,
          assignments: {
            campusDetail: true,
          },
          assignmentsClassroom: {
            activityClassroom: true,
          },
        },
      });
      const { email, roles, assignments, isActive, assignmentsClassroom } =
        user;

      return {
        id: user.id,
        email,
        roles: roles.map((rol) => {
          return rol.id;
        }),
        assignments: assignments.map((ass) => {
          return ass.campusDetail.id;
        }),
        isActive,
        assignmentClassroom: assignmentsClassroom.map((item) => {
          return {
            id: item.activityClassroom.id,
            grade: item.activityClassroom.grade.name,
            section: item.activityClassroom.section,
          };
        }),
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        roles: true,
      },
    });
    const {
      campusDetailsIds,
      rolesIds,
      email,
      password,
      isActive,
      activityClassroomIds,
    } = updateUserDto;
    userToUpdate.roles = [];
    userToUpdate.isActive = isActive;
    if (email) {
      userToUpdate.email = email;
    }

    if (password) {
      userToUpdate.password = bcrypt.hashSync(password, 10);
    }
    if (rolesIds) {
      for (const roleId of rolesIds) {
        const role = await this.roleRepository.findOneBy({ id: roleId });
        if (role) {
          userToUpdate.roles.push(role);
        } else {
          throw new Error(`Role with ID ${roleId} not found`);
        }
      }
    }

    const userUpdated = await this.userRepository.save(userToUpdate);

    const assignmentToUpdate = await this.assignmentRepository.findBy({
      user: { id: userUpdated.id },
    });
    await this.assignmentRepository.remove(assignmentToUpdate);
    if (campusDetailsIds) {
      for (const campusId of campusDetailsIds) {
        // const campus = await this.campusDetailRepository.findOneBy({
        //   id: campusId,
        // });
        // console.log(campus)

        await this.assignmentRepository.save({
          user: userUpdated,
          campusDetail: { id: campusId },
        });
      }
    }
    const assignmentClassToUpdate =
      await this.assignmentClassroomRepository.findBy({
        user: { id: userUpdated.id },
      });

    await this.assignmentClassroomRepository.remove(assignmentClassToUpdate);
    if (activityClassroomIds) {
      for (const acId of activityClassroomIds) {
        await this.assignmentClassroomRepository.save({
          user: userUpdated,
          activityClassroom: { id: acId },
        });
      }
    }

    return userUpdated;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateRefreshToken(id: number, refreshToken: string | null) {
    const toUpdate = await this.userRepository.preload({
      id: id,
      refreshToken,
    });
    if (!toUpdate) {
      throw new Error(`Entity with ID ${id} not found`);
    }

    return this.userRepository.save(toUpdate);
  }

  async addRoleToUser(addRoleDto: AddRoleDto): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: addRoleDto.userId,
        },
        relations: {
          roles: true,
        },
      });
      // Clear existing roles
      user.roles = [];

      // Add new roles
      for (const roleId of addRoleDto.rolesId) {
        const role = await this.roleRepository.findOneBy({ id: roleId });
        if (role) {
          user.roles.push(role);
        } else {
          throw new Error(`Role with ID ${roleId} not found`);
        }
      }

      await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
