import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { handleDBExceptions } from '../common/helpers/handleDBException';
import { Student } from 'src/student/entities/student.entity';
import { Debt } from 'src/treasury/entities/debt.entity';
import { Concept } from 'src/treasury/entities/concept.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransferService {
  private readonly logger = new Logger('TransfersService');
  constructor(
    @InjectRepository(Transfer)
    private readonly repository: Repository<Transfer>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(Concept)
    private readonly conceptRepository: Repository<Concept>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createTransferDto: CreateTransferDto) {
    const student = await this.studentRepository.findOneBy({
      id: createTransferDto.studentId,
    });
    if (!student) {
      throw new BadRequestException(
        `Student with id: ${createTransferDto.studentId} not found`,
      );
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const debtStudent = await this.debtRepository.findBy({
      student: { id: createTransferDto.studentId },
      status: false,
      dateEnd: LessThanOrEqual(today),
    });
    if (debtStudent.length > 0) {
      throw new BadRequestException(`El estudiante tiene deuda`);
    }
    const concept = await this.conceptRepository.findOneBy({
      code: 'C005',
    });
    if (!concept) {
      throw new BadRequestException(
        `Crea un nuevo concepto de traslados con el codigo C005`,
      );
    }
    try {
      //CREAMOS LA ENTRADA DE TRASLADO
      const newEntry = this.repository.create({
        district: createTransferDto.district,
        schoolDestination: createTransferDto.schoolDestination.toUpperCase(),
        reason: createTransferDto.reason.toUpperCase(),
        transfersDate: createTransferDto.transfersDate,
        student: { id: createTransferDto.studentId },
        status: true,
      });
      const transfer = await this.repository.save(newEntry);
      //ACTUALIZAMOS ESTADO DEL ESTUDIANTE
      student.hasDebt = true;
      const studentUpdate = await this.studentRepository.preload({
        id: createTransferDto.studentId,
        ...student,
      });
      await this.studentRepository.save(studentUpdate);

      //CREAMOS DEUDA DE 20 SOLES
      const newEntryDebt = this.debtRepository.create({
        dateEnd: new Date(),
        total: 20,
        status: false,
        student: { id: createTransferDto.studentId },
        concept: { id: concept.id },
        description: student.code,
        code: `TRAS${student.code}`,
        obs: 'Traslado',
      });
      await this.debtRepository.save(newEntryDebt);
      return transfer;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAllByActivityClassroom(activityClassroomId: number) {
    const transfers = await this.repository.find({
      where: {
        student: {
          enrollment: { activityClassroom: { id: activityClassroomId } },
        },
      },
      select: {
        id: true,
        reason: true,
        transfersDate: true,
        schoolDestination: true,
        district: true,
        status: true,
        student: {
          id: true,
          person: {
            id: true,
            docNumber: true,
            name: true,
            lastname: true,
            mLastname: true,
          },
        },
      },
      relations: {
        student: {
          person: true,
        },
      },
    });
    const transfersWithCityNames = await Promise.all(
      transfers.map(async (transfer) => {
        const cityData = await this.getCites(transfer.district);
        return {
          ...transfer,
          location: {
            districtName: cityData.district,
            provinceName: cityData.province,
            regionName: cityData.region,
          },
        };
      }),
    );

    return transfersWithCityNames;
    return transfers;
  }
  // TODO revisar utilidad
  async findAllByTransfer(id: number) {
    const Transfers = await this.repository.find({
      where: {
        id,
      },
      select: {
        id: true,
        schoolDestination: true,
        district: true,
        reason: true,
        transfersDate: true,
        status: true,
        student: {
          id: true,
          person: {
            id: true,
            docNumber: true,
            name: true,
            lastname: true,
            mLastname: true,
          },
        },
      },
      order: {
        id: 'DESC',
      },
    });

    return Transfers;
  }
  // async findOne(term: string) {
  //   // const Transfer = await this.TransferRepository.findOneBy({
  //   //   name: term,
  //   // });
  //   // let Transfer: Transfer;
  //   const queryBuilder = this.repository.createQueryBuilder('Transfer');
  //   const Transfer = await queryBuilder
  //     .where(`name=:name or transfer.id=:id`, {
  //       id: term,
  //       name: term,
  //     })
  //     .leftJoinAndSelect('Transfer.phase', 'TransferPhase')
  //     .addOrderBy('Transfer.id', 'DESC')
  //     .getOne();
  //   if (!Transfer) throw new NotFoundException(`Transfer with term ${term} not found`);

  //   return [Transfer];
  // }

  async update(id: number, updateTransferDto: UpdateTransferDto) {
    const transfer = await this.repository.preload({
      id: id,
      ...updateTransferDto,
    });
    if (!transfer)
      throw new NotFoundException(`Transfer with id: ${id} not found`);
    try {
      await this.repository.save(transfer);
      return transfer;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: number) {
    // if (!Transfer) throw new NotFoundException(`Transfer by id: '${id}' not found`);
    try {
      const transfer = await this.repository.findOneByOrFail({ id });
      await this.repository.remove(transfer);
    } catch (error) {
      // handleDBExceptions(error, this.logger);
      // this.logger.error(error);
      throw new BadRequestException(error.message);
    }

    // return `This action removes a #${id} Transfer`;
  }
  async exist(id: number) {
    const existCampus = await this.repository.findOneBy({ id });
    return !!existCampus;
  }
  async getCites(idDistrict: string) {
    //OBTENER TODOS LOS DISTRITOS
    const url = this.configService.get('API_ADMISION');
    try {
      const dataDistrict = await firstValueFrom(
        this.httpService.get(`${url}/cities/district`),
      );
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
}
