import { Injectable, Logger } from '@nestjs/common';
import { CreateSchoolRequestDto } from './dto/create-school_request.dto';
import { UpdateSchoolRequestDto } from './dto/update-school_request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Issue, SchoolRequest, Status } from './entities/school_request.entity';
import { Repository } from 'typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBException';
import { TreasuryService } from 'src/treasury/treasury.service';

@Injectable()
export class SchoolRequestService {
  private readonly logger = new Logger('SchoolRequestService');
  constructor(
    @InjectRepository(SchoolRequest)
    private readonly schoolRequestRepository: Repository<SchoolRequest>,

    private readonly treasuryService: TreasuryService,
  ) {}
  async create(createSchoolRequestDto: CreateSchoolRequestDto) {
    try {
      const { issue, studentId } = createSchoolRequestDto;
      const id = await this.generateRequestCode();
      const code = id ? Number(id[0].id) + 1 : 1;
      const schoolRequest = this.schoolRequestRepository.create({
        issue,
        studentId,
        requestCode: `RQ-${code.toString().padStart(4, '0')}`,
      });

      const schoolRequestCreated =
        await this.schoolRequestRepository.save(schoolRequest);
      await this.generateDebt(schoolRequestCreated);

      return schoolRequestCreated;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll() {
    try {
      const schoolRequests = await this.schoolRequestRepository.find({
        relations: {
          student: {
            person: true,
          },
        },
      });
      const data = schoolRequests.map((sr) => {
        const { student, ...res } = sr;
        const { person } = student;
        return {
          ...res,
          person,
        };
      });
      return data;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} schoolRequest`;
  }

  update(id: number, updateSchoolRequestDto: UpdateSchoolRequestDto) {
    return `This action updates a #${id} schoolRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} schoolRequest`;
  }

  /**PRIVATE FUNCTIONS */
  private async generateDebt(schoolRequestCreated: SchoolRequest) {
    try {
      const CONCEPT_DUPLICATE_ID = 5;
      switch (schoolRequestCreated.issue) {
        case Issue.DUPLICATE_CARNET:
          const concept =
            await this.treasuryService.getConcept(CONCEPT_DUPLICATE_ID);
          this.treasuryService.generateDebt(
            concept,
            schoolRequestCreated.studentId,
            schoolRequestCreated.requestCode,
          );
          schoolRequestCreated.status = Status.CLOSED;
          await this.schoolRequestRepository.save(schoolRequestCreated);
          // Code to execute if expression === value1
          break;
        default:
          console.log('NOT GENERATE DEBT');
      }
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  private generateRequestCode() {
    return this.schoolRequestRepository.query(
      `SELECT MAX(id) as id FROM school_request WHERE id IS NOT NULL`,
    );
  }
}
