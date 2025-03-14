import { Injectable, Logger } from '@nestjs/common';
import { UpdateDebtorsHelperDto } from './dto/update-debtors_helper.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DebtorsHelper } from './entities/debtors_helper.entity';
import { Student } from 'src/student/entities/student.entity';
import { DataDebTorsArrayDto } from './dto/data-debtors-array.dto';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';

@Injectable()
export class DebtorsHelperService {
  private readonly logger = new Logger('DebtorsHelperService');
  constructor(
    @InjectRepository(DebtorsHelper)
    private readonly debTorRepository: Repository<DebtorsHelper>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}
  async create(dataDebTorsArrayDto: DataDebTorsArrayDto) {
    const { data } = dataDebTorsArrayDto;
    try {
      const docNumbers = data.map((item) => item.docNumber);

      const existdebTor = await this.debTorRepository.find({
        where: {
          docNumber: In(docNumbers),
        },
      });

      const existingDocsSet = new Set(existdebTor.map((p) => p.docNumber));

      // Filtrar las personas que no están en la base de datos
      const personsToSave = data.filter(
        (item) => !existingDocsSet.has(item.docNumber),
      );
      if (personsToSave.length > 0) {
        await this.debTorRepository.save(
          personsToSave.map((item) => ({
            docNumber: item.docNumber,
          })),
        );
      }
      const studentDocNumbers = data.map((item) => item.docNumber);
      const students = await this.studentRepository.find({
        where: {
          person: { docNumber: In(studentDocNumbers) },
        },
      });
      const getIdStudents = new Set(students.map((p) => p.id));
      const validIds = Array.from(getIdStudents).filter(
        (id) => typeof id === 'number',
      );
      await this.studentRepository.update(
        { id: In(validIds) },
        { hasDebt: false },
      );
      return {
        message: 'Debtors processed successfully',
        newDebtorsCount: personsToSave.length,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  findAll() {
    return `This action returns all debtorsHelper`;
  }

  findOne(id: number) {
    return `This action returns a #${id} debtorsHelper`;
  }

  update(id: number, updateDebtorsHelperDto: UpdateDebtorsHelperDto) {
    return `This action updates a #${id} debtorsHelper`;
  }

  remove(id: number) {
    return `This action removes a #${id} debtorsHelper`;
  }
}
