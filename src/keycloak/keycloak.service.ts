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

  async updateGroupKy(userId: string) {
    const token = await this.getAdminToken();
    const groupId = '8170365c-4417-44d9-929b-5115c82e4d81';
    await axios.put(
      `${process.env.URL_KEYCLOAK}/admin/realms/${process.env.REALM_KEYCLOAK}/users/${userId}/groups/${groupId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('Grupo actualizado correctamente');
  }
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
        `${process.env.URL_KEYCLOAK}/admin/realms/colegioae/users`,
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
        `${process.env.URL_KEYCLOAK}/realms/${process.env.REALM_KEYCLOAK}/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: process.env.CLIENT_ID_KEYCLOAK,
          username: process.env.USERNAME_KEYCLOAK,
          password: process.env.PASSWORD_KEYCLOAK,
          grant_type: 'password',
          client_secret: process.env.CLIENT_SECRET_KEYCLOAK,
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

  async getUsersByRole(roleName: string) {
    const token = await this.getAdminToken();
    // const realm = process.env.KEYCLOAK_REALM;
    if (!token) return;

    try {
      const response = await axios.get(
        `https://login.colegioae.edu.pe/admin/realms/${process.env.REALM_KEYCLOAK}/clients/f3f8f4cc-dc10-4483-87e2-9012ef85ef2d/roles/${roleName}/users`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data; // Lista de usuarios asociados al rol
    } catch (error) {
      console.error('Error obteniendo usuarios por rol:', error);
    }
  }
}
