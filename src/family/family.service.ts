import { Injectable, Logger } from '@nestjs/common';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { DataParentArrayDto } from '../relationship/dto/data-parent-array.dto';
import { Family } from './entities/family.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';

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
  ) {}

  async createParents(dataParentArrayDto: DataParentArrayDto) {
    const { data } = dataParentArrayDto;

    // Pre-fetch existing records to minimize DB calls
    const docNumbers = data.map((item) => item.docNumber);
    const existingPersons = await this.personRepository.find({
      where: { docNumber: In(docNumbers) },
    });
    const existingDocsSet = new Set(existingPersons.map((p) => p.docNumber));

    const personsToSave = data.filter(
      (item) => !existingDocsSet.has(item.docNumber),
    );
    let savedPersons = [];
    const personsToSaveFormat = personsToSave.map((item) => {
      return {
        name: item.name,
        lastname: item.lastname,
        mLastname: item.mLastname,
        docNumber: item.docNumber,
        gender: item.gender,
        familyRole: item.familyRole,
      };
    });
    if (personsToSave.length > 0) {
      savedPersons = await this.personRepository.save(
        this.personRepository.create(personsToSaveFormat),
      );
    }

    const studentCodes = data.map((item) => ({
      dniAssignee: item.docNumber,
      sonStudentCode: item.studentCode,
    }));
    const existingFamilies = await this.familyRepository.find({
      where: studentCodes,
    });
    const existingFamiliesSet = new Set(
      existingFamilies.map((f) => `${f.dniAssignee}_${f.sonStudentCode}`),
    );

    const familiesToSave = data.filter(
      (item) =>
        !existingFamiliesSet.has(`${item.docNumber}_${item.studentCode}`),
    );
    let savedFamilies = [];
    const familiesToSaveFormat = familiesToSave.map((item) => {
      return {
        dniAssignee: item.docNumber,
        sonStudentCode: item.studentCode,
      };
    });
    if (familiesToSave.length > 0) {
      savedFamilies = await this.familyRepository.save(
        this.familyRepository.create(familiesToSaveFormat),
      );
    }

    return {
      savedFamiliesMembers: savedFamilies.length,
      savedPersons: savedPersons.length,
    };
  }
  create(createFamilyDto: CreateFamilyDto) {
    return 'This action adds a new family';
  }

  findAll() {
    return `This action returns all family`;
  }

  findOne(id: number) {
    return `This action returns a #${id} family`;
  }

  update(id: number, updateFamilyDto: UpdateFamilyDto) {
    return `This action updates a #${id} family`;
  }

  remove(id: number) {
    return `This action removes a #${id} family`;
  }
}
