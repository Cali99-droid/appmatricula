import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Person } from 'src/person/entities/person.entity';
import { Relationship } from './entities/relationship.entity';
import { DataParentArrayDto } from './dto/data-parent-array.dto';
import { Student } from 'src/student/entities/student.entity';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';

@Injectable()
export class RelationshipService {
  private readonly logger = new Logger('FamilyService');
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Relationship)
    private readonly relationshipRepository: Repository<Relationship>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}
  async createParents(dataParentArrayDto: DataParentArrayDto) {
    const { data } = dataParentArrayDto;

    // Pre-fetch existing records to minimize DB calls
    try {
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
      const existingFamilies = await this.relationshipRepository.find({
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
        savedFamilies = await this.relationshipRepository.save(
          this.relationshipRepository.create(familiesToSaveFormat),
        );
      }

      return {
        savedFamiliesMembers: savedFamilies.length,
        savedPersons: savedPersons.length,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    const rela = await this.relationshipRepository.find();
    const dnis = rela.map((d) => d.dniAssignee);

    const fathers = await this.personRepository.find({
      where: {
        docNumber: In(dnis),
      },
    });
    return fathers;
  }
  /** es deplot */
  async findByActivityClassroom(activityClassroomId: number) {
    const enroll = await this.enrollmentRepository.find({
      where: { activityClassroom: { id: activityClassroomId } },
    });
    const studentCodes = enroll.map((item) => item.student.studentCode);
    const rel = await this.relationshipRepository.find({
      where: { sonStudentCode: In(studentCodes) },
    });
    const dnis = rel.map((d) => d.dniAssignee);
    const fathers = await this.personRepository.find({
      where: {
        docNumber: In(dnis),
      },
    });

    const formatData = fathers.map((item) => {
      let data;
      rel.forEach((r) => {
        if (r.dniAssignee === item.docNumber) {
          data = { ...item, sonCode: r.sonStudentCode };
        }
      });
      return data;
    });

    return this.getSortedData(formatData);
  }
  getSortedData(data) {
    return data.sort((a, b) => {
      if (a.sonCode < b.sonCode) return -1;
      if (a.sonCode > b.sonCode) return 1;
      return 0;
    });
  }
  getGroupedData(data) {
    const groupedData = data.reduce((acc, current) => {
      const { sonCode } = current;
      if (!acc[sonCode]) {
        acc[sonCode] = [];
      }
      acc[sonCode].push(current);
      return acc;
    }, {});

    return Object.keys(groupedData).map((sonCode) => {
      const members = groupedData[sonCode];
      members.sort((a, b) => {
        if (a.familyRole === 'P') return -1;
        if (b.familyRole === 'P') return 1;
        return 0;
      });
      return {
        sonCode,
        members,
      };
    });
  }
}
