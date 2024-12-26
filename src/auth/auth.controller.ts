import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

import { LoginUserDto } from './dto/login-user.dto';

import { GetUser } from './decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from './decorators/auth.decorator';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { Request } from 'express';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

import { RegisterUserDto } from './dto/register-user.dto';
import { AuthenticatedUser, Resource } from 'nest-keycloak-connect';

@ApiTags('Auth')
@Controller('auth')
@Resource('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.create(registerUserDto);
  }

  @Post('login')
  signIn(@Body() loginUserDto: LoginUserDto) {
    return this.authService.signIn(loginUserDto);
  }

  @Get('private')
  // @RoleProtected(ValidRoles.superUser)
  // @UseGuards(AuthGuard(), UserRoleGuard)
  // @Permissions('admin')
  // @UseGuards(AuthGuard(), PermissionsGuard)
  @Auth('card-generator', 'admin')
  testinRoute(@GetUser() user: User, @GetUser('email') email: string) {
    return {
      ok: true,
      user,
      email,
    };
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  @ApiOperation({
    summary: 'close session and delete refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'logout success',
  })
  @ApiResponse({
    status: 401,
    description: 'access denied token',
  })
  @ApiBearerAuth('access-token')
  logout(@Req() req: Request) {
    this.authService.logout(req.user['id']);
  }
  //ssa
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @ApiBearerAuth('refresh-token')
  @ApiOperation({
    summary:
      'Refresh token, token expired on 15 minutes and refresh token on 7 days ',
  })
  @ApiResponse({
    status: 200,
    description: 'access token with refresh token',
  })
  @ApiResponse({
    status: 401,
    description: 'access denied ',
  })
  refreshTokens(@Req() req: Request) {
    console.log(req.user);
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('menu')
  @ApiBearerAuth('refresh-token')
  @ApiOperation({
    summary: 'get menu by user',
  })
  @ApiResponse({
    status: 200,
    description: 'user menu ',
  })
  @ApiResponse({
    status: 401,
    description: 'access denied ',
  })
  getMenu(@AuthenticatedUser() user: any) {
    return this.authService.getMenu(user);
  }
}
