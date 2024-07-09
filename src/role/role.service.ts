import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Permission } from 'src/permissions/entities/permission.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class RoleService {
  private readonly logger = new Logger('RoleService');
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // private readonly configService: ConfigService,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    try {
      const { name, permissions } = createRoleDto;
      const permisos = await this.permissionRepository.findBy({
        id: In(permissions),
      });
      const rol = this.roleRepository.create({ name, permissions: permisos });
      return await this.roleRepository.save(rol);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    const roles = await this.roleRepository.find();

    return roles;
  }

  async findOne(id: number) {
    try {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['permissions'],
      });
      return role;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { name, permissions } = updateRoleDto;
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new Error('Rol no encontrado');
    }
    if (permissions) {
      const permisos = await this.permissionRepository.findBy({
        id: In(permissions),
      });
      role.permissions = permisos;
    }

    if (name) {
      role.name = name;
    }

    return await this.roleRepository.save(role);
  }

  async remove(id: number) {
    const rol = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Verificar si hay usuarios con este rol
    const usuariosConRol = await this.userRepository.find({
      where: {
        roles: { id: id },
      },
    });

    if (usuariosConRol.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar el rol porque está asignado a uno o más usuarios.',
      );
    }

    // Eliminar el rol
    await this.roleRepository.remove(rol);
  }
}
