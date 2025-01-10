import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
// import { DataParentArrayDto } from '../relationship/dto/data-parent-array.dto';
import { Family } from './entities/family.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { Relationship } from 'src/relationship/entities/relationship.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DataAdmision } from './interfaces/data-admision';
import { TypeDoc } from 'src/person/enum/typeDoc.enum';
import { Gender } from 'src/common/enum/gender.enum';
import { FamilyRole } from 'src/common/enum/family-role.enum';

@Injectable()
export class FamilyService {
  private readonly logger = new Logger('FamilyService');
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Family)
    private readonly familyRepository: Repository<Family>,
    @InjectRepository(Relationship)
    private readonly relationShipRepository: Repository<Relationship>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createfamilyDto: CreateFamilyDto) {
    try {
      const family = this.familyRepository.create({
        nameFamily: createfamilyDto.nameFamily.toUpperCase(),
        parentOneId: { id: createfamilyDto.parentOneId },
        parentTwoId: { id: createfamilyDto.parentTwoId },
      });

      await this.familyRepository.save(family);

      return family;
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }
  async migrate(): Promise<any[] | 'Error'> {
    try {
      const relations = await this.relationShipRepository.find();
      interface UniqueStudent {
        nameFamily: string;
        sonStudentCode: string;
        dniAssignee: string;
        dniAssignee2?: string;
      }
      interface GroupedStudents {
        nameFamily: string;
        dniAssignee: string;
        dniAssignee2?: string;
        sonStudentCodes: string[];
      }
      const uniqueStudents: { [key: string]: UniqueStudent } = {};
      const groupedStudents: { [key: string]: GroupedStudents } = {};
      relations.forEach((student) => {
        const { nameFamily, dniAssignee, sonStudentCode } = student;

        if (uniqueStudents[sonStudentCode]) {
          uniqueStudents[sonStudentCode].dniAssignee2 = dniAssignee;
        } else {
          uniqueStudents[sonStudentCode] = {
            nameFamily,
            dniAssignee,
            sonStudentCode,
          };
        }
      });
      const result = Object.values(uniqueStudents);
      result.forEach((relation) => {
        const { nameFamily, dniAssignee, dniAssignee2, sonStudentCode } =
          relation;

        const key = [dniAssignee, dniAssignee2].sort().join('-');

        if (groupedStudents[key]) {
          groupedStudents[key].sonStudentCodes.push(sonStudentCode);
        } else {
          groupedStudents[key] = {
            nameFamily,
            dniAssignee,
            dniAssignee2,
            sonStudentCodes: [sonStudentCode],
          };
        }
      });
      const resultFinal = Object.values(groupedStudents);
      let conta = 0;
      resultFinal.forEach(async (item) => {
        let familyId = undefined;
        const parent = await this.personRepository.find({
          where: [
            { docNumber: item.dniAssignee },
            { docNumber: item.dniAssignee2 },
          ],
        });
        const student = await this.studentRepository.findOne({
          where: {
            studentCode: item.sonStudentCodes[0],
          },
        });
        if (!student || !parent) {
          conta = conta + 1;
          return resultFinal;
        }
        const family = await this.familyRepository.findOne({
          where: [
            {
              parentOneId:
                item.dniAssignee != undefined
                  ? { docNumber: item.dniAssignee }
                  : undefined,
              parentTwoId:
                item.dniAssignee2 != undefined
                  ? { docNumber: item.dniAssignee2 }
                  : undefined,
            },
            {
              parentOneId:
                item.dniAssignee2 != undefined
                  ? { docNumber: item.dniAssignee2 }
                  : undefined,
              parentTwoId:
                item.dniAssignee != undefined
                  ? { docNumber: item.dniAssignee }
                  : undefined,
            },
          ],
        });
        // if (student.id == 263) {
        //   console.log(item.dniAssignee);
        //   console.log(item.dniAssignee2);
        //   console.log('entro', family);
        // }
        familyId = family ? family.id : undefined;
        if (!family) {
          const newEntry = this.familyRepository.create({
            nameFamily: `${student.person.lastname} ${student.person.mLastname}`,
            parentOneId: { id: parent[0].id },
            parentTwoId: parent.length == 2 ? { id: parent[1].id } : undefined,
          });
          const family = await this.familyRepository.save(newEntry);
          familyId = family.id;
        }
        item.sonStudentCodes.forEach(async (code) => {
          const student = await this.studentRepository.findOne({
            where: { studentCode: code },
          });
          const update = await this.studentRepository.preload({
            id: student.id,
            family: { id: familyId },
          });
          await this.studentRepository.save(update);
        });
      });
      console.log(`Cantidad de nulos ${conta}`);
      return resultFinal;
    } catch (error) {
      return `Error`;
    }
  }
  async findAll() {
    const family = await this.familyRepository.find({
      order: { nameFamily: 'ASC' },
    });
    return family;
  }

  async getCites(idDistrict: string) {
    //OBTENER TODOS LOS DISTRITOS
    const url = this.configService.get('API_ADMISION');
    try {
      const dataDistrict = await firstValueFrom(
        this.httpService.get(`${url}/cities/district`),
      );
      // const dataDistricts = dataDistrict.data;
      const district = dataDistrict.data.data.find(
        (district: any) => district.id === idDistrict,
      );

      //OBTENER TODOS LAS PROVINCIAS
      const dataProvince = await firstValueFrom(
        this.httpService.get(`${url}/cities/province`),
      );
      const province = dataProvince.data.data.find(
        (province: any) => province.id === district.province_id,
      );
      //OBTENER TODOS LAS REGION
      const dataRegion = await firstValueFrom(
        this.httpService.get(`${url}/cities/region`),
      );
      const region = dataRegion.data.data.find(
        (region: any) => region.id === province.region_id,
      );
      return {
        region: region.name,
        province: province.name,
        district: district.name,
      };
    } catch (error) {
      throw error;
    }
  }
  async findOne(id: number, user: any) {
    const roles = user.resource_access['client-test-appae'].roles;

    const isAuth = ['administrador-colegio', 'secretaria'].some((role) =>
      roles.includes(role),
    );
    let whereCondition: FindOptionsWhere<Family>[] | FindOptionsWhere<Family>;

    if (isAuth) {
      whereCondition = {
        id: id,
      };
    } else {
      whereCondition = [
        {
          id: id,
          parentOneId: {
            user: {
              email: user.email,
            },
          },
        },
        {
          id: id,
          parentTwoId: {
            user: {
              email: user.email,
            },
          },
        },
      ];
    }

    const family = await this.familyRepository.findOne({
      where: whereCondition,

      relations: {
        parentOneId: {
          user: true,
        },
        parentTwoId: {
          user: true,
        },
        student: {
          enrollment: {
            activityClassroom: {
              classroom: true,
              grade: true,
            },
          },
        },
        respEnrollment: true,
        respEconomic: true,
        respAcademic: true,
      },
    });

    if (!family) throw new NotFoundException(`Family with id ${id} not found`);

    if (family.parentOneId?.user) {
      family.parentOneId.user = { email: family.parentOneId.user.email } as any;
    }
    if (family.respEnrollment) {
      family.respEnrollment = family.respEnrollment.id as any;
    }
    if (family.respEconomic) {
      family.respEconomic = family.respEconomic.id as any;
    }
    if (family.respAcademic) {
      family.respAcademic = family.respAcademic.id as any;
    }

    if (family.parentTwoId?.user) {
      family.parentTwoId.user = { email: family.parentTwoId.user.email } as any;
    }

    /**Formato temporal */
    const { student, ...rest } = family;
    const childrens = student
      .map((item) => {
        const person = item.person;
        // Verifica si `enrollment` tiene elementos
        if (item.enrollment.length === 0) {
          return undefined; // O manejar de otra manera según tu lógica
        }
        const { student, activityClassroom, ...enrroll } =
          item.enrollment.reduce((previous, current) => {
            return current.activityClassroom.grade.position >
              previous.activityClassroom.grade.position
              ? current
              : previous;
          });

        if (activityClassroom.grade.position !== 14 || enrroll.isActive) {
          return {
            person,
            ...enrroll,
            studentId: student.id,
            photo: student.photo,
            activityClassroomId: activityClassroom.id,
            actual:
              activityClassroom.classroom.campusDetail.name +
              ' - ' +
              activityClassroom.grade.level.name +
              ' - ' +
              activityClassroom.grade.name +
              ' ' +
              activityClassroom.section,
          };
        }
        return undefined; // Opcional, para dejar explícito que devolvemos undefined
      })
      .filter((child) => child !== undefined);

    const data = { student: childrens, ...rest };

    if (data.district) {
      const { district, ...rest } = data;
      const cities = await this.getCites(district);
      return {
        ...rest,
        ...cities,
      };
    }
    return data;
  }

  async update(id: number, updateFamilyDto: UpdateFamilyDto) {
    const {
      parentOneId,
      parentTwoId,
      respAcademic,
      respEconomic,
      respEnrollment,
      ...rest
    } = updateFamilyDto;
    if (updateFamilyDto.district) {
      const url = this.configService.get('API_ADMISION');
      const dataDistrict = await firstValueFrom(
        this.httpService.get(`${url}/cities/district`),
      );
      // const dataDistricts = dataDistrict.data;
      const district = dataDistrict.data.data.find(
        (district: any) => district.id === updateFamilyDto.district,
      );
      if (!district) {
        throw new BadRequestException(
          `Discrict with id ${updateFamilyDto.district} not found`,
        );
      }
    }
    const family = await this.familyRepository.preload({
      id: id,
      parentOneId: isNaN(parentOneId) ? undefined : { id: parentOneId },
      parentTwoId: isNaN(parentTwoId) ? undefined : { id: parentTwoId },
      respEnrollment: { id: respEnrollment },
      respEconomic: { id: respEconomic },
      respAcademic: { id: respAcademic },
      ...rest,
    });
    if (!family) throw new NotFoundException(`Family with id: ${id} not found`);
    try {
      await this.familyRepository.save(family);
      return family;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} family`;
  }
  async createFamilyFromAdmision(createFamilyParentsStudentDto: DataAdmision) {
    const { parents, child } = createFamilyParentsStudentDto;
    const parentOne = parents[0];
    const parentTwo = parents[1];
    try {
      // const parentOneId;
      let parentOneId = undefined;
      let parentTwoId = undefined;
      let studentId = undefined;
      let familyId = undefined;
      const existParentOne = await this.personRepository.findOne({
        where: {
          docNumber: parentOne.doc_number,
        },
      });
      const existParentTwo = await this.personRepository.findOne({
        where: {
          docNumber: parentTwo.doc_number,
        },
      });
      const existStudent = await this.personRepository.findOne({
        where: {
          docNumber: child.doc_number,
        },
      });

      if (existParentOne != null) {
        parentOneId = existParentOne.id;
      } else {
        const person = this.personRepository.create({
          name: parentOne.name,
          lastname: parentOne.lastname,
          mLastname: parentOne.mLastname,
          docNumber: parentOne.doc_number,
          birthDate: new Date(parentOne.birthdate),
          cellPhone: parentOne.phone,
          typeDoc: parentOne.type_doc as TypeDoc,
          gender: parentOne.role === 'P' ? Gender.M : Gender.F,
          familyRole: parentOne.role as FamilyRole,
        });
        const personCreated = await this.personRepository.save(person);
        parentOneId = personCreated.id;
      }

      if (existParentTwo != null) {
        parentTwoId = existParentTwo.id;
      } else {
        const person = this.personRepository.create({
          docNumber: parentTwo.doc_number,
          name: parentTwo.name.toUpperCase(),
          lastname: parentTwo.lastname.toUpperCase(),
          mLastname: parentTwo.mLastname.toUpperCase(),
          familyRole: parentTwo.role as FamilyRole,
          birthDate: new Date(parentTwo.birthdate),
          typeDoc: parentTwo.type_doc as TypeDoc,
          gender: parentTwo.role === 'P' ? Gender.M : Gender.F,
        });
        const personCreated = await this.personRepository.save(person);
        parentTwoId = personCreated.id;
      }

      if (existStudent != null) {
        studentId = existStudent.id;
      } else {
        const person = this.personRepository.create({
          typeDoc: parentOne.type_doc as TypeDoc,
          docNumber: child.doc_number,
          name: child.name.toUpperCase(),
          lastname: child.lastname.toUpperCase(),
          mLastname: child.mLastname.toUpperCase(),
          gender: child.gender as Gender,
          familyRole: FamilyRole.HIJO,
          birthDate: new Date(child.birthdate),
        });
        const personCreated = await this.personRepository.save(person);
        studentId = personCreated.id;
      }
      const existFamily = await this.familyRepository.findOne({
        where: {
          parentOneId: { id: parentOneId },
          parentTwoId: { id: parentTwoId },
        },
      });
      if (existFamily) {
        familyId = existFamily.id;
      } else {
        const family = this.familyRepository.create({
          nameFamily: child.lastname + ' ' + child.mLastname,
          parentOneId: { id: parentOneId },
          parentTwoId: { id: parentTwoId },
        });
        const familyCreated = await this.familyRepository.save(family);
        familyId = familyCreated.id;
      }
      let student = null;
      student = await this.studentRepository.findOne({
        where: {
          person: { id: studentId },
        },
      });

      if (student == null) {
        const studentC = this.studentRepository.create({
          person: { id: studentId },
          family: { id: familyId },
          hasDebt: false,
        });
        student = await this.studentRepository.save(studentC);
      }
      return {
        nameFamily: child.lastname + ' ' + child.mLastname,
        student,
      };
    } catch (error) {
      // this.logger.error(error);
      handleDBExceptions(error, this.logger);
    }
  }
}
