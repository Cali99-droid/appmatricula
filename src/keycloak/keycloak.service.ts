import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';

import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger('KeycloakService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async migrateUsers() {
    const token = await this.getAdminToken();

    // Reemplaza esto con la consulta a tu base de datos

    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.person', 'person')
      .where('user.personId IS NOT NULL')
      .getMany();

    const userMigrate = users.map((us) => {
      return {
        username: us.email,
        // DNI: us.person.docNumber,
        // parentesco: 'Padre',
        emailVerified: true,
        email: us.email,
        enabled: true,
        firstName: us.person.name,
        lastName: us.person.lastname + ' ' + us.person.mLastname,
        credentials: [
          {
            type: 'password',
            value: us.person.docNumber,
            temporary: true,
          },
        ],
        groups: ['Padres'],
      };
    });

    for (const user of userMigrate) {
      await this.createUser(token, user);
    }
  }

  async createUser(token, user) {
    try {
      const response = await axios.post(
        `https://login.colegioae.edu.pe/admin/realms/colegioae/users`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(`Usuario ${user.username} migrado correctamente.`);
    } catch (error) {
      console.error(
        `Error migrando usuario ${user.username}:`,
        error.response?.data || error.message,
      );
    }
  }

  async getAdminToken() {
    try {
      const response = await axios.post(
        `https://login.colegioae.edu.pe/realms/colegioae/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: 'appcolegioae',
          username: 'no-borrar@keycloak.com',
          password: 'admin12',
          grant_type: 'password',
          client_secret: 'rjny3vNy8tHGJIuzvAmnoqXBuDt7GX3O',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      return response.data.access_token;
    } catch (error) {
      console.error(
        'Error obteniendo el token de Keycloak:',
        error.response?.data || error.message,
      );
      process.exit(1);
    }
  }
}
