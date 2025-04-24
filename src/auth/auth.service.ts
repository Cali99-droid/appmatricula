import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { RegisterUserDto } from './dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { AdminMenu } from './config/menu-config';
import { Person } from 'src/person/entities/person.entity';
import { KeycloakService } from 'src/keycloak/keycloak.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private usersService: UserService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,

    private readonly keycloakService: KeycloakService,
  ) {}
  async create(registerUserDto: RegisterUserDto) {
    try {
      const { password, ...userData } = registerUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      return {
        ...user,
        token: this.getJwtToken({ email: user.email, sub: user.id }),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('PLease check server logs');
    }
  }
  async signIn(loginUserDto: LoginUserDto) {
    const { email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true },
      // relations: {
      //   roles: {
      //     permissions: true,
      //   },
      //   // assignments: true,
      // },
    });
    if (!user)
      throw new UnauthorizedException('Credentials are not valid(email)');

    if (!bcrypt.compareSync(loginUserDto.password, user.password))
      throw new UnauthorizedException('Credentials are not valid(password)');
    const tokens = await this.getJwtTokens({ email: user.email, sub: user.id });
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    // const { password, roles, person, ...result } = user;
    // const permissions = [];

    // roles.forEach((role) => {
    //   role.permissions.map((item) => {
    //     permissions.push(item.name);
    //   });
    // });

    // const menu = this.generateMenu(permissions);
    // return {
    //   ...result,
    //   isWorker: roles.length > 0,
    //   permissions,
    //   token: this.getJwtToken({ email: user.email, sub: user.id }),
    //   tokens,
    //   menu,
    // };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ email: user.email, sub: user.id }),
    };
  }
  private getJwtToken(payload: JwtPayload) {
    //
    const token = this.jwtService.sign(payload);
    return token;
  }
  private async getJwtTokens(payload: JwtPayload) {
    //
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '5h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]).catch((error) => {
      throw new InternalServerErrorException(error);
    });

    return {
      accessToken,
      refreshToken,
    };
  }
  async logout(userId: number) {
    return this.usersService.updateRefreshToken(userId, null);
  }
  verify(token: string): any {
    return this.jwtService.verify(token);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = bcrypt.hashSync(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied [user]');

    if (!bcrypt.compareSync(refreshToken, user.refreshToken))
      throw new ForbiddenException('Access Denied [token]');
    const tokens = await this.getJwtTokens({ email: user.email, sub: user.id });
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async getMenu(user: any) {
    const userBD = await this.userRepository.findOneBy({
      // sub: user.sub,
      email: user.email,
    });

    if (!userBD) {
      const existPerson = await this.personRepository.findOneBy({
        docNumber: user.dni,
      });
      if (!existPerson) {
        const person = this.personRepository.create({
          name: user.given_name,
          lastname: user.family_name,
          mLastname: user.family_name.split(' ')[1] || user.family_name,
          docNumber: user.dni,
        });
        const newPerson = await this.personRepository.save(person);
        const us = this.userRepository.create({
          email: user.email,
          password: user.dni,
          sub: user.sub,
          person: { id: newPerson.id },
        });
        await this.userRepository.save(us);
        let roles = [];
        if (user.resource_access['client-test-appae']) {
          roles = user.resource_access['client-test-appae'].roles;
        }
        console.log('roelsas');
        console.log(roles);
        const menu = this.generateMenu(roles);
        return menu;
      } else {
        const us = this.userRepository.create({
          email: user.email,
          password: user.dni,
          sub: user.sub,
          person: { id: existPerson.id },
        });
        await this.userRepository.save(us);
        let roles = [];
        if (user.resource_access['client-test-appae']) {
          roles = user.resource_access['client-test-appae'].roles;
        }
        console.log(roles);
        const menu = this.generateMenu(roles);
        return menu;
        // throw new BadRequestException(
        //   'The document number is in use, contact the administrator',
        // );
      }
    }

    if (userBD.sub === null || userBD.sub === '') {
      userBD.sub = user.sub;
      /**actualizar permisos grupo */
      await this.keycloakService.updateGroupKy(user.sub);
      await this.userRepository.save(userBD);
    }

    let roles = [];
    if (user.resource_access['client-test-appae']) {
      roles = user.resource_access['client-test-appae'].roles;
    }
    console.log(roles);
    const menu = this.generateMenu(roles);
    return menu;
  }

  private generateMenu(userPermissions: string[]): any {
    const filterMenu = (menu) => {
      return menu
        .filter((item) =>
          item.permissions.some((permission) =>
            userPermissions.includes(permission),
          ),
        )
        .map((item) => ({
          ...item,
          subMenu: item.subMenu ? filterMenu(item.subMenu) : [],
        }));
    };

    return {
      mainMenu: filterMenu(AdminMenu.mainMenu),
      settingsMenu: filterMenu(AdminMenu.settingsMenu),
    };
  }
}
