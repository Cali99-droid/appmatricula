import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { DataParentArrayDto } from '../relationship/dto/data-parent-array.dto';
import { Family } from './entities/family.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { Relationship } from 'src/relationship/entities/relationship.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

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

  // async createParents(dataParentArrayDto: DataParentArrayDto) {
  //   const { data } = dataParentArrayDto;

  //   // Pre-fetch existing records to minimize DB calls
  //   const docNumbers = data.map((item) => item.docNumber);
  //   const existingPersons = await this.personRepository.find({
  //     where: { docNumber: In(docNumbers) },
  //   });
  //   const existingDocsSet = new Set(existingPersons.map((p) => p.docNumber));

  //   const personsToSave = data.filter(
  //     (item) => !existingDocsSet.has(item.docNumber),
  //   );
  //   let savedPersons = [];
  //   const personsToSaveFormat = personsToSave.map((item) => {
  //     return {
  //       name: item.name,
  //       lastname: item.lastname,
  //       mLastname: item.mLastname,
  //       docNumber: item.docNumber,
  //       gender: item.gender,
  //       familyRole: item.familyRole,
  //     };
  //   });
  //   if (personsToSave.length > 0) {
  //     savedPersons = await this.personRepository.save(
  //       this.personRepository.create(personsToSaveFormat),
  //     );
  //   }

  //   const studentCodes = data.map((item) => ({
  //     dniAssignee: item.docNumber,
  //     sonStudentCode: item.studentCode,
  //   }));
  //   const existingFamilies = await this.familyRepository.find({
  //     where: studentCodes,
  //   });
  //   const existingFamiliesSet = new Set(
  //     existingFamilies.map((f) => `${f.dniAssignee}_${f.sonStudentCode}`),
  //   );

  //   const familiesToSave = data.filter(
  //     (item) =>
  //       !existingFamiliesSet.has(`${item.docNumber}_${item.studentCode}`),
  //   );
  //   let savedFamilies = [];
  //   const familiesToSaveFormat = familiesToSave.map((item) => {
  //     return {
  //       dniAssignee: item.docNumber,
  //       sonStudentCode: item.studentCode,
  //     };
  //   });
  //   if (familiesToSave.length > 0) {
  //     savedFamilies = await this.familyRepository.save(
  //       this.familyRepository.create(familiesToSaveFormat),
  //     );
  //   }

  //   return {
  //     savedFamiliesMembers: savedFamilies.length,
  //     savedPersons: savedPersons.length,
  //   };
  // }
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
    console.log('first');
    //OBTENER TODOS LOS DISTRITOS
    const url = this.configService.get('API_ADMISION');
    try {
      console.log('GET CITIES');
      console.log(url);
      const dataDistrict = await firstValueFrom(
        this.httpService.get(`${url}/cities/district`),
      );
      // const dataDistricts = dataDistrict.data;
      const district = dataDistrict.data.data.find(
        (district: any) => district.id === idDistrict,
      );
      console.log(district);
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
  async findOne(id: number) {
    const family = await this.familyRepository.findOne({
      where: { id: id },
      relations: {
        parentOneId: true,
        parentTwoId: true,
        student: true,
      },
    });
    if (!family) throw new NotFoundException(`Family with id ${id} not found`);
    if (family.district) {
      const { district, ...rest } = family;
      const cities = await this.getCites(district);
      return {
        ...rest,
        ...cities,
      };
    }
    return family;
  }

  async update(id: number, updateFamilyDto: UpdateFamilyDto) {
    const { parentOneId, parentTwoId, ...rest } = updateFamilyDto;
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
}
