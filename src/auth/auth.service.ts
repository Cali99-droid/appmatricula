import {
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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
        token: this.getJwtToken({ email: user.email }),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('PLease check server logs');
    }
  }
  async signIn(loginUserDto: LoginUserDto) {
    const { email } = loginUserDto;
    console.log(loginUserDto);
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true },
    });
    if (!user)
      throw new UnauthorizedException('Credentials are not valid(email)');

    if (!bcrypt.compareSync(loginUserDto.password, user.password))
      throw new UnauthorizedException('Credentials are not valid(password)');

    const { id, password, ...result } = user;

    return {
      ...result,
      token: this.getJwtToken({ email: user.email }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    //
    const token = this.jwtService.sign(payload);
    return token;
  }
  verify(token: string): any {
    return this.jwtService.verify(token);
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ email: user.email }),
    };
  }
}
