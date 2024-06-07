import { Injectable, Logger } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { User } from 'src/user/entities/user.entity';
import { CreatePersonCrmDto } from './dto/create-person-crm.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PersonService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_REGION'),
  });
  private readonly logger = new Logger('PersonService');

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  create(createPersonDto: CreatePersonDto) {
    return 'This action adds a new person';
  }
  async createParentCRM(data: CreatePersonCrmDto) {
    try {
      let familyRole = undefined;
      let gender = undefined;
      console.log(data);
      if (data.gender == 'Masculino') {
        gender = 'M';
        familyRole = 'P';
      } else {
        gender = 'F';
        familyRole = 'M';
      }
      const person = this.personRepository.create({
        docNumber: data.docNumber,
        name: data.name,
        lastname: data.lastName,
        mLastname: data.mLastname,
        gender: gender,
        familyRole: familyRole,
      });
      const personCreated = await this.personRepository.save(person);
      console.log(personCreated);
      const user = this.userRepository.create({
        email: data.email,
        password: bcrypt.hashSync(data.docNumber, 10),
        person: { id: personCreated.id },
      });
      const userCreated = await this.userRepository.save(user);
      console.log(userCreated);
      const { email } = userCreated;

      return { personCreated, email };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  async findToCreateInCRM() {
    const users = await this.userRepository.find({
      where: {
        crmGHLId: IsNull(),
      },
    });
    const userDetails = users.map((user) => ({
      email: user.email,
      first_name: user.person.name,
      last_name: `${user.person.lastname},${user.person.mLastname}`,
    }));
    return userDetails;
  }
  async findToUpdateInCRM() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    const yesterday = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    yesterday.setDate(yesterday.getDate() - 1);
    const users = await this.userRepository.find({
      where: {
        crmGHLId: Not(IsNull()),
        updatedAt: Between(new Date(yesterday), new Date(tomorrow)),
      },
    });
    const userDetails = users.map((user) => ({
      crmGHLId: user.crmGHLId,
      email: user.email,
      first_name: user.person.name,
      last_name: user.person.name,
    }));
    return userDetails;
  }
  findAll() {
    return `This action returns all person`;
  }

  findOne(id: number) {
    return `This action returns a #${id} person`;
  }

  update(id: number, updatePersonDto: UpdatePersonDto) {
    return `This action updates a #${id} person`;
  }

  remove(id: number) {
    return `This action removes a #${id} person`;
  }

  async uploadPhoto(fileName: string, file: Buffer, id: number) {
    const webpImage = await sharp(file).webp().toBuffer();

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: 'caebucket',
        Key: `colegio/${Date.now()}.webp`,
        Body: webpImage,
      }),
    );
  }
}
