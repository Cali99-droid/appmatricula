import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { DataParentArrayDto } from '../relationship/dto/data-parent-array.dto';
import { Family } from './entities/family.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { Relationship } from 'src/relationship/entities/relationship.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';

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
      const uniqueStudents: { [key: string]: UniqueStudent } = {};

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
      const { withDniAssignee2, withoutDniAssignee2 } = result.reduce(
        (acc, relation) => {
          if (relation.dniAssignee2) {
            acc.withDniAssignee2.push(relation);
          } else {
            acc.withoutDniAssignee2.push(relation);
          }
          return acc;
        },
        { withDniAssignee2: [], withoutDniAssignee2: [] },
      );
      // return withoutDniAssignee2;
      withoutDniAssignee2.forEach(async (item) => {
        const parent = await this.personRepository.findOne({
          where: { docNumber: item.dniAssignee },
        });
        const student = await this.studentRepository.findOne({
          where: {
            studentCode: item.sonStudentCode,
          },
        });
        if (!student) {
          return withoutDniAssignee2;
        }
        const familyExist = await this.familyRepository.findOne({
          where: { parentOneId: { id: parent.id } },
        });
        if (familyExist) {
          // console.log('entro 2');
          const updateStudent = await this.studentRepository.preload({
            id: student.id,
            family: { id: familyExist.id },
          });
          await this.personRepository.save(updateStudent);
        } else {
          const newEntry = this.familyRepository.create({
            nameFamily: `${student.person.lastname} ${student.person.mLastname}`,
            parentOneId: { id: parent.id },
          });
          const family = await this.familyRepository.save(newEntry);
          const updateStudent = await this.studentRepository.preload({
            id: student.id,
            family: { id: family.id },
          });
          await this.personRepository.save(updateStudent);
        }
      });
      withDniAssignee2.forEach(async (item) => {
        const parent = await this.personRepository.find({
          where: [
            { docNumber: item.dniAssignee },
            { docNumber: item.dniAssignee2 },
          ],
        });
        const student = await this.studentRepository.findOne({
          where: {
            studentCode: item.sonStudentCode,
          },
        });
        const familyExist = await this.familyRepository.findOne({
          where: {
            parentOneId: { id: parent[0].id },
            parentTwoId: { id: parent[1].id },
          },
        });
        if (familyExist) {
          // console.log('entro');
          console.log(student.id, familyExist.id);
          const update = await this.studentRepository.preload({
            id: student.id,
            family: { id: familyExist.id },
          });
          const data = await this.studentRepository.save(update);
          console.log(data);
        } else {
          console.log('entro a crear familia');
          const newEntry = this.familyRepository.create({
            nameFamily: `${student.person.lastname} ${student.person.mLastname}`,
            parentOneId: { id: parent[0].id },
            parentTwoId: { id: parent[1].id },
          });
          const family = await this.familyRepository.save(newEntry);
          const updateStudent = await this.studentRepository.preload({
            id: student.id,
            family: { id: family.id },
          });
          await this.studentRepository.save(updateStudent);
        }
      });
      return result;
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
    return family;
  }

  update(id: number, updateFamilyDto: UpdateFamilyDto) {
    return `This action updates a #${id} family`;
  }

  remove(id: number) {
    return `This action removes a #${id} family`;
  }
}
