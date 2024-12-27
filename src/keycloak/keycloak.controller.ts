import { Controller, Get } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';

@Controller('keycloak')
export class KeycloakController {
  constructor(private readonly keycloakService: KeycloakService) {}
  @Get()
  migrateUsers() {
    return this.keycloakService.migrateUsers();
  }
}
