import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTreasuryDto } from './dto/create-treasury.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Debt } from './entities/debt.entity';
import { Repository } from 'typeorm';
import { Family } from 'src/family/entities/family.entity';
import axios from 'axios';
import { Payment } from './entities/payment.entity';
import { Bill } from './entities/bill.entity';
import { Correlative } from './entities/correlative.entity';

import { Status } from 'src/enrollment/enum/status.enum';

@Injectable()
export class TreasuryService {
  private readonly apiUrl = process.env.NUBEFACT_API_URL;
  private readonly apiToken = process.env.NUBEFACT_TOKEN;
  private readonly logger = new Logger('TreasuryService');
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(Family)
    private readonly familyRepository: Repository<Family>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(Correlative)
    private readonly correlativeRepository: Repository<Correlative>,
  ) {}

  async createPaid(
    createTreasuryDto: CreateTreasuryDto,
    debtId: number,
    user: any,
  ) {
    const debt = await this.debtRepository.findOne({
      where: {
        id: debtId,
        student: {
          enrollment: {
            // student: { id: debt.student.id },
            status: Status.PREMATRICULADO,
          },
        },
      },
      relations: {
        concept: true,
        student: {
          enrollment: {
            activityClassroom: {
              grade: {
                level: true,
              },
              classroom: true,
            },
          },
        },
      },
    });
    if (debt.status) {
      throw new BadRequestException('Deuda ya cancelada');
    }
    if (debt.student.enrollment.length === 0) {
      throw new NotFoundException('No tiene prematricula el estudiante');
    }
    const enrroll = debt.student.enrollment[0];
    const level = enrroll.activityClassroom.grade.level;
    const campus = enrroll.activityClassroom.classroom.campusDetail;
    const family = await this.familyRepository.findOne({
      where: {
        student: { id: debt.student.id },
      },
      relations: {
        respEconomic: true,
      },
    });

    const serie = `B${createTreasuryDto.paymentMethod}${campus.id}${level.id}`;

    const tipoComprobante = 'BOLETA';

    // Obtener el número correlativo
    const numero = await this.getCorrelative(tipoComprobante, 'BBB1');

    const client = family.respEconomic;
    const boletaData = {
      operacion: 'generar_comprobante',
      tipo_de_comprobante: 2, // 2: Boleta
      serie: 'BBB1', // Cambia según tu configuración
      numero: numero, // Número correlativo de la boleta
      sunat_transaction: 1,
      cliente_tipo_de_documento: 1, // 1: DNI
      cliente_numero_de_documento: client.docNumber,
      cliente_denominacion:
        client.name + ' ' + client.lastname + ' ' + client.mLastname,
      cliente_direccion: family.address,
      cliente_email: '',
      cliente_email_1: '',
      cliente_email_2: '',
      fecha_de_emision: new Date(),
      moneda: 1, // 1: Soles
      tipo_de_cambio: '',
      porcentaje_de_igv: 18.0,
      total_gravada: '',
      total_exonerada: debt.total,

      total_igv: 0,
      total: debt.total,
      observaciones: `Gracias por su compra. ${serie}`,
      items: [
        {
          unidad_de_medida: 'NIU',
          codigo: debt.concept.code,
          descripcion: debt.concept.description,
          cantidad: 1,
          valor_unitario: debt.total,
          precio_unitario: debt.total,
          descuento: '',
          subtotal: debt.total,
          tipo_de_igv: 8,
          igv: 0.0,
          total: debt.total,
          anticipo_regularizacion: false,
          anticipo_documento_serie: '',
          anticipo_documento_numero: '',
        },
      ],
    };

    try {
      const response = await axios.post(this.apiUrl, boletaData, {
        headers: {
          Authorization: `Token token=${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      const pay = this.paymentRepository.create({
        concept: { id: debt.concept.id },
        date: new Date(),
        status: true,
        total: debt.total,
        student: { id: debt.student.id },
        user: user.sub,
      });
      const newPay = await this.paymentRepository.save(pay);
      const bill = this.billRepository.create({
        date: new Date(),
        url: response.data.enlace_del_pdf,
        payment: { id: newPay.id },
        serie: response.data.enlace_del_pdf,
      });
      const newBill = await this.billRepository.save(bill);

      debt.status = true;
      await this.debtRepository.save(debt);
      return newBill;
    } catch (error) {
      await this.undoCorrelative(tipoComprobante, serie);
      this.logger.log(error);
      throw new HttpException(
        `Error al emitir la boleta: ${error.response?.data?.errors || error.message}`,
        error.response?.status || 500,
      );
    }
  }

  async findDebts(studentId: number) {
    const family = await this.familyRepository.findOne({
      where: {
        student: { id: studentId },
      },
      relations: {
        respEconomic: true,
      },
    });
    if (!family) {
      throw new NotFoundException('Don´t exist family for this student');
    }

    const debts = await this.debtRepository.find({
      where: {
        student: { id: studentId },
      },
      relations: {
        concept: true,
      },
    });
    const data = {
      debts: debts,
      resp: family.respEconomic || 'No hay reponsable económico ',
    };
    return data;
  }

  async getCorrelative(type: string, serie: string): Promise<number> {
    // Inicia una transacción
    return await this.correlativeRepository.manager.transaction(
      async (manager) => {
        // Busca el correlativo para el tipo de comprobante y serie
        let correlative = await manager.findOne(Correlative, {
          where: { type, serie },
        });

        if (!correlative) {
          // Si no existe, crea un nuevo registro con el número inicial
          correlative = manager.create(Correlative, { type, serie, numero: 1 });
          await manager.save(Correlative, correlative);
        } else {
          // Incrementa el número correlativo existente
          correlative.numero += 1;
          await manager.save(Correlative, correlative);
        }

        return correlative.numero;
      },
    );
  }

  async undoCorrelative(type: string, serie: string) {
    const correlative = await this.correlativeRepository.findOne({
      where: { type, serie },
    });
    if (correlative) {
      correlative.numero = correlative.numero - 1;
      await this.correlativeRepository.save(correlative);
    }
  }
}
