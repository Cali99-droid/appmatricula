import { Module } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';
import { KeycloakController } from './keycloak.controller';
import {
  AuthGuard,
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [KeycloakController],
  providers: [
    KeycloakService,
    // This adds a global level authentication guard,
    // you can also have it scoped
    // if you like.
    //
    // Will return a 401 unauthorized when it is unable to
    // verify the JWT token or Bearer header is missing.
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // This adds a global level resource guard, which is permissive.
    // Only controllers annotated with @Resource and
    // methods with @Scopes
    // are handled by this guard.
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    // New in 1.1.0
    // This adds a global level role guard, which is permissive.
    // Used by `@Roles` decorator with the
    // optional `@AllowAnyRole` decorator for allowing any
    // specified role passed.
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forFeature([User]),
    KeycloakConnectModule.register({
      authServerUrl: process.env.URL_KEYCLOAK,
      realm: process.env.REALM_KEYCLOAK,
      clientId: process.env.CLIENT_ID_KEYCLOAK,
      secret: process.env.CLIENT_SECRET_KEYCLOAK,
      // Secret key of the client taken from keycloak server
    }),
  ],
  exports: [KeycloakService],
})
export class KeycloakModule {}
